import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import Promotion from '../models/Promotion.js'

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, note, promoCode } = req.body

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' })
    }

    for (const item of cart.items) {
      if (item.variantId && item.product.hasVariants) {
        const variant = item.product.variants.find(v => v._id.toString() === item.variantId.toString())
        if (!variant) {
          return res.status(400).json({ message: `Biến thể không tồn tại cho sản phẩm "${item.product.name}"` })
        }
        if (variant.stock < item.quantity) {
          return res.status(400).json({ message: `Sản phẩm "${item.product.name} - ${variant.name}" không đủ hàng (còn ${variant.stock})` })
        }
      } else {
        if (item.product.stock < item.quantity) {
          return res.status(400).json({ message: `Sản phẩm "${item.product.name}" không đủ hàng (còn ${item.product.stock})` })
        }
      }
    }

    const items = cart.items.map(item => {
      let price = item.product.salePrice || item.product.price
      let variantName = item.variantName
      let variantId = item.variantId

      if (item.variantId && item.product.hasVariants) {
        const variant = item.product.variants.find(v => v._id.toString() === item.variantId.toString())
        if (variant) {
          price = variant.salePrice || variant.price || price
          variantName = variant.name
        }
      }

      return {
        product: item.product._id,
        variantId: variantId || null,
        variantName: variantName || null,
        name: item.product.name,
        price: price,
        quantity: item.quantity,
        image: item.product.images[0]
      }
    })

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const shippingFee = itemCount >= 2 ? 0 : 30000

    let finalDiscount = 0
    let validPromoCode = null

    if (promoCode) {
      const promotion = await Promotion.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      })

      if (!promotion) {
        return res.status(400).json({ message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' })
      }

      if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
        return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' })
      }

      if (subtotal < promotion.minOrder) {
        return res.status(400).json({
          message: `Đơn hàng tối thiểu ${promotion.minOrder.toLocaleString()}đ để áp dụng mã này`
        })
      }

      if (promotion.discountType === 'percent') {
        finalDiscount = (subtotal * promotion.discountValue) / 100
        if (promotion.maxDiscount && finalDiscount > promotion.maxDiscount) {
          finalDiscount = promotion.maxDiscount
        }
      } else {
        finalDiscount = Math.min(promotion.discountValue, subtotal)
      }

      validPromoCode = promotion.code
    }

    const totalAmount = subtotal - finalDiscount + shippingFee

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      shippingFee,
      discount: finalDiscount,
      promoCode: validPromoCode,
      note
    })

    for (const item of cart.items) {
      if (item.variantId && item.product.hasVariants) {
        await Product.findOneAndUpdate(
          { _id: item.product._id, 'variants._id': item.variantId },
          {
            $inc: {
              'variants.$.stock': -item.quantity,
              soldCount: item.quantity
            }
          }
        )
      } else {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity, soldCount: item.quantity }
        })
      }
    }

    if (validPromoCode) {
      await Promotion.findOneAndUpdate(
        { code: validPromoCode },
        { $inc: { usedCount: 1 } }
      )
    }

    await Cart.findOneAndDelete({ user: req.user._id })

    res.status(201).json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt')
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) {
      return res.status(404).json({ message: 'Khong tim thay don hang' })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body

    if (!cancelReason || cancelReason.trim() === '') {
      return res.status(400).json({ message: 'Vui lòng nhập lý do hủy đơn hàng' })
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' })
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Không thể hủy đơn hàng này' })
    }

    order.status = 'cancelled'
    order.cancelReason = cancelReason.trim()
    await order.save()

    for (const item of order.items) {
      if (item.variantId) {
        await Product.findOneAndUpdate(
          { _id: item.product, 'variants._id': item.variantId },
          {
            $inc: {
              'variants.$.stock': item.quantity,
              soldCount: -item.quantity
            }
          }
        )
      } else {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, soldCount: -item.quantity }
        })
      }
    }

    if (order.promoCode) {
      await Promotion.findOneAndUpdate(
        { code: order.promoCode, usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
      )
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id

    const totalSpent = await Order.aggregate([
      { $match: { user: userId, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])

    const ordersByStatus = await Order.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    const totalOrders = await Order.countDocuments({ user: userId })

    const recentOrders = await Order.find({ user: userId })
      .sort('-createdAt')
      .limit(5)
      .select('_id status totalAmount createdAt items')

    const now = new Date()
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const monthSpent = await Order.aggregate([
        {
          $match: {
            user: userId,
            status: 'delivered',
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])

      const monthOrders = await Order.countDocuments({
        user: userId,
        createdAt: { $gte: monthStart, $lte: monthEnd }
      })

      last6Months.push({
        month: monthStart.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        spent: monthSpent[0]?.total || 0,
        orders: monthOrders
      })
    }

    const topProducts = await Order.aggregate([
      { $match: { user: userId, status: 'delivered' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalQuantity: { $sum: '$items.quantity' },
          totalSpent: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ])

    res.json({
      totalSpent: totalSpent[0]?.total || 0,
      totalOrders,
      ordersByStatus,
      recentOrders,
      monthlyStats: last6Months,
      topProducts
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, note } = req.body

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Gio hang trong' })
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.salePrice || item.product.price,
      quantity: item.quantity,
      image: item.product.images[0]
    }))

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const shippingFee = itemCount >= 2 ? 0 : 30000

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount: totalAmount + shippingFee,
      shippingAddress,
      paymentMethod,
      shippingFee,
      note
    })

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, soldCount: item.quantity }
      })
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
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
    if (!order) {
      return res.status(404).json({ message: 'Khong tim thay don hang' })
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Khong the huy don hang nay' })
    }

    order.status = 'cancelled'
    await order.save()

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, soldCount: -item.quantity }
      })
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

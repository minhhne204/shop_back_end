import crypto from 'crypto'
import querystring from 'qs'
import vnpayConfig from '../config/vnpay.js'
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import Promotion from '../models/Promotion.js'

function sortObject(obj) {
  const sorted = {}
  const keys = Object.keys(obj).sort()
  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+')
  }
  return sorted
}

export const createPaymentUrl = async (req, res) => {
  try {
    const { shippingAddress, note, promoCode, discount } = req.body

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Gio hang trong' })
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
        return res.status(400).json({ message: `Đơn hàng tối thiểu ${promotion.minOrder.toLocaleString()}đ để áp dụng mã này` })
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
      paymentMethod: 'vnpay',
      paymentStatus: 'pending',
      shippingFee,
      discount: finalDiscount,
      promoCode: validPromoCode,
      note: note || ''
    })

    const date = new Date()
    const createDate = date.getFullYear().toString() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2)

    const orderId = order._id.toString()
    const amount = Math.round(totalAmount)
    const orderInfo = `Thanh toan don hang ${orderId}`
    const orderType = 'billpayment'
    const locale = 'vn'
    const currCode = 'VND'
    const ipAddr = req.headers['x-forwarded-for'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1'

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: locale,
      vnp_CurrCode: currCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: orderType,
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    }

    vnp_Params = sortObject(vnp_Params)

    const signData = querystring.stringify(vnp_Params, { encode: false })
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
    vnp_Params['vnp_SecureHash'] = signed

    const paymentUrl = vnpayConfig.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false })

    res.json({ paymentUrl, orderId: order._id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query
    const secureHash = vnp_Params['vnp_SecureHash']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params = sortObject(vnp_Params)

    const signData = querystring.stringify(vnp_Params, { encode: false })
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    const orderId = vnp_Params['vnp_TxnRef']
    const responseCode = vnp_Params['vnp_ResponseCode']

    if (secureHash !== signed) {
      return res.json({ success: false, message: 'Chữ ký không hợp lệ' })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    const expectedAmount = Math.round(order.totalAmount) * 100
    const receivedAmount = parseInt(vnp_Params['vnp_Amount'])
    if (expectedAmount !== receivedAmount) {
      return res.json({ success: false, message: 'Số tiền không khớp' })
    }

    if (responseCode === '00') {
      if (order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid'
        order.vnpayTransactionNo = vnp_Params['vnp_TransactionNo']
        order.vnpayBankCode = vnp_Params['vnp_BankCode']
        order.vnpayPayDate = vnp_Params['vnp_PayDate']
        await order.save()
      }

      return res.json({
        success: true,
        message: 'Thanh toán thành công',
        orderId: order._id
      })
    } else {
      if (order.paymentStatus === 'pending') {
        order.paymentStatus = 'failed'
        await order.save()
      }

      return res.json({
        success: false,
        message: getVnpayResponseMessage(responseCode),
        orderId: order._id
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const vnpayIPN = async (req, res) => {
  try {
    let vnp_Params = req.query
    const secureHash = vnp_Params['vnp_SecureHash']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params = sortObject(vnp_Params)

    const signData = querystring.stringify(vnp_Params, { encode: false })
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    if (secureHash === signed) {
      const orderId = vnp_Params['vnp_TxnRef']
      const responseCode = vnp_Params['vnp_ResponseCode']

      const order = await Order.findById(orderId)

      if (!order) {
        return res.json({ RspCode: '01', Message: 'Order not found' })
      }

      if (order.paymentStatus === 'paid') {
        return res.json({ RspCode: '02', Message: 'Order already confirmed' })
      }

      const expectedAmount = order.totalAmount * 100
      const receivedAmount = parseInt(vnp_Params['vnp_Amount'])

      if (expectedAmount !== receivedAmount) {
        return res.json({ RspCode: '04', Message: 'Invalid amount' })
      }

      if (responseCode === '00') {
        order.paymentStatus = 'paid'
        order.vnpayTransactionNo = vnp_Params['vnp_TransactionNo']
        order.vnpayBankCode = vnp_Params['vnp_BankCode']
        order.vnpayPayDate = vnp_Params['vnp_PayDate']
        await order.save()

        for (const item of order.items) {
          if (item.variantId) {
            await Product.findOneAndUpdate(
              { _id: item.product, 'variants._id': item.variantId },
              {
                $inc: {
                  'variants.$.stock': -item.quantity,
                  soldCount: item.quantity
                }
              }
            )
          } else {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.quantity, soldCount: item.quantity }
            })
          }
        }

        await Cart.findOneAndDelete({ user: order.user })

        if (order.promoCode) {
          await Promotion.findOneAndUpdate(
            { code: order.promoCode },
            { $inc: { usedCount: 1 } }
          )
        }

        return res.json({ RspCode: '00', Message: 'Confirm Success' })
      } else {
        order.paymentStatus = 'failed'
        await order.save()
        return res.json({ RspCode: '00', Message: 'IPN Received' })
      }
    } else {
      return res.json({ RspCode: '97', Message: 'Invalid signature' })
    }
  } catch (error) {
    return res.json({ RspCode: '99', Message: 'Unknown error' })
  }
}

function getVnpayResponseMessage(code) {
  const messages = {
    '00': 'Giao dich thanh cong',
    '07': 'Tru tien thanh cong. Giao dich bi nghi ngo',
    '09': 'Giao dich khong thanh cong: The/Tai khoan chua dang ky dich vu InternetBanking',
    '10': 'Giao dich khong thanh cong: Khach hang xac thuc thong tin khong dung qua 3 lan',
    '11': 'Giao dich khong thanh cong: Da het han cho thanh toan',
    '12': 'Giao dich khong thanh cong: The/Tai khoan bi khoa',
    '13': 'Giao dich khong thanh cong: Nhap sai mat khau OTP',
    '24': 'Giao dich khong thanh cong: Khach hang huy giao dich',
    '51': 'Giao dich khong thanh cong: Tai khoan khong du so du',
    '65': 'Giao dich khong thanh cong: Tai khoan da vuot qua han muc giao dich trong ngay',
    '75': 'Ngan hang thanh toan dang bao tri',
    '79': 'Giao dich khong thanh cong: Nhap sai mat khau thanh toan qua so lan quy dinh',
    '99': 'Loi khong xac dinh'
  }
  return messages[code] || 'Loi khong xac dinh'
}

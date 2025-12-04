import PreOrder from '../models/PreOrder.js'
import PreOrderRegistration from '../models/PreOrderRegistration.js'
import Product from '../models/Product.js'

export const getActivePreOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const skip = (page - 1) * limit

    const query = { isActive: true }

    const total = await PreOrder.countDocuments(query)
    const preOrders = await PreOrder.find(query)
      .populate({
        path: 'product',
        select: 'name slug price salePrice images status category brand',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)

    res.json({
      preOrders,
      page,
      totalPages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPreOrderBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    }

    const preOrder = await PreOrder.findOne({ product: product._id, isActive: true })
      .populate({
        path: 'product',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'brand', select: 'name' }
        ]
      })

    if (!preOrder) {
      return res.status(404).json({ message: 'Không có đợt pre-order cho sản phẩm này' })
    }

    res.json(preOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const registerPreOrder = async (req, res) => {
  try {
    const { preOrderId, quantity, note } = req.body

    const preOrder = await PreOrder.findById(preOrderId)
    if (!preOrder) {
      return res.status(404).json({ message: 'Không tìm thấy đợt pre-order' })
    }

    if (!preOrder.isActive) {
      return res.status(400).json({ message: 'Đợt pre-order này đã đóng' })
    }

    const existingRegistration = await PreOrderRegistration.findOne({
      preOrder: preOrderId,
      user: req.user._id
    })

    if (existingRegistration) {
      return res.status(400).json({ message: 'Bạn đã đăng ký pre-order sản phẩm này rồi' })
    }

    const totalRegistered = await PreOrderRegistration.aggregate([
      { $match: { preOrder: preOrder._id, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ])

    const currentTotal = totalRegistered[0]?.total || 0
    if (currentTotal + quantity > preOrder.quantity) {
      return res.status(400).json({
        message: `Số lượng vượt quá giới hạn. Còn lại ${preOrder.quantity - currentTotal} suất`
      })
    }

    const registration = await PreOrderRegistration.create({
      preOrder: preOrderId,
      user: req.user._id,
      quantity,
      note
    })

    await PreOrder.findByIdAndUpdate(preOrderId, {
      currentOrders: currentTotal + quantity
    })

    const populated = await PreOrderRegistration.findById(registration._id)
      .populate({
        path: 'preOrder',
        populate: { path: 'product', select: 'name images price' }
      })

    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getMyPreOrders = async (req, res) => {
  try {
    const registrations = await PreOrderRegistration.find({ user: req.user._id })
      .populate({
        path: 'preOrder',
        populate: { path: 'product', select: 'name slug images price salePrice' }
      })
      .sort('-createdAt')

    res.json(registrations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const cancelPreOrderRegistration = async (req, res) => {
  try {
    const registration = await PreOrderRegistration.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!registration) {
      return res.status(404).json({ message: 'Không tìm thấy đăng ký pre-order' })
    }

    if (registration.status === 'confirmed') {
      return res.status(400).json({ message: 'Không thể hủy đăng ký đã được xác nhận' })
    }

    registration.status = 'cancelled'
    await registration.save()

    const totalRegistered = await PreOrderRegistration.aggregate([
      { $match: { preOrder: registration.preOrder, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ])

    await PreOrder.findByIdAndUpdate(registration.preOrder, {
      currentOrders: totalRegistered[0]?.total || 0
    })

    res.json({ message: 'Đã hủy đăng ký pre-order' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const checkUserRegistration = async (req, res) => {
  try {
    const registration = await PreOrderRegistration.findOne({
      preOrder: req.params.preOrderId,
      user: req.user._id,
      status: { $ne: 'cancelled' }
    })

    res.json({ registered: !!registration, registration })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

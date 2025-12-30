import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Brand from '../models/Brand.js'
import Order from '../models/Order.js'
import User from '../models/User.js'
import Blog from '../models/Blog.js'
import Promotion from '../models/Promotion.js'
import Banner from '../models/Banner.js'
import Policy from '../models/Policy.js'
import PreOrder from '../models/PreOrder.js'
import PreOrderRegistration from '../models/PreOrderRegistration.js'

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export const createProduct = async (req, res) => {
  try {
    const slug = slugify(req.body.name)
    const product = await Product.create({ ...req.body, slug })
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('brand', 'name')
    if (!product) {
      return res.status(404).json({ message: 'Khong tim thay san pham' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateProduct = async (req, res) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name)
    }
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'Da xoa san pham' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const query = {}

    if (req.query.category) {
      query.category = req.query.category
    }

    if (req.query.brand) {
      query.brand = req.query.brand
    }

    if (req.query.status) {
      query.status = req.query.status
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    let sortOption = '-createdAt'
    if (req.query.sort) {
      sortOption = req.query.sort
    }

    const total = await Product.countDocuments(query)
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)

    res.json({
      products,
      page,
      totalPages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createCategory = async (req, res) => {
  try {
    const slug = slugify(req.body.name)
    const category = await Category.create({ ...req.body, slug })
    res.status(201).json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateCategory = async (req, res) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name)
    }
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(category)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id)
    res.json({ message: 'Da xoa danh muc' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createBrand = async (req, res) => {
  try {
    const slug = slugify(req.body.name)
    const brand = await Brand.create({ ...req.body, slug })
    res.status(201).json(brand)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateBrand = async (req, res) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name)
    }
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(brand)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteBrand = async (req, res) => {
  try {
    await Brand.findByIdAndDelete(req.params.id)
    res.json({ message: 'Da xoa thuong hieu' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const query = {}

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status
    }

    if (req.query.search) {
      query.$or = [
        { _id: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const total = await Order.countDocuments(query)
    const orders = await Order.find(query)
      .populate('user', 'fullName email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)

    res.json({
      orders,
      page,
      totalPages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const query = {}

    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role
    }

    if (req.query.search) {
      query.$or = [
        { fullName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const total = await User.countDocuments(query)
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)

    res.json({
      users,
      page,
      totalPages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createBlog = async (req, res) => {
  try {
    const slug = slugify(req.body.title)
    const blog = await Blog.create({ ...req.body, slug, author: req.user._id })
    res.status(201).json(blog)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateBlog = async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title)
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(blog)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id)
    res.json({ message: 'Da xoa bai viet' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const query = {}

    if (req.query.published !== undefined) {
      query.published = req.query.published === 'true'
    }

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { excerpt: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const total = await Blog.countDocuments(query)
    const blogs = await Blog.find(query)
      .populate('author', 'fullName')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)

    res.json({
      blogs,
      page,
      totalPages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.create(req.body)
    res.status(201).json(promotion)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(promotion)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deletePromotion = async (req, res) => {
  try {
    await Promotion.findByIdAndDelete(req.params.id)
    res.json({ message: 'Da xoa khuyen mai' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort('-createdAt')
    res.json(promotions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create(req.body)
    res.status(201).json(banner)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(banner)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id)
    res.json({ message: 'Da xoa banner' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllBanners = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const query = {}

    if (req.query.position && req.query.position !== 'all') {
      query.position = req.query.position
    }

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const total = await Banner.countDocuments(query)
    const banners = await Banner.find(query)
      .sort('order')
      .skip(skip)
      .limit(limit)

    res.json({
      banners,
      page,
      totalPages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createPolicy = async (req, res) => {
  try {
    const policy = await Policy.create(req.body)
    res.status(201).json(policy)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updatePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(policy)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const now = new Date()
    let filterStart, filterEnd

    if (startDate && endDate) {
      filterStart = new Date(startDate)
      filterStart.setHours(0, 0, 0, 0)
      filterEnd = new Date(endDate)
      filterEnd.setHours(23, 59, 59, 999)
    } else {
      filterStart = new Date(now.getFullYear(), now.getMonth(), 1)
      filterEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const revenueThisMonth = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])

    const ordersThisMonth = await Order.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    })

    const totalProducts = await Product.countDocuments()
    const totalUsers = await User.countDocuments()

    const topProducts = await Product.find()
      .sort('-soldCount')
      .limit(10)
      .select('name soldCount price salePrice images stock')

    const lowStock = await Product.find({ stock: { $lt: 10 } })
      .select('name stock images')

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const dayRevenue = await Order.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: { $gte: date, $lt: nextDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])

      const dayOrders = await Order.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      })

      last7Days.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue[0]?.total || 0,
        orders: dayOrders
      })
    }

    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

      const monthRevenue = await Order.aggregate([
        {
          $match: {
            status: 'delivered',
            createdAt: { $gte: monthStart, $lte: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])

      const monthOrders = await Order.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      })

      last6Months.push({
        month: monthStart.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue[0]?.total || 0,
        orders: monthOrders
      })
    }

    const totalRevenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])

    const totalOrders = await Order.countDocuments()

    const filteredRevenue = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: filterStart, $lte: filterEnd }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])

    const filteredOrders = await Order.countDocuments({
      createdAt: { $gte: filterStart, $lte: filterEnd }
    })

    const filteredDeliveredOrders = await Order.countDocuments({
      status: 'delivered',
      createdAt: { $gte: filterStart, $lte: filterEnd }
    })

    const filteredCancelledOrders = await Order.countDocuments({
      status: 'cancelled',
      createdAt: { $gte: filterStart, $lte: filterEnd }
    })

    const filteredTopProducts = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: filterStart, $lte: filterEnd }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ])

    const filteredCategoryStats = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: filterStart, $lte: filterEnd }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryInfo._id',
          name: { $first: '$categoryInfo.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ])

    const categoryStats = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$categoryInfo._id',
          name: { $first: '$categoryInfo.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ])

    res.json({
      revenue: {
        thisMonth: revenueThisMonth[0]?.total || 0,
        total: totalRevenue[0]?.total || 0,
        filtered: filteredRevenue[0]?.total || 0
      },
      orders: {
        thisMonth: ordersThisMonth,
        total: totalOrders,
        filtered: filteredOrders,
        filteredDelivered: filteredDeliveredOrders,
        filteredCancelled: filteredCancelledOrders
      },
      products: {
        total: totalProducts
      },
      users: {
        total: totalUsers
      },
      topProducts,
      lowStock,
      ordersByStatus,
      dailyStats: last7Days,
      monthlyStats: last6Months,
      categoryStats,
      filteredTopProducts,
      filteredCategoryStats,
      dateRange: {
        start: filterStart.toISOString(),
        end: filterEnd.toISOString()
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllPreOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await PreOrder.countDocuments()
    const preOrders = await PreOrder.find()
      .populate('product', 'name images price')
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

export const createPreOrder = async (req, res) => {
  try {
    const preOrder = await PreOrder.create(req.body)
    const populated = await PreOrder.findById(preOrder._id).populate('product', 'name images price')
    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updatePreOrder = async (req, res) => {
  try {
    const preOrder = await PreOrder.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('product', 'name images price')
    res.json(preOrder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deletePreOrder = async (req, res) => {
  try {
    await PreOrder.findByIdAndDelete(req.params.id)
    await PreOrderRegistration.deleteMany({ preOrder: req.params.id })
    res.json({ message: 'Đã xóa đợt hàng' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPreOrderRegistrations = async (req, res) => {
  try {
    const registrations = await PreOrderRegistration.find({ preOrder: req.params.id })
      .populate('user', 'fullName email phone')
      .sort('-createdAt')

    res.json(registrations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateRegistrationStatus = async (req, res) => {
  try {
    const registration = await PreOrderRegistration.findByIdAndUpdate(
      req.params.registrationId,
      { status: req.body.status },
      { new: true }
    ).populate('user', 'fullName email phone')

    const totalRegistered = await PreOrderRegistration.aggregate([
      { $match: { preOrder: registration.preOrder, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ])

    await PreOrder.findByIdAndUpdate(registration.preOrder, {
      currentOrders: totalRegistered[0]?.total || 0
    })

    res.json(registration)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .populate('items.product', 'name images price')
      .sort('-createdAt')
      .limit(20)

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

import Product from '../models/Product.js'

export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      status,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      search
    } = req.query

    const query = { isActive: true }

    if (category) query.category = category
    if (brand) query.brand = brand
    if (status) query.status = status
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }
    if (search) {
      query.$text = { $search: search }
    }

    const total = await Product.countDocuments(query)
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({
      products,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug')

    if (!product) {
      return res.status(404).json({ message: 'Khong tim thay san pham' })
    }

    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .limit(8)

    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPreorderProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'preorder', isActive: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug')

    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
    if (!product) {
      return res.status(404).json({ message: 'Khong tim thay san pham' })
    }

    const products = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .limit(4)

    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

import Brand from '../models/Brand.js'

export const getBrands = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const query = { isActive: true }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ]
    }

    const total = await Brand.countDocuments(query)
    const brands = await Brand.find(query)
      .sort('name')
      .skip(skip)
      .limit(limit)

    res.json({
      brands,
      page,
      totalPages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getBrandBySlug = async (req, res) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug, isActive: true })
    if (!brand) {
      return res.status(404).json({ message: 'Khong tim thay thuong hieu' })
    }
    res.json(brand)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

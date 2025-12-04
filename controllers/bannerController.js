import Banner from '../models/Banner.js'

export const getBanners = async (req, res) => {
  try {
    const { position } = req.query
    const query = { isActive: true }
    if (position) query.position = position

    const banners = await Banner.find(query).sort('order')
    res.json(banners)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

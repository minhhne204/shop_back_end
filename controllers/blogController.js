import Blog from '../models/Blog.js'

export const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const total = await Blog.countDocuments({ isPublished: true })
    const blogs = await Blog.find({ isPublished: true })
      .populate('author', 'fullName')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.json({
      blogs,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true })
      .populate('author', 'fullName')

    if (!blog) {
      return res.status(404).json({ message: 'Khong tim thay bai viet' })
    }

    res.json(blog)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

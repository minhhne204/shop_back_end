import Review from '../models/Review.js'
import Product from '../models/Product.js'

export const getProductReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const product = await Product.findOne({ slug: req.params.slug })
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    }

    const total = await Review.countDocuments({ product: product._id })
    const reviews = await Review.find({ product: product._id })
      .populate('user', 'fullName')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)

    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ])

    res.json({
      reviews,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      stats: stats[0] || {
        avgRating: 0,
        totalReviews: 0,
        rating5: 0,
        rating4: 0,
        rating3: 0,
        rating2: 0,
        rating1: 0
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createReview = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    }

    const existingReview = await Review.findOne({
      product: product._id,
      user: req.user._id
    })

    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' })
    }

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment,
      images: req.body.images || []
    })

    const populatedReview = await Review.findById(review._id).populate('user', 'fullName')

    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ])

    await Product.findByIdAndUpdate(product._id, {
      ratings: {
        average: stats[0]?.avgRating || 0,
        count: await Review.countDocuments({ product: product._id })
      }
    })

    res.status(201).json(populatedReview)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' })
    }

    review.rating = req.body.rating || review.rating
    review.comment = req.body.comment || review.comment
    review.images = req.body.images || review.images

    await review.save()

    const stats = await Review.aggregate([
      { $match: { product: review.product } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ])

    await Product.findByIdAndUpdate(review.product, {
      'ratings.average': stats[0]?.avgRating || 0
    })

    const populatedReview = await Review.findById(review._id).populate('user', 'fullName')
    res.json(populatedReview)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' })
    }

    const productId = review.product
    await review.deleteOne()

    const stats = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ])

    await Product.findByIdAndUpdate(productId, {
      ratings: {
        average: stats[0]?.avgRating || 0,
        count: await Review.countDocuments({ product: productId })
      }
    })

    res.json({ message: 'Đã xóa đánh giá' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

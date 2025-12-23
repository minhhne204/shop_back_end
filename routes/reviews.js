import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  canReview
} from '../controllers/reviewController.js'

const router = express.Router()

router.get('/products/:slug/reviews', getProductReviews)
router.get('/products/:slug/can-review', protect, canReview)
router.post('/products/:slug/reviews', protect, createReview)
router.put('/reviews/:id', protect, updateReview)
router.delete('/reviews/:id', protect, deleteReview)

export default router

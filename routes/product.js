import express from 'express'
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getPreorderProducts,
  getRelatedProducts
} from '../controllers/productController.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/preorder', getPreorderProducts)
router.get('/:slug', getProductBySlug)
router.get('/:slug/related', getRelatedProducts)

export default router

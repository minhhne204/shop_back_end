import express from 'express'
import { applyPromotion } from '../controllers/promotionController.js'

const router = express.Router()

router.post('/apply', applyPromotion)

export default router

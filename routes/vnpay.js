import express from 'express'
import { createPaymentUrl, vnpayReturn, vnpayIPN } from '../controllers/vnpayController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/create-payment', protect, createPaymentUrl)
router.get('/vnpay-return', vnpayReturn)
router.get('/vnpay-ipn', vnpayIPN)

export default router

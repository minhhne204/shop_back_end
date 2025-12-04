import express from 'express'
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  getUserStats
} from '../controllers/orderController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, createOrder)
router.get('/stats', protect, getUserStats)
router.get('/', protect, getOrders)
router.get('/:id', protect, getOrderById)
router.put('/:id/cancel', protect, cancelOrder)

export default router

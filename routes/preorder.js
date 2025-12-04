import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getActivePreOrders,
  getPreOrderBySlug,
  registerPreOrder,
  getMyPreOrders,
  cancelPreOrderRegistration,
  checkUserRegistration
} from '../controllers/preOrderController.js'

const router = express.Router()

router.get('/', getActivePreOrders)
router.get('/product/:slug', getPreOrderBySlug)
router.get('/my-registrations', protect, getMyPreOrders)
router.post('/register', protect, registerPreOrder)
router.get('/check/:preOrderId', protect, checkUserRegistration)
router.delete('/registration/:id', protect, cancelPreOrderRegistration)

export default router

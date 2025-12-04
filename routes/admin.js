import express from 'express'
import { protect, admin } from '../middleware/auth.js'
import {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  createBrand,
  updateBrand,
  deleteBrand,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  getUserOrders,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getAllPromotions,
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
  createPolicy,
  updatePolicy,
  getReports,
  getAllPreOrders,
  createPreOrder,
  updatePreOrder,
  deletePreOrder,
  getPreOrderRegistrations,
  updateRegistrationStatus
} from '../controllers/adminController.js'

const router = express.Router()

router.use(protect, admin)

router.route('/products')
  .get(getAllProducts)
  .post(createProduct)

router.route('/products/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct)

router.route('/categories')
  .post(createCategory)

router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory)

router.route('/brands')
  .post(createBrand)

router.route('/brands/:id')
  .put(updateBrand)
  .delete(deleteBrand)

router.route('/orders')
  .get(getAllOrders)

router.route('/orders/:id/status')
  .put(updateOrderStatus)

router.route('/users')
  .get(getAllUsers)

router.route('/users/:id/role')
  .put(updateUserRole)

router.get('/users/:userId/orders', getUserOrders)

router.route('/blogs')
  .get(getAllBlogs)
  .post(createBlog)

router.route('/blogs/:id')
  .put(updateBlog)
  .delete(deleteBlog)

router.route('/promotions')
  .get(getAllPromotions)
  .post(createPromotion)

router.route('/promotions/:id')
  .put(updatePromotion)
  .delete(deletePromotion)

router.route('/banners')
  .get(getAllBanners)
  .post(createBanner)

router.route('/banners/:id')
  .put(updateBanner)
  .delete(deleteBanner)

router.route('/policies')
  .post(createPolicy)

router.route('/policies/:id')
  .put(updatePolicy)

router.route('/preorders')
  .get(getAllPreOrders)
  .post(createPreOrder)

router.route('/preorders/:id')
  .put(updatePreOrder)
  .delete(deletePreOrder)

router.get('/preorders/:id/registrations', getPreOrderRegistrations)
router.put('/preorders/registrations/:registrationId', updateRegistrationStatus)

router.get('/reports', getReports)

export default router

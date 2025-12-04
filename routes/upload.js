import express from 'express'
import { protect, admin } from '../middleware/auth.js'
import { uploadSingle, uploadMultiple } from '../middleware/upload.js'
import { uploadImage, uploadImages, deleteImage } from '../controllers/uploadController.js'

const router = express.Router()

router.post('/single', protect, admin, uploadSingle, uploadImage)
router.post('/multiple', protect, admin, uploadMultiple, uploadImages)
router.delete('/:publicId', protect, admin, deleteImage)

export default router

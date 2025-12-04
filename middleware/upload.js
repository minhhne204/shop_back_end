import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gameforge',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
  }
})

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
})

export const uploadSingle = upload.single('image')
export const uploadMultiple = upload.array('images', 10)

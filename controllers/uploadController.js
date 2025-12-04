import cloudinary from '../config/cloudinary.js'

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Khong co file duoc upload' })
    }

    res.json({
      url: req.file.path,
      publicId: req.file.filename
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Khong co file duoc upload' })
    }

    const urls = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }))

    res.json(urls)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params

    await cloudinary.uploader.destroy(publicId)

    res.json({ message: 'Da xoa hinh anh' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

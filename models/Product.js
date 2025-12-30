import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: null
  },
  salePrice: {
    type: Number,
    default: null
  },
  stock: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true
  },
  salePrice: {
    type: Number,
    default: null
  },
  images: [{
    type: String
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'order', 'preorder'],
    default: 'available'
  },
  stock: {
    type: Number,
    default: 0
  },
  hasVariants: {
    type: Boolean,
    default: false
  },
  variantType: {
    type: String,
    default: ''
  },
  variants: [variantSchema],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  soldCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

productSchema.index({ name: 'text', description: 'text' })

export default mongoose.model('Product', productSchema)

import mongoose from 'mongoose'

const preOrderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  expectedDate: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  currentOrders: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

export default mongoose.model('PreOrder', preOrderSchema)

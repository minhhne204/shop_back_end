import mongoose from 'mongoose'

const preOrderRegistrationSchema = new mongoose.Schema({
  preOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PreOrder',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  note: {
    type: String,
    default: ''
  }
}, { timestamps: true })

preOrderRegistrationSchema.index({ preOrder: 1, user: 1 }, { unique: true })

export default mongoose.model('PreOrderRegistration', preOrderRegistrationSchema)

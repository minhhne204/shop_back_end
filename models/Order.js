import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    variantName: {
      type: String,
      default: null
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    ward: String,
    district: String,
    city: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'banking', 'vnpay'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  vnpayTransactionNo: {
    type: String,
    default: null
  },
  vnpayBankCode: {
    type: String,
    default: null
  },
  vnpayPayDate: {
    type: String,
    default: null
  },
  promoCode: {
    type: String,
    default: null
  },
  discount: {
    type: Number,
    default: 0
  },
  cancelReason: {
    type: String,
    default: ''
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  note: {
    type: String,
    default: ''
  }
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)

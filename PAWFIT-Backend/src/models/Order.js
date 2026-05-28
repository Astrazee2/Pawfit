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
      ref: 'Product'
    },
    size: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    province: String,
    zipCode: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'GCash', 'PayPal'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentId: String,
  paymentDetails: {
    transactionId: String,
    provider: String,
    paidAt: Date
  }
}, {
  timestamps: true
})

export default mongoose.model('Order', orderSchema)
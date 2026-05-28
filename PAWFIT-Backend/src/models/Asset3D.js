import mongoose from 'mongoose'

const asset3DSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['avatar', 'apparel'],
    required: true
  },
  breed: {
    type: String,
    enum: ['Labrador Retriever', 'Shih Tzu', 'Dachshund', 'Pomeranian', 'Aspin/Mixed']
  },
  apparelType: {
    type: String,
    enum: ['Shirt', 'Coat', 'Sweater', 'Hoodie']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: String,
  fileSize: Number,
  format: {
    type: String,
    enum: ['glb', 'gltf'],
    default: 'glb'
  },
  thumbnailUrl: String,
  scale: {
    type: Number,
    default: 1
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  rotation: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  tags: [String],
  compatible: [String]
}, {
  timestamps: true
})

asset3DSchema.index({ type: 1, breed: 1 })
asset3DSchema.index({ type: 1, apparelType: 1 })
asset3DSchema.index({ productId: 1 })
asset3DSchema.index({ tags: 1 })

export default mongoose.model('Asset3D', asset3DSchema)

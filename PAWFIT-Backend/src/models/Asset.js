import mongoose from 'mongoose'

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['product', 'body'],
      required: true,
    },
    breed: {
      type: String,
      enum: [
        'Labrador Retriever',
        'Shih Tzu',
        'Dachshund',
        'Pomeranian',
        'Aspin/Mixed',
        '',
      ],
      default: '',
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('Asset', assetSchema)

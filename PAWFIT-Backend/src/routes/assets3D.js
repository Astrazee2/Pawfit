import express from 'express'
import {
  getAssets,
  getAssetById,
  getAssetsByTypeAndBreed,
  createAsset,
  updateAsset,
  deleteAsset,
  getCompatibleApparel,
  checkCompatibility
} from '../controllers/asset3DController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

// Public specific routes (must come before /:id)
router.get('/type-breed/:type/:breed', getAssetsByTypeAndBreed)
router.get('/compatible/:breed', getCompatibleApparel)

// Compatibility check
router.post('/check-compatibility', checkCompatibility)

// General public routes
router.get('/', getAssets)
router.get('/:id', getAssetById)

// Admin routes
router.post('/', protect, createAsset)
router.put('/:id', protect, updateAsset)
router.delete('/:id', protect, deleteAsset)

export default router

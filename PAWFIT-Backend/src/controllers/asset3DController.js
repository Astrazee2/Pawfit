import Asset3D from '../models/Asset3D.js'

// Get all 3D assets
export const getAssets = async (req, res) => {
  try {
    const { type, breed, apparelType, productId } = req.query
    const filter = { isActive: true }

    if (type) filter.type = type
    if (breed) filter.breed = breed
    if (apparelType) filter.apparelType = apparelType
    if (productId) filter.productId = productId

    const assets = await Asset3D.find(filter)
      .populate('productId', 'name price')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })

    res.json(assets)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get single 3D asset
export const getAssetById = async (req, res) => {
  try {
    const asset = await Asset3D.findById(req.params.id)
      .populate('productId', 'name price')
      .populate('uploadedBy', 'name')

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' })
    }

    res.json(asset)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get assets by type and breed (for 3D viewer)
export const getAssetsByTypeAndBreed = async (req, res) => {
  try {
    const { type, breed } = req.params
    const assets = await Asset3D.find({
      type,
      breed,
      isActive: true
    }).populate('productId')

    res.json(assets)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Create 3D asset (admin only)
export const createAsset = async (req, res) => {
  try {
    const { name, description, type, breed, apparelType, productId, fileUrl, fileName, fileSize, format, thumbnailUrl, scale, position, rotation, tags, compatible, preCombinedInfo } = req.body

    const asset = await Asset3D.create({
      name,
      description,
      type,
      breed,
      apparelType,
      productId,
      fileUrl,
      fileName,
      fileSize,
      format: format || 'glb',
      thumbnailUrl,
      scale: scale || 1,
      position: position || { x: 0, y: 0, z: 0 },
      rotation: rotation || { x: 0, y: 0, z: 0 },
      uploadedBy: req.user.id,
      tags,
      compatible,
      preCombinedInfo
    })

    res.status(201).json(asset)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Update 3D asset (admin only)
export const updateAsset = async (req, res) => {
  try {
    const { name, description, scale, position, rotation, tags, compatible, isActive, preCombinedInfo } = req.body

    const asset = await Asset3D.findByIdAndUpdate(
      req.params.id,
      { name, description, scale, position, rotation, tags, compatible, isActive, preCombinedInfo },
      { new: true }
    )

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' })
    }

    res.json(asset)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Delete 3D asset (admin only)
export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset3D.findByIdAndDelete(req.params.id)

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' })
    }

    res.json({ message: 'Asset deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get compatible apparel for a breed avatar
export const getCompatibleApparel = async (req, res) => {
  try {
    const { breed } = req.params

    const apparel = await Asset3D.find({
      type: 'apparel',
      isActive: true,
      $or: [
        { compatible: { $in: [breed] } },
        { compatible: [] }
      ]
    }).populate('productId', 'name price apparelType')

    res.json(apparel)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Check if apparel is compatible with breed
export const checkCompatibility = async (req, res) => {
  try {
    const { apparelId, breed } = req.body

    const apparel = await Asset3D.findById(apparelId)

    if (!apparel) {
      return res.status(404).json({ message: 'Apparel not found' })
    }

    const isCompatible = apparel.compatible.length === 0 || apparel.compatible.includes(breed)

    res.json({
      compatible: isCompatible,
      apparel: apparel.name,
      breed
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

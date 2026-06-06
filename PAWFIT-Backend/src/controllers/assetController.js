import fs from 'fs/promises'
import path from 'path'
import Asset from '../models/Asset.js'

const ASSET_BASE_PATH = '/uploads/3d-assets'

const buildAssetUrl = (req, fileName) => `${req.protocol}://${req.get('host')}${ASSET_BASE_PATH}/${fileName}`

const removeFileIfExists = async (fileName) => {
  if (!fileName) return
  const filePath = path.resolve('uploads', '3d-assets', fileName)
  try {
    await fs.unlink(filePath)
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
}

export const getAssets = async (req, res) => {
  try {
    const { type, breed } = req.query
    const filter = {}

    if (type) filter.type = type
    if (breed) filter.breed = breed

    const assets = await Asset.find(filter).sort({ createdAt: -1 })
    res.json(assets)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' })
    }
    res.json(asset)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export const createAsset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'GLB or glTF file is required' })
    }

    const asset = await Asset.create({
      name: req.body.name,
      type: req.body.type,
      breed: req.body.type === 'body' ? req.body.breed || '' : '',
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: buildAssetUrl(req, req.file.filename),
    })

    res.status(201).json(asset)
  } catch (err) {
    if (req.file?.filename) {
      await removeFileIfExists(req.file.filename).catch(() => undefined)
    }
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
    if (!asset) {
      if (req.file?.filename) {
        await removeFileIfExists(req.file.filename)
      }
      return res.status(404).json({ message: 'Asset not found' })
    }

    const previousFileName = asset.fileName
    asset.name = req.body.name ?? asset.name
    asset.type = req.body.type ?? asset.type
    asset.breed = asset.type === 'body' ? req.body.breed || '' : ''

    if (req.file) {
      asset.fileName = req.file.filename
      asset.originalName = req.file.originalname
      asset.mimeType = req.file.mimetype
      asset.size = req.file.size
      asset.url = buildAssetUrl(req, req.file.filename)
    }

    await asset.save()

    if (req.file && previousFileName !== req.file.filename) {
      await removeFileIfExists(previousFileName).catch(() => undefined)
    }

    res.json(asset)
  } catch (err) {
    if (req.file?.filename) {
      await removeFileIfExists(req.file.filename).catch(() => undefined)
    }
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id)
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' })
    }

    await removeFileIfExists(asset.fileName).catch(() => undefined)
    res.json({ message: 'Asset deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

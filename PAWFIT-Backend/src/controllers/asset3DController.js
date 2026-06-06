import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import Asset3D from "../models/Asset3D.js";
import Product from "../models/Product.js";
import { addFallbackProduct } from "../seedData/defaultProducts.js";
import { cloneDefaultAssets } from "../seedData/defaultAssets.js";

const fallbackAssets = cloneDefaultAssets();
const isDatabaseReady = () => mongoose.connection.readyState === 1;

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const parseOptionalNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseMaybeJson = (value) => {
  if (!value || typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const buildProductPayloadFromAsset = (assetPayload) => ({
  name: assetPayload.name,
  description: assetPayload.description,
  price: parseOptionalNumber(assetPayload.productPrice, 0),
  type: (assetPayload.apparelType || "shirt").toLowerCase(),
  breedCompatibility: normalizeList(
    assetPayload.compatible?.length
      ? assetPayload.compatible
      : assetPayload.breed
        ? [assetPayload.breed]
        : [],
  ),
  sizes: normalizeList(assetPayload.sizes?.length ? assetPayload.sizes : ["M"]),
  glbAssetUrl: assetPayload.fileUrl,
  imageUrl: assetPayload.thumbnailUrl || "",
  stock: 0,
});

const matchesFilters = (asset, { type, breed, apparelType, productId }) => {
  if (type && asset.type !== type) return false;
  if (breed && asset.breed !== breed) return false;
  if (apparelType && asset.apparelType !== apparelType) return false;
  if (productId && String(asset.productId ?? "") !== String(productId))
    return false;
  return true;
};

// Get all 3D assets
export const getAssets = async (req, res) => {
  try {
    const { type, breed, apparelType, productId } = req.query;
    const assets = isDatabaseReady()
      ? await Asset3D.find({
          isActive: true,
          ...(type ? { type } : {}),
          ...(breed ? { breed } : {}),
          ...(apparelType ? { apparelType } : {}),
          ...(productId ? { productId } : {}),
        })
          .populate("productId", "name price")
          .populate("uploadedBy", "name")
          .sort({ createdAt: -1 })
      : fallbackAssets.filter(
          (asset) =>
            asset.isActive !== false &&
            matchesFilters(asset, { type, breed, apparelType, productId }),
        );

    res.json(assets);
  } catch (err) {
    const { type, breed, apparelType, productId } = req.query;
    const assets = fallbackAssets.filter(
      (asset) =>
        asset.isActive !== false &&
        matchesFilters(asset, { type, breed, apparelType, productId }),
    );
    res.json(assets);
  }
};

// Get single 3D asset
export const getAssetById = async (req, res) => {
  try {
    const asset = isDatabaseReady()
      ? await Asset3D.findById(req.params.id)
          .populate("productId", "name price")
          .populate("uploadedBy", "name")
      : fallbackAssets.find(
          (item) => item.id === req.params.id || item._id === req.params.id,
        );

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.json(asset);
  } catch (err) {
    const asset = fallbackAssets.find(
      (item) => item.id === req.params.id || item._id === req.params.id,
    );
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    res.json(asset);
  }
};

// Get assets by type and breed (for 3D viewer)
export const getAssetsByTypeAndBreed = async (req, res) => {
  try {
    const { type, breed } = req.params;
    const assets = isDatabaseReady()
      ? await Asset3D.find({
          type,
          breed,
          isActive: true,
        }).populate("productId")
      : fallbackAssets.filter(
          (asset) =>
            asset.isActive !== false &&
            asset.type === type &&
            asset.breed === breed,
        );

    res.json(assets);
  } catch (err) {
    const { type, breed } = req.params;
    const assets = fallbackAssets.filter(
      (asset) =>
        asset.isActive !== false &&
        asset.type === type &&
        asset.breed === breed,
    );
    res.json(assets);
  }
};

// Create 3D asset (admin only)
export const createAsset = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      breed,
      apparelType,
      productId,
      fileUrl,
      fileName,
      fileSize,
      format,
      thumbnailUrl,
      scale,
      position,
      rotation,
      tags,
      compatible,
      preCombinedInfo,
      sizes,
      productPrice,
    } = req.body;
    const uploadedFile = req.file;
    const resolvedFileUrl = uploadedFile
      ? `/models/${uploadedFile.filename}`
      : fileUrl;
    const resolvedFileName = uploadedFile ? uploadedFile.filename : fileName;
    const resolvedFileSize = uploadedFile ? uploadedFile.size : fileSize;
    const resolvedFormat = uploadedFile
      ? uploadedFile.originalname.split(".").pop() || "glb"
      : format || "glb";
    const assetPayload = {
      name,
      description,
      type,
      breed,
      apparelType,
      productId,
      fileUrl: resolvedFileUrl,
      fileName: resolvedFileName,
      fileSize: parseOptionalNumber(resolvedFileSize, 0),
      format: resolvedFormat,
      thumbnailUrl,
      scale: parseOptionalNumber(scale, 1),
      position: parseMaybeJson(position) || { x: 0, y: 0, z: 0 },
      rotation: parseMaybeJson(rotation) || { x: 0, y: 0, z: 0 },
      uploadedBy: req.user.id,
      tags: normalizeList(tags),
      compatible: normalizeList(compatible),
      sizes: normalizeList(sizes),
      productPrice,
      preCombinedInfo: parseMaybeJson(preCombinedInfo),
      isActive: true,
    };

    const shouldCreateProduct = type === "apparel" || type === "pre-combined";

    if (!productId && shouldCreateProduct) {
      const productPayload = buildProductPayloadFromAsset(assetPayload);
      const createdProduct = isDatabaseReady()
        ? await Product.create(productPayload)
        : {
            ...productPayload,
            _id: randomUUID(),
            id: undefined,
          };

      if (!isDatabaseReady()) {
        createdProduct.id = createdProduct._id;
        addFallbackProduct(createdProduct);
      }

      assetPayload.productId = createdProduct._id;
    }

    const asset = isDatabaseReady()
      ? await Asset3D.create(assetPayload)
      : {
          ...assetPayload,
          _id: `asset-${Date.now()}`,
          id: `asset-${Date.now()}`,
          uploadDate: new Date().toISOString().split("T")[0],
        };

    if (!isDatabaseReady()) {
      fallbackAssets.unshift(asset);
    }

    res.status(201).json(asset);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update 3D asset (admin only)
export const updateAsset = async (req, res) => {
  try {
    const {
      name,
      description,
      scale,
      position,
      rotation,
      tags,
      compatible,
      isActive,
      preCombinedInfo,
      type,
      breed,
      apparelType,
      productId,
      fileUrl,
      fileName,
      fileSize,
      format,
      thumbnailUrl,
    } = req.body;
    const uploadedFile = req.file;
    const updatePayload = {
      name,
      description,
      scale:
        scale !== undefined ? parseOptionalNumber(scale, undefined) : undefined,
      position: position ? parseMaybeJson(position) : undefined,
      rotation: rotation ? parseMaybeJson(rotation) : undefined,
      tags: tags !== undefined ? normalizeList(tags) : undefined,
      compatible:
        compatible !== undefined ? normalizeList(compatible) : undefined,
      isActive:
        isActive !== undefined
          ? isActive === "true" || isActive === true
          : undefined,
      preCombinedInfo: preCombinedInfo
        ? parseMaybeJson(preCombinedInfo)
        : undefined,
      type,
      breed,
      apparelType,
      productId,
      thumbnailUrl,
    };

    if (uploadedFile) {
      updatePayload.fileUrl = `/models/${uploadedFile.filename}`;
      updatePayload.fileName = uploadedFile.filename;
      updatePayload.fileSize = uploadedFile.size;
      updatePayload.format =
        uploadedFile.originalname.split(".").pop() || "glb";
    } else {
      updatePayload.fileUrl = fileUrl;
      updatePayload.fileName = fileName;
      updatePayload.fileSize =
        fileSize !== undefined
          ? parseOptionalNumber(fileSize, undefined)
          : undefined;
      updatePayload.format = format;
    }

    const asset = isDatabaseReady()
      ? await Asset3D.findByIdAndUpdate(req.params.id, updatePayload, {
          new: true,
        })
      : (() => {
          const index = fallbackAssets.findIndex(
            (item) => item.id === req.params.id || item._id === req.params.id,
          );
          if (index === -1) return null;
          fallbackAssets[index] = {
            ...fallbackAssets[index],
            ...Object.fromEntries(
              Object.entries(updatePayload).filter(
                ([, value]) => value !== undefined,
              ),
            ),
          };
          return fallbackAssets[index];
        })();

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.json(asset);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete 3D asset (admin only)
export const deleteAsset = async (req, res) => {
  try {
    const asset = isDatabaseReady()
      ? await Asset3D.findByIdAndDelete(req.params.id)
      : (() => {
          const index = fallbackAssets.findIndex(
            (item) => item.id === req.params.id || item._id === req.params.id,
          );
          if (index === -1) return null;
          const [removed] = fallbackAssets.splice(index, 1);
          return removed;
        })();

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    res.json({ message: "Asset deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get compatible apparel for a breed avatar
export const getCompatibleApparel = async (req, res) => {
  try {
    const { breed } = req.params;

    const apparel = isDatabaseReady()
      ? await Asset3D.find({
          type: "apparel",
          isActive: true,
          $or: [{ compatible: { $in: [breed] } }, { compatible: [] }],
        }).populate("productId", "name price apparelType")
      : fallbackAssets.filter(
          (asset) =>
            asset.isActive !== false &&
            asset.type === "apparel" &&
            (asset.compatible.length === 0 || asset.compatible.includes(breed)),
        );

    res.json(apparel);
  } catch (err) {
    const { breed } = req.params;
    const apparel = fallbackAssets.filter(
      (asset) =>
        asset.isActive !== false &&
        asset.type === "apparel" &&
        (asset.compatible.length === 0 || asset.compatible.includes(breed)),
    );
    res.json(apparel);
  }
};

// Check if apparel is compatible with breed
export const checkCompatibility = async (req, res) => {
  try {
    const { apparelId, breed } = req.body;

    const apparel = isDatabaseReady()
      ? await Asset3D.findById(apparelId)
      : fallbackAssets.find(
          (item) => item.id === apparelId || item._id === apparelId,
        );

    if (!apparel) {
      return res.status(404).json({ message: "Apparel not found" });
    }

    const isCompatible =
      apparel.compatible.length === 0 || apparel.compatible.includes(breed);

    res.json({
      compatible: isCompatible,
      apparel: apparel.name,
      breed,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

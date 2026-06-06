import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createAsset,
  deleteAsset,
  getAssetById,
  getAssets,
  updateAsset,
} from "../controllers/assetController.js";
import protect from "../middleware/auth.js";

const router = express.Router();
const uploadDir = path.resolve("uploads", "3d-assets");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    cb(null, `${Date.now()}-${safeName || "asset"}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".glb", ".gltf"].includes(ext)) {
      return cb(new Error("Only GLB and glTF files are allowed"));
    }
    cb(null, true);
  },
});

const uploadAssetFile = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.get("/", getAssets);
router.get("/:id", getAssetById);
router.post("/", protect, uploadAssetFile, createAsset);
router.put("/:id", protect, uploadAssetFile, updateAsset);
router.delete("/:id", protect, deleteAsset);

export default router;

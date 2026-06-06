import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import Product from "../models/Product.js";
import {
  addFallbackProduct,
  cloneDefaultProducts,
  findFallbackProduct,
  fallbackProductsStore,
  removeFallbackProduct,
  updateFallbackProduct,
} from "../seedData/defaultProducts.js";

const fallbackProducts = fallbackProductsStore;

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const matchesFilters = (product, { type, breed, size }) => {
  if (type && product.type !== type) return false;
  if (breed && !(product.breedCompatibility ?? []).includes(breed))
    return false;
  if (size && !(product.sizes ?? []).includes(size)) return false;
  return true;
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { type, breed, size } = req.query;
    const products = isDatabaseReady()
      ? await Product.find({
          ...(type ? { type } : {}),
          ...(breed ? { breedCompatibility: breed } : {}),
          ...(size ? { sizes: size } : {}),
        })
      : fallbackProducts.filter((product) =>
          matchesFilters(product, { type, breed, size }),
        );

    res.json(products);
  } catch (err) {
    const { type, breed, size } = req.query;
    const products = fallbackProducts.filter((product) =>
      matchesFilters(product, { type, breed, size }),
    );
    res.json(products);
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = isDatabaseReady()
      ? await Product.findById(req.params.id)
      : findFallbackProduct(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    const product = fallbackProducts.find(
      (item) => item.id === req.params.id || item._id === req.params.id,
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  }
};

// Create product (admin only)
export const createProduct = async (req, res) => {
  try {
    const product = isDatabaseReady()
      ? await Product.create(req.body)
      : {
          ...req.body,
          _id: randomUUID(),
          id: undefined,
        };

    if (!isDatabaseReady()) {
      product.id = product._id;
      addFallbackProduct(product);
    }

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = isDatabaseReady()
      ? await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
      : (() => {
          const updated = updateFallbackProduct(req.params.id, (item) => ({
            ...item,
            ...req.body,
          }));
          return updated;
        })();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = isDatabaseReady()
      ? await Product.findByIdAndDelete(req.params.id)
      : (() => {
          return removeFallbackProduct(req.params.id);
        })();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

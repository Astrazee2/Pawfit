/**
 * Sample Pre-Combined 3D Models Data
 * 
 * This file contains sample data for pre-combined 3D models
 * Use this data to seed your database with example pre-combined models
 * 
 * To use:
 * 1. Replace the placeholder URLs with your actual model URLs
 * 2. Run this seed script in your database
 * 3. Models will appear in admin dashboard and virtual fitting
 */

// Sample pre-combined models data
// NOTE: This file is no longer used.
// GLB files are now served directly from /public/models/ folder
// and referenced via product.glbAsset field

const samplePreCombinedModels = [
  // Labrador Retriever Models
  {
    name: "Labrador in Premium Blue Shirt",
    description: "A cheerful Labrador Retriever wearing a premium blue cotton shirt",
    type: "pre-combined",
    breed: "Labrador Retriever",
    apparelType: "Shirt",
    fileUrl: "https://example-cdn.com/models/labrador-blue-shirt.glb",
    thumbnailUrl: "https://example-cdn.com/thumbnails/labrador-blue-shirt.png",
    format: "glb",
    scale: 1.0,
    tags: ["labrador", "shirt", "blue", "summer"],
    preCombinedInfo: {
      dogBreed: "Labrador Retriever",
      apparelType: "Shirt",
      apparelName: "Premium Blue Tee"
    },
    productId: null, // Set to product ID when available
    isActive: true
  },
  {
    name: "Labrador in Waterproof Winter Coat",
    description: "A warm Labrador wearing a waterproof winter coat - perfect for cold weather",
    type: "pre-combined",
    breed: "Labrador Retriever",
    apparelType: "Coat",
    fileUrl: "https://example-cdn.com/models/labrador-winter-coat.glb",
    thumbnailUrl: "https://example-cdn.com/thumbnails/labrador-winter-coat.png",
    format: "glb",
    scale: 1.0,
    tags: ["labrador", "coat", "winter", "waterproof"],
    preCombinedInfo: {
      dogBreed: "Labrador Retriever",
      apparelType: "Coat",
      apparelName: "Waterproof Winter Coat"
    },
    productId: null,
    isActive: true
  },
  {
    name: "Labrador in Cozy Fleece Hoodie",
    description: "A cozy Labrador in a warm fleece hoodie",
    type: "pre-combined",
    breed: "Labrador Retriever",
    apparelType: "Hoodie",
    fileUrl: "https://example-cdn.com/models/labrador-hoodie.glb",
    thumbnailUrl: "https://example-cdn.com/thumbnails/labrador-hoodie.png",
    format: "glb",
    scale: 1.0,
    tags: ["labrador", "hoodie", "cozy", "fleece"],
    preCombinedInfo: {
      dogBreed: "Labrador Retriever",
      apparelType: "Hoodie",
      apparelName: "Cozy Fleece Hoodie"
    },
    productId: null,
    isActive: true
  },
  {
    name: "Labrador in Knit Sweater",
    description: "A stylish Labrador wearing a hand-knit wool sweater",
    type: "pre-combined",
    breed: "Labrador Retriever",
    apparelType: "Sweater",
    fileUrl: "https://example-cdn.com/models/labrador-sweater.glb",
    thumbnailUrl: "https://example-cdn.com/thumbnails/labrador-sweater.png",
    format: "glb",
    scale: 1.0,
    tags: ["labrador", "sweater", "knit", "wool"],
    preCombinedInfo: {
      dogBreed: "Labrador Retriever",
      apparelType: "Sweater",
      apparelName: "Hand-Knit Wool Sweater"
    },
    productId: null,
    isActive: true
  },

  // Dachshund Models
  {
    name: "Dachshund in Red Shirt",
    description: "A stylish long Dachshund wearing a vibrant red shirt",
    type: "pre-combined",
    breed: "Dachshund",
    apparelType: "Shirt",
    fileUrl: "https://example-cdn.com/models/dachshund-red-shirt.glb",
    thumbnailUrl: "https://example-cdn.com/thumbnails/dachshund-red-shirt.png",
    format: "glb",
    scale: 1.0,
    tags: ["dachshund", "shirt", "red", "stylish"],
    preCombinedInfo: {
      dogBreed: "Dachshund",
      apparelType: "Shirt",
      apparelName: "Vibrant Red Shirt"
    },
    productId: null,
    isActive: true
  },
  {
    name: "Dachshund in Hoodie",
    description: "A cute Dachshund in a cozy hoodie",
    type: "pre-combined",
    breed: "Dachshund",
    apparelType: "Hoodie",
    fileUrl: "https://example-cdn.com/models/dachshund-hoodie.glb",
    thumbnailUrl: "https://example-cdn.com/thumbnails/dachshund-hoodie.png",
    format: "glb",
    scale: 1.0,
    tags: ["dachshund", "hoodie", "cute", "cozy"],
    preCombinedInfo: {
      dogBreed: "Dachshund",
      apparelType: "Hoodie",
      apparelName: "Cozy Hoodie"
    },
    productId: null,
    isActive: true
  },

  // Pomeranian Models
  {
    name: "Pomeranian in Fancy Sweater",
    description: "An adorable fluffy Pomeranian in a fancy knit sweater",
    type: "pre-combined",
    breed: "Pomeranian",
    apparelType: "Sweater",
    fileUrl: "https://example-cdn.com/models/pomeranian-fancy-sweater.glb",
    thumbnailUrl: "https://example-cdn.com/thumbnails/pomeranian-fancy-sweater.png",
    format: "glb",
    scale: 1.0,
    tags: ["pomeranian", "sweater", "fancy", "fluffy"],
    preCombinedInfo: {
      dogBreed: "Pomeranian",
      apparelType: "Sweater",
      apparelName: "Fancy Knit Sweater"
    },
    productId: null,
    isActive: true
  },
  {
    name: "Pomeranian in Shirt",
    description: "A tiny Pomeranian wearing a cute little shirt",
    type: "pre-combined",
    breed: "Pomeranian",
    apparelType: "Shirt",
    fileUrl: "https://example-cdn.com/models/pomeranian-shirt.glb",
    thumbnailUrl: "https://example-cdn.com/thumbnails/pomeranian-shirt.png",
    format: "glb",
    scale: 1.0,
    tags: ["pomeranian", "shirt", "tiny", "cute"],
    preCombinedInfo: {
      dogBreed: "Pomeranian",
      apparelType: "Shirt",
      apparelName: "Cute Little Shirt"
    },
    productId: null,
    isActive: true
  },

  // Aspin/Mixed Breed Models
  {
    name: "Mixed Breed in Casual Shirt",
    description: "A friendly mixed breed dog in a casual everyday shirt",
    type: "pre-combined",
    breed: "Aspin/Mixed",
    apparelType: "Shirt",
    fileUrl: "https://example-cdn.com/models/mixed-breed-shirt.glb",
    thumbnailUrl: "https://example-cdn.com/thumbnails/mixed-breed-shirt.png",
    format: "glb",
    scale: 1.0,
    tags: ["mixed-breed", "aspin", "shirt", "casual"],
    preCombinedInfo: {
      dogBreed: "Aspin/Mixed",
      apparelType: "Shirt",
      apparelName: "Casual Everyday Shirt"
    },
    productId: null,
    isActive: true
  },
  {
    name: "Mixed Breed in Sweater",
    description: "A lovable mixed breed staying warm in a cozy sweater",
    type: "pre-combined",
    breed: "Aspin/Mixed",
    apparelType: "Sweater",
    fileUrl: "https://example-cdn.com/models/mixed-breed-sweater.glb",
    thumbnailUrl: "https://example-cdn.com/thumbnails/mixed-breed-sweater.png",
    format: "glb",
    scale: 1.0,
    tags: ["mixed-breed", "aspin", "sweater", "cozy"],
    preCombinedInfo: {
      dogBreed: "Aspin/Mixed",
      apparelType: "Sweater",
      apparelName: "Cozy Sweater"
    },
    productId: null,
    isActive: true
  }
];

/**
 * MongoDB Seed Script
 * 
 * Run in MongoDB shell or via your Node backend:
 * 
 * const Asset3D = require('./path/to/Asset3D.js');
 * await Asset3D.insertMany(samplePreCombinedModels);
 */

module.exports = {
  samplePreCombinedModels
};

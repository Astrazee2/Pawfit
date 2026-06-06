export const defaultProducts = [
  {
    _id: "default-1",
    id: "default-1",
    name: "Premium Blue Shirt",
    description: "Soft cotton shirt for everyday wear.",
    price: 29.99,
    type: "shirt",
    breedCompatibility: ["Labrador Retriever", "Dachshund"],
    sizes: ["S", "M", "L"],
    glbAssetUrl: "/models/premium-blue-shirt.glb",
    imageUrl: "/assets/premium-blue-shirt.jpg",
    stock: 12,
  },
  {
    _id: "default-2",
    id: "default-2",
    name: "Winter Coat",
    description: "Warm insulated coat for cold weather walks.",
    price: 39.99,
    type: "coat",
    breedCompatibility: ["Labrador Retriever", "Pomeranian"],
    sizes: ["M", "L", "XL"],
    glbAssetUrl: "/models/winter-coat.glb",
    imageUrl: "/assets/winter-coat.jpg",
    stock: 8,
  },
  {
    _id: "default-3",
    id: "default-3",
    name: "Cozy Hoodie",
    description: "Lightweight hoodie with a relaxed fit.",
    price: 34.99,
    type: "hoodie",
    breedCompatibility: ["Dachshund", "Aspin/Mixed"],
    sizes: ["XS", "S", "M"],
    glbAssetUrl: "/models/cozy-hoodie.glb",
    imageUrl: "/assets/cozy-hoodie.jpg",
    stock: 15,
  },
]

export const fallbackProductsStore = defaultProducts.map((product) => ({ ...product }))

export const cloneDefaultProducts = () => fallbackProductsStore.map((product) => ({ ...product }))

export const addFallbackProduct = (product) => {
  fallbackProductsStore.unshift(product)
  return product
}

export const updateFallbackProduct = (productId, updater) => {
  const index = fallbackProductsStore.findIndex(
    (product) => product.id === productId || product._id === productId,
  )

  if (index === -1) return null

  fallbackProductsStore[index] = updater(fallbackProductsStore[index])
  return fallbackProductsStore[index]
}

export const removeFallbackProduct = (productId) => {
  const index = fallbackProductsStore.findIndex(
    (product) => product.id === productId || product._id === productId,
  )

  if (index === -1) return null

  const [removed] = fallbackProductsStore.splice(index, 1)
  return removed
}

export const findFallbackProduct = (productId) =>
  fallbackProductsStore.find(
    (product) => product.id === productId || product._id === productId,
  )

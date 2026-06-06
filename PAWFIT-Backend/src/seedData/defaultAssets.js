export const defaultAssets = [
  {
    _id: "asset-default-1",
    id: "asset-default-1",
    name: "Labrador Avatar",
    description: "Sample Labrador avatar ready for apparel fitting.",
    type: "avatar",
    breed: "Labrador Retriever",
    fileUrl: "/models/labrador-avatar.glb",
    fileName: "labrador-avatar.glb",
    fileSize: 2300000,
    format: "glb",
    uploadDate: "2026-04-15",
    compatible: [],
    isActive: true,
  },
  {
    _id: "asset-default-2",
    id: "asset-default-2",
    name: "Premium Tee",
    description: "Sample apparel asset for shirts.",
    type: "apparel",
    apparelType: "Shirt",
    fileUrl: "/models/premium-tee.glb",
    fileName: "premium-tee.glb",
    fileSize: 1200000,
    format: "glb",
    uploadDate: "2026-04-16",
    compatible: ["Labrador Retriever", "Dachshund"],
    isActive: true,
  },
];

export const cloneDefaultAssets = () =>
  defaultAssets.map((asset) => ({ ...asset }));

import { ApparelType, Breed } from '../types';
import { assets3DAPI } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

type ProductReference = string | {
  _id?: string;
  id?: string;
  name?: string;
  price?: number;
};

export interface Asset3DModel {
  id: string;
  type: 'avatar' | 'apparel' | 'pre-combined';
  name: string;
  description?: string;
  breed?: Breed;
  apparelType?: ApparelType;
  productId?: ProductReference;
  fileUrl: string;
  thumbnailUrl?: string;
  scale?: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  preCombinedInfo?: {
    dogBreed?: Breed;
    apparelType?: ApparelType;
    apparelName?: string;
  };
}

interface BackendAsset3DModel extends Omit<Asset3DModel, 'id'> {
  _id?: string;
  id?: string;
}

export interface PreCombinedModelFilters {
  breed?: Breed;
  apparelType?: ApparelType;
  productId?: string;
}

const compactFilters = (filters: Record<string, string | undefined>) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => Boolean(value)));

const normalizeAsset = (asset: BackendAsset3DModel): Asset3DModel => ({
  ...asset,
  id: asset.id ?? asset._id ?? '',
});

export const resolveBackendAssetUrl = (fileUrl?: string) => {
  if (!fileUrl) return '';
  if (/^(https?:|data:|blob:)/i.test(fileUrl)) return fileUrl;
  if (fileUrl.startsWith('/')) return `${BACKEND_BASE_URL}${fileUrl}`;
  return `${BACKEND_BASE_URL}/${fileUrl}`;
};

export const modelsAPI = {
  getPreCombinedModels: async (filters: PreCombinedModelFilters = {}): Promise<Asset3DModel[]> => {
    const data = await assets3DAPI.getAssets(compactFilters({
      type: 'pre-combined',
      breed: filters.breed,
      apparelType: filters.apparelType,
      productId: filters.productId,
    }));

    return Array.isArray(data) ? data.map(normalizeAsset).filter(asset => asset.id && asset.fileUrl) : [];
  },

  getPreCombinedModel: async (filters: PreCombinedModelFilters = {}): Promise<Asset3DModel | null> => {
    const exactMatches = await modelsAPI.getPreCombinedModels(filters);
    if (exactMatches.length > 0) {
      return exactMatches[0];
    }

    if (filters.productId && filters.breed && filters.apparelType) {
      const fallbackMatches = await modelsAPI.getPreCombinedModels({
        breed: filters.breed,
        apparelType: filters.apparelType,
      });

      return fallbackMatches[0] ?? null;
    }

    return null;
  },

  getModelByProductId: async (productId: string): Promise<Asset3DModel | null> => {
    if (!productId) return null;
    return modelsAPI.getPreCombinedModel({ productId });
  },
};

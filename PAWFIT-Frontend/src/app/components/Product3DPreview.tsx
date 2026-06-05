import { useEffect, useState } from 'react';
import { PackageOpen } from 'lucide-react';
import { Breed, Product } from '../types';
import { Asset3DModel, modelsAPI } from '../services/models';
import { Model3DViewer } from './Model3DViewer';

interface Product3DPreviewProps {
  product: Product;
  breed?: Breed;
  className?: string;
  showMissing?: boolean;
}

export function Product3DPreview({
  product,
  breed,
  className = 'w-full h-32',
  showMissing = false,
}: Product3DPreviewProps) {
  const [asset, setAsset] = useState<Asset3DModel | null>(null);
  const [loading, setLoading] = useState(!product.glbAsset);

  useEffect(() => {
    let mounted = true;

    if (product.glbAsset) {
      setAsset(null);
      setLoading(false);
      return;
    }

    const loadModel = async () => {
      setLoading(true);
      try {
        const model = await modelsAPI.getPreCombinedModel({
          productId: product.id,
          breed,
          apparelType: product.apparelType,
        });

        if (mounted) {
          setAsset(model);
        }
      } catch (err) {
        if (mounted) {
          setAsset(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadModel();

    return () => {
      mounted = false;
    };
  }, [breed, product.apparelType, product.glbAsset, product.id]);

  const modelUrl = product.glbAsset || asset?.fileUrl || '';

  if (loading) {
    return (
      <div className={`${className} rounded-lg border border-[#E8E4DF] bg-[#FAF7F2] flex items-center justify-center`}>
        <p className="text-xs text-[#6B5D56]">Loading preview...</p>
      </div>
    );
  }

  if (modelUrl) {
    return (
      <Model3DViewer
        modelUrl={modelUrl}
        scale={asset?.scale ?? 1}
        autoRotate={true}
        className={className}
      />
    );
  }

  if (product.images[0]) {
    return (
      <div className={`${className} rounded-lg overflow-hidden border border-[#E8E4DF] bg-gray-200`}>
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
      </div>
    );
  }

  if (!showMissing) {
    return null;
  }

  return (
    <div className={`${className} rounded-lg border border-[#E8E4DF] bg-[#FAF7F2] flex items-center justify-center`}>
      <div className="text-center px-2">
        <PackageOpen className="w-5 h-5 mx-auto mb-1 text-[#C4714A]" />
        <p className="text-xs text-[#6B5D56]">No 3D preview</p>
      </div>
    </div>
  );
}

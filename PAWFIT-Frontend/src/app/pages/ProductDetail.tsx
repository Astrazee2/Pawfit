import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { productsAPI } from '../services/api';
import { ApparelType, Breed, Product, Size } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

type BackendProduct = {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  type?: string;
  apparelType?: ApparelType;
  breedCompatibility?: Breed[];
  sizes?: Size[];
  sizesAvailable?: Size[];
  imageUrl?: string;
  images?: string[];
  glbAssetUrl?: string;
  glbAsset?: string;
  message?: string;
};

const apparelTypeLabels: Record<string, ApparelType> = {
  shirt: 'Shirt',
  coat: 'Coat',
  sweater: 'Sweater',
  hoodie: 'Hoodie',
  Shirt: 'Shirt',
  Coat: 'Coat',
  Sweater: 'Sweater',
  Hoodie: 'Hoodie',
};

const normalizeProduct = (product: BackendProduct): Product => ({
  id: product.id ?? product._id ?? '',
  name: product.name ?? 'Untitled Product',
  description: product.description ?? '',
  price: product.price ?? 0,
  apparelType: apparelTypeLabels[product.apparelType ?? product.type ?? 'shirt'] ?? 'Shirt',
  breedCompatibility: product.breedCompatibility ?? [],
  sizesAvailable: product.sizesAvailable ?? product.sizes ?? [],
  images: product.images ?? (product.imageUrl ? [product.imageUrl] : []),
  glbAsset: product.glbAsset ?? product.glbAssetUrl,
});

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Product not found');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await productsAPI.getProductById(id);

        if (data?.message && !data?._id && !data?.id) {
          throw new Error(data.message);
        }

        const normalizedProduct = normalizeProduct(data);
        if (!normalizedProduct.id) {
          throw new Error('Product not found');
        }

        setProduct(normalizedProduct);
        setSelectedSize(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading product...</h1>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">{error || 'Product not found'}</h1>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    addToCart(product, selectedSize);
    toast.success('Added to cart!');
  };

  const handleTryOn = () => {
    navigate(`/try-on?product=${product.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button variant="ghost" onClick={() => navigate('/products')} className="mb-4">
        ← Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-gray-200 rounded cursor-pointer hover:opacity-75"></div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4">
            <Badge variant="secondary" className="mb-2 bg-[#C4714A] text-white">{product.apparelType}</Badge>
            <h1 className="text-4xl font-bold mb-2 text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>{product.name}</h1>
            <p className="text-3xl text-[#5C3D2E] font-bold">${product.price}</p>
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Breed Compatibility</h3>
            <div className="flex flex-wrap gap-2">
              {product.breedCompatibility.map(breed => (
                <Badge key={breed} variant="outline">{breed}</Badge>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Select Size</h3>
              <button className="text-sm text-teal-600 hover:underline">
                Size Chart
              </button>
            </div>
            <div className="flex gap-2">
              {product.sizesAvailable.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-3 border-2 rounded-xl transition-colors ${
                    selectedSize === size
                      ? 'border-[#5C3D2E] bg-[#F5EFE7] text-[#5C3D2E]'
                      : 'border-[#E8E4DF] hover:border-[#5C3D2E]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <Button
              size="lg"
              className="w-full bg-[#5C3D2E] hover:bg-[#4A3024] rounded-xl"
              onClick={handleTryOn}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try On in 3D
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full border-[#5C3D2E] text-[#5C3D2E] hover:bg-[#5C3D2E] hover:text-white rounded-xl"
              onClick={handleAddToCart}
              disabled={!selectedSize}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Product Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Apparel Type:</dt>
                  <dd className="font-medium">{product.apparelType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Available Sizes:</dt>
                  <dd className="font-medium">{product.sizesAvailable.join(', ')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Material:</dt>
                  <dd className="font-medium">Premium Fabric</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Fit Notes:</dt>
                  <dd className="font-medium">Breed-Optimized</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

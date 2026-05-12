import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { DogAvatar3D } from '../components/DogAvatar3D';
import { ApparelType, Breed, FitConfidence, Measurements, PetProfile, Product, Size, SizeRecommendation } from '../types';
import { productsAPI, petsAPI } from '../services/api';
import { getSizeRecommendation } from '../utils/sizeRecommendation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { RotateCcw, ZoomIn, ZoomOut, Check, AlertTriangle, Ruler as RulerIcon } from 'lucide-react';

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

type BackendPet = {
  _id?: string;
  id?: string;
  name?: string;
  breed?: Breed;
  backLength?: number;
  neckGirth?: number;
  chestGirth?: number;
  measurements?: Measurements;
};

const breeds: Breed[] = ['Labrador Retriever', 'Shih Tzu', 'Dachshund', 'Pomeranian', 'Aspin/Mixed'];

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

const normalizePet = (pet: BackendPet): PetProfile => ({
  id: pet.id ?? pet._id ?? '',
  name: pet.name ?? 'Pet',
  breed: pet.breed ?? 'Labrador Retriever',
  measurements: pet.measurements ?? {
    backLength: pet.backLength ?? 0,
    neckGirth: pet.neckGirth ?? 0,
    chestGirth: pet.chestGirth ?? 0,
  },
});

export function VirtualFitting() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated, updatePetProfiles } = useAuth();

  const [selectedBreed, setSelectedBreed] = useState<Breed>('Labrador Retriever');
  const [measurements, setMeasurements] = useState<Measurements>({
    backLength: 0,
    neckGirth: 0,
    chestGirth: 0,
  });
  const [recommendation, setRecommendation] = useState<SizeRecommendation | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [petProfilesLoaded, setPetProfilesLoaded] = useState(false);
  const [viewAngle, setViewAngle] = useState<'front' | 'side' | 'back' | 'top'>('front');

  const productId = searchParams.get('product');
  const petProfiles = user?.petProfiles ?? [];

  useEffect(() => {
    if (!isAuthenticated || petProfiles.length > 0 || petProfilesLoaded) {
      return;
    }

    const loadPets = async () => {
      try {
        const data = await petsAPI.getPets();
        if (Array.isArray(data)) {
          updatePetProfiles(data.map(normalizePet));
        }
      } catch (err) {
        toast.error('Unable to load saved pet profiles');
      } finally {
        setPetProfilesLoaded(true);
      }
    };

    loadPets();
  }, [isAuthenticated, petProfiles.length, petProfilesLoaded, updatePetProfiles]);

  useEffect(() => {
    if (petProfiles.length > 0) {
      const firstPet = petProfiles[0];
      setSelectedBreed(firstPet.breed);
      setMeasurements(firstPet.measurements ?? { backLength: 0, neckGirth: 0, chestGirth: 0 });
    }
  }, [petProfiles]);

  useEffect(() => {
    const result = getSizeRecommendation(
      selectedBreed,
      measurements.backLength,
      measurements.neckGirth,
      measurements.chestGirth
    );
    setRecommendation(result);
  }, [selectedBreed, measurements]);

  useEffect(() => {
    if (!productId) {
      setSelectedProduct(null);
      setProductError('');
      setProductLoading(false);
      return;
    }

    const loadProduct = async () => {
      setProductLoading(true);
      setProductError('');

      try {
        const data = await productsAPI.getProductById(productId);

        if (data?.message && !data?._id && !data?.id) {
          throw new Error(data.message);
        }

        const product = normalizeProduct(data);
        if (!product.id) {
          throw new Error('Product not found');
        }

        setSelectedProduct(product);
      } catch (err) {
        setSelectedProduct(null);
        setProductError(err instanceof Error ? err.message : 'Unable to load selected product');
      } finally {
        setProductLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleGetRecommendation = () => {
    const result = getSizeRecommendation(
      selectedBreed,
      measurements.backLength,
      measurements.neckGirth,
      measurements.chestGirth
    );
    setRecommendation(result);
  };

  const handleAddToCart = () => {
    if (!recommendation || !selectedProduct) {
      toast.error('Please get a size recommendation first');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    addToCart(selectedProduct, recommendation.size);
    toast.success('Added to cart!');
  };

  const getConfidenceBadge = (confidence: FitConfidence) => {
    switch (confidence) {
      case 'Good Fit':
        return (
          <Badge className="bg-[#7A9D7A] hover:bg-[#6A8D6A] text-white">
            
            <Check className="w-4 h-4 mr-1" />
            Good Fit
          </Badge>
        );
      case 'Check Fit':
        return (
          <Badge className="bg-[#D4A574] hover:bg-[#C49564] text-white">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Check Fit
          </Badge>
        );
      case 'Custom Fit Recommended':
        return (
          <Badge className="bg-[#B85C5C] hover:bg-[#A84C4C] text-white">
            <RulerIcon className="w-4 h-4 mr-1" />
            Custom Fit Recommended
          </Badge>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8 text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
        
        3D Virtual Fitting
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>3D Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <DogAvatar3D breed={selectedBreed} />
              </div>

              <div className="flex justify-center gap-2">
                <Button size="sm" variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
                <Button size="sm" variant="outline">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {(['front', 'side', 'back', 'top'] as const).map(angle => (
                  <Button
                    key={angle}
                    size="sm"
                    variant={viewAngle === angle ? 'default' : 'outline'}
                    onClick={() => setViewAngle(angle)}
                    className={viewAngle === angle ? 'bg-[#5C3D2E]' : 'border-[#5C3D2E] text-[#5C3D2E]'}
                  >
                    {angle.charAt(0).toUpperCase() + angle.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {!isAuthenticated && (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-[#6B5D56] mb-3">Login to use saved pet profiles. You can still enter measurements manually.</p>
                <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>Go to Login</Button>
              </CardContent>
            </Card>
          )}

          {productLoading && (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-[#6B5D56]">Loading selected product...</p>
              </CardContent>
            </Card>
          )}

          {productError && (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-[#8B4A4A]">{productError}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Breed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {breeds.map(breed => (
                  <button
                    key={breed}
                    onClick={() => setSelectedBreed(breed)}
                    className={`p-3 border-2 rounded-lg text-sm transition-colors ${
                      selectedBreed === breed
                        ? 'border-teal-600 bg-teal-50 text-teal-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {breed}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Enter Measurements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="backLength">Back Length (cm)</Label>
                <p className="text-xs text-gray-500 mb-1">Base of neck to base of tail</p>
                <Input
                  id="backLength"
                  type="number"
                  placeholder="0"
                  value={measurements.backLength || ''}
                  onChange={(e) => setMeasurements({ ...measurements, backLength: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="neckGirth">Neck Girth (cm)</Label>
                <p className="text-xs text-gray-500 mb-1">Circumference around base of neck</p>
                <Input
                  id="neckGirth"
                  type="number"
                  placeholder="0"
                  value={measurements.neckGirth || ''}
                  onChange={(e) => setMeasurements({ ...measurements, neckGirth: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="chestGirth">Chest Girth (cm)</Label>
                <p className="text-xs text-gray-500 mb-1">Circumference around widest part of chest</p>
                <Input
                  id="chestGirth"
                  type="number"
                  placeholder="0"
                  value={measurements.chestGirth || ''}
                  onChange={(e) => setMeasurements({ ...measurements, chestGirth: Number(e.target.value) })}
                />
              </div>

              <Button className="w-full" onClick={handleGetRecommendation}>
                Get Size Recommendation
              </Button>
            </CardContent>
          </Card>

          {recommendation && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Size Recommendation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Recommended Size</p>
                  <div className="text-4xl font-bold text-[#5C3D2E] mb-3">
                    {recommendation.size}
                  </div>
                  <div className="flex justify-center">
                    {getConfidenceBadge(recommendation.confidence)}
                  </div>
                </div>

                {recommendation.confidence === 'Check Fit' && (
                  <p className="text-sm text-[#8B6F47] bg-[#F5EFE7] p-3 rounded-lg border border-[#D4A574]">
                    Your measurements are close to a size boundary. Consider trying both this size and an adjacent one.
                  </p>
                )}

                {recommendation.confidence === 'Custom Fit Recommended' && (
                  <p className="text-sm text-[#8B4A4A] bg-[#F5E8E8] p-3 rounded-lg border border-[#B85C5C]">
                    Your measurements exceed the standard range. We recommend custom sizing for the best fit.
                  </p>
                )}

                {selectedProduct ? (
                  <Button className="w-full" onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                ) : (
                  <Button className="w-full" onClick={() => navigate('/products')}>
                    Browse Products
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { DogAvatar3D } from '../components/DogAvatar3D';
import { Model3DViewer } from '../components/Model3DViewer';
import { Breed, Measurements, PetProfile, Product, Size } from '../types';
import { productsAPI, petsAPI } from '../services/api';
import { Asset3DModel, modelsAPI } from '../services/models';
import { normalizeProduct } from '../utils/dataMappers';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { PackageOpen, RotateCcw, ShoppingCart, ZoomIn, ZoomOut } from 'lucide-react';

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

const emptyMeasurements: Measurements = {
  backLength: 0,
  neckGirth: 0,
  chestGirth: 0,
};

export function VirtualFitting() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated, updatePetProfiles } = useAuth();

  const [selectedBreed, setSelectedBreed] = useState<Breed>('Labrador Retriever');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [measurements, setMeasurements] = useState<Measurements>(emptyMeasurements);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [modelAsset, setModelAsset] = useState<Asset3DModel | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState('');
  const [petProfilesLoaded, setPetProfilesLoaded] = useState(false);
  const [viewAngle, setViewAngle] = useState<'front' | 'side' | 'back' | 'top'>('front');

  const productId = searchParams.get('product');
  const petProfiles = user?.petProfiles ?? [];
  const modelUrl = modelAsset?.fileUrl || selectedProduct?.glbAsset || '';

  const compatibleProducts = useMemo(() => {
    return products.filter(product => product.breedCompatibility.length === 0 || product.breedCompatibility.includes(selectedBreed));
  }, [products, selectedBreed]);

  const selectableProducts = useMemo(() => {
    if (!selectedProduct || compatibleProducts.some(product => product.id === selectedProduct.id)) {
      return compatibleProducts;
    }

    return [selectedProduct, ...compatibleProducts];
  }, [compatibleProducts, selectedProduct]);

  useEffect(() => {
    if (!isAuthenticated || petProfiles.length > 0 || petProfilesLoaded) {
      return;
    }

    const loadPets = async () => {
      try {
        const data = await petsAPI.getPets();
        if (Array.isArray(data)) {
          updatePetProfiles(data.map(normalizePet).filter(pet => pet.id));
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
    if (petProfiles.length > 0 && !selectedPetId) {
      const firstPet = petProfiles[0];
      setSelectedPetId(firstPet.id);
      setSelectedBreed(firstPet.breed);
      setMeasurements(firstPet.measurements ?? emptyMeasurements);
    }
  }, [petProfiles, selectedPetId]);

  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError('');

      try {
        const data = await productsAPI.getProducts();
        if (!Array.isArray(data)) {
          throw new Error(data?.message || 'Unable to load products');
        }
        setProducts(data.map(normalizeProduct).filter(product => product.id));
      } catch (err) {
        setProductsError(err instanceof Error ? err.message : 'Unable to load products');
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (!productId) {
      setSelectedProduct(null);
      setSelectedSize(null);
      setProductError('');
      setProductLoading(false);
      return;
    }

    const listProduct = products.find(product => product.id === productId);
    if (listProduct) {
      setSelectedProduct(listProduct);
      setSelectedSize(listProduct.sizesAvailable[0] ?? null);
      return;
    }

    const loadProduct = async () => {
      setProductLoading(true);
      setProductError('');

      try {
        const data = await productsAPI.getProductById(productId);
        const product = normalizeProduct(data);
        if (!product.id) {
          throw new Error('Product not found');
        }
        setSelectedProduct(product);
        setSelectedSize(product.sizesAvailable[0] ?? null);
      } catch (err) {
        setSelectedProduct(null);
        setSelectedSize(null);
        setProductError(err instanceof Error ? err.message : 'Unable to load selected product');
      } finally {
        setProductLoading(false);
      }
    };

    loadProduct();
  }, [productId, products]);

  useEffect(() => {
    if (!selectedProduct) {
      setModelAsset(null);
      setModelError('');
      setModelLoading(false);
      return;
    }

    const loadPreCombinedModel = async () => {
      setModelLoading(true);
      setModelError('');

      try {
        const asset = await modelsAPI.getPreCombinedModel({
          breed: selectedBreed,
          apparelType: selectedProduct.apparelType,
          productId: selectedProduct.id,
        });

        setModelAsset(asset);

        if (!asset && !selectedProduct.glbAsset) {
          setModelError('No pre-combined 3D model is available for this breed and product yet.');
        }
      } catch (err) {
        setModelAsset(null);
        setModelError(err instanceof Error ? err.message : 'Unable to load the 3D model');
      } finally {
        setModelLoading(false);
      }
    };

    loadPreCombinedModel();
  }, [selectedBreed, selectedProduct]);

  const handlePetProfileChange = (petId: string) => {
    setSelectedPetId(petId);
    const pet = petProfiles.find(profile => profile.id === petId);
    if (!pet) return;

    setSelectedBreed(pet.breed);
    setMeasurements(pet.measurements ?? emptyMeasurements);
  };

  const handleProductChange = (productId: string) => {
    if (!productId) {
      setSelectedProduct(null);
      setSelectedSize(null);
      setSearchParams({});
      return;
    }

    const product = products.find(item => item.id === productId) ?? null;
    setSelectedProduct(product);
    setSelectedSize(product?.sizesAvailable[0] ?? null);
    setSearchParams({ product: productId });
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await addToCart(selectedProduct, selectedSize);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to add item to cart');
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
              <CardTitle>{selectedProduct ? 'Virtual Try-On' : '3D Preview'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg mb-4 overflow-hidden bg-[#FAF7F2]">
                {modelLoading || productLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-[#C4714A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-sm text-[#6B5D56]">Loading 3D model...</p>
                    </div>
                  </div>
                ) : modelUrl ? (
                  <Model3DViewer
                    modelUrl={modelUrl}
                    scale={modelAsset?.scale ?? 1}
                    autoRotate={true}
                    className="w-full h-full"
                  />
                ) : selectedProduct ? (
                  <div className="w-full h-full flex items-center justify-center px-6 text-center">
                    <div>
                      <PackageOpen className="w-12 h-12 mx-auto mb-3 text-[#C4714A]" />
                      <p className="text-sm text-[#6B5D56]">{modelError || 'No pre-combined 3D model found for this selection.'}</p>
                    </div>
                  </div>
                ) : (
                  <DogAvatar3D breed={selectedBreed} viewAngle={viewAngle} />
                )}
              </div>

              <div className="flex justify-center gap-2">
                <Button size="sm" variant="outline" className="text-[#5C3D2E] border-[#5C3D2E]">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
                <Button size="sm" variant="outline" className="text-[#5C3D2E] border-[#5C3D2E]">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="text-[#5C3D2E] border-[#5C3D2E]">
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

              {selectedProduct && (
                <div className="mt-4 p-3 bg-[#FFF5E1] border border-[#FFDBB3] rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                    <p className="text-[#5C3D2E] font-medium">
                      {selectedBreed} wearing {selectedProduct.name}
                    </p>
                    <Badge variant="outline" className="w-fit border-[#C4714A] text-[#5C3D2E]">
                      Size {selectedSize ?? 'not selected'}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#6B5D56] mt-2">
                    Drag to rotate and zoom the pre-combined model. Measurements are saved as reference only.
                  </p>
                </div>
              )}
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

          {(productError || productsError) && (
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-[#8B4A4A]">{productError || productsError}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Pet or Breed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {petProfiles.length > 0 && (
                <div>
                  <Label htmlFor="petProfile">Pet Profile</Label>
                  <select
                    id="petProfile"
                    value={selectedPetId}
                    onChange={(e) => handlePetProfileChange(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    {petProfiles.map(pet => (
                      <option key={pet.id} value={pet.id}>{pet.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {breeds.map(breed => (
                  <button
                    key={breed}
                    onClick={() => {
                      setSelectedBreed(breed);
                      setSelectedPetId('');
                    }}
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
              <CardTitle>Step 2: Measurements Optional</CardTitle>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3: Select Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="product">Product</Label>
                <select
                  id="product"
                  value={selectedProduct?.id ?? ''}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  disabled={productsLoading}
                >
                  <option value="">{productsLoading ? 'Loading products...' : 'Select a product'}</option>
                  {selectableProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.apparelType}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div>
                  <Label>Size Category</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProduct.sizesAvailable.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border-2 rounded-xl transition-colors ${
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
              )}

              {modelAsset && (
                <p className="text-xs text-[#6B5D56] bg-[#F5EFE7] p-3 rounded-lg border border-[#E8E4DF]">
                  Loaded model: {modelAsset.name}
                </p>
              )}

              {modelError && (
                <p className="text-xs text-[#8B4A4A] bg-[#F5E8E8] p-3 rounded-lg border border-[#B85C5C]">
                  {modelError}
                </p>
              )}

              {selectedProduct ? (
                <Button className="w-full bg-[#5C3D2E] hover:bg-[#4A3024] rounded-xl" onClick={handleAddToCart}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              ) : (
                <Button className="w-full" onClick={() => navigate('/products')}>
                  Browse Products
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

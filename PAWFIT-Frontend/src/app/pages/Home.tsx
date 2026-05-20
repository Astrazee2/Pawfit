import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, PackageSearch, Ruler, Shirt, ShoppingBag, Sparkles } from 'lucide-react';
import { productsAPI } from '../services/api';
import { Product } from '../types';
import { normalizeProduct } from '../utils/dataMappers';

export function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const data = await productsAPI.getProducts();
        setFeaturedProducts(Array.isArray(data) ? data.map(normalizeProduct).filter(product => product.id).slice(0, 4) : []);
      } catch (err) {
        setFeaturedProducts([]);
      } finally {
        setLoadingFeatured(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-[#FAF7F2] via-[#F5EFE7] to-[#F0E8DD] py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-[#5C3D2E] mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
              The Perfect Fit for Your Pup
            </h1>
            <p className="text-lg text-[#6B5D56] mb-2 italic">
              Dress your dog. Get the fit right.
            </p>
            <p className="text-xl text-[#6B5D56] mb-8 max-w-2xl mx-auto">
              Try on dog apparel in 3D before you buy. Breed-specific sizing with real-time virtual fitting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/try-on')} className="text-lg px-8 bg-[#5C3D2E] hover:bg-[#4A3024]">
                <Shirt className="w-5 h-5 mr-2" />
                Try It On Your Dog
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/products')} className="text-lg px-8 border-[#5C3D2E] text-[#5C3D2E] hover:bg-[#5C3D2E] hover:text-white">
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>Why Choose PawFit?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-[#E8E4DF] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-[#F5EFE7] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#5C3D2E]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#5C3D2E]">3D Virtual Fitting</h3>
                <p className="text-[#6B5D56]">
                  See exactly how clothes will look on your dog with our interactive 3D visualization.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E8E4DF] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-[#F5EFE7] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ruler className="w-8 h-8 text-[#5C3D2E]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#5C3D2E]">Breed-Specific Sizing</h3>
                <p className="text-[#6B5D56]">
                  Get accurate size recommendations based on your dog's breed and measurements.
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#E8E4DF] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-[#F5EFE7] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-[#5C3D2E]" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-[#5C3D2E]">Easy Checkout</h3>
                <p className="text-[#6B5D56]">
                  Simple and secure shopping experience with saved pet profiles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5C3D2E] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageSearch className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#5C3D2E]">Select Breed</h3>
              <p className="text-[#6B5D56]">Choose your dog's breed from our supported breeds.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#5C3D2E] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Ruler className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#5C3D2E]">Enter Measurements</h3>
              <p className="text-[#6B5D56]">Provide your dog's back length, neck girth, and chest girth.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#5C3D2E] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#5C3D2E]">Try On and Shop</h3>
              <p className="text-[#6B5D56]">See the fit in 3D and add correctly sized items to your cart.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          {loadingFeatured ? (
            <Card>
              <CardContent className="py-12 text-center text-[#6B5D56]">Loading featured products...</CardContent>
            </Card>
          ) : featuredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-[#6B5D56]">No featured products available yet.</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/products/${product.id}`)}>
                  <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                    {product.images[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-[#5C3D2E] font-bold">${product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Button onClick={() => navigate('/products')}>View All Products</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

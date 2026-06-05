import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { productsAPI } from '../services/api';
import { ApparelType, Breed, Product, Size } from '../types';
import { normalizeProduct } from '../utils/dataMappers';
import { PackageOpen, Search } from 'lucide-react';

const apparelTypes: ApparelType[] = ['Shirt', 'Coat', 'Sweater', 'Hoodie'];
const breeds: Breed[] = ['Labrador Retriever', 'Shih Tzu', 'Dachshund', 'Pomeranian', 'Aspin/Mixed'];
const sizes: Size[] = ['XS', 'S', 'M', 'L', 'XL'];

export function ProductCatalog() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApparelTypes, setSelectedApparelTypes] = useState<ApparelType[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<Breed[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await productsAPI.getProducts();
        if (!Array.isArray(data)) {
          throw new Error(data?.message || 'Unable to load products');
        }
        setProducts(data.map(normalizeProduct).filter(product => product.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query);
      const matchesApparelType = selectedApparelTypes.length === 0 || selectedApparelTypes.includes(product.apparelType);
      const matchesBreed = selectedBreeds.length === 0 || selectedBreeds.some(breed => product.breedCompatibility.includes(breed));
      const matchesSize = selectedSizes.length === 0 || selectedSizes.some(size => product.sizesAvailable.includes(size));

      return matchesSearch && matchesApparelType && matchesBreed && matchesSize;
    });
  }, [products, searchQuery, selectedApparelTypes, selectedBreeds, selectedSizes]);

  const toggleFilter = <T,>(item: T, selected: T[], setSelected: (items: T[]) => void) => {
    setSelected(selected.includes(item) ? selected.filter(i => i !== item) : [...selected, item]);
  };

  const handleClearFilters = () => {
    setSelectedApparelTypes([]);
    setSelectedBreeds([]);
    setSelectedSizes([]);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8 text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
        Product Catalog
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Apparel Type</h3>
            <div className="space-y-2">
              {apparelTypes.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedApparelTypes.includes(type)}
                    onChange={() => toggleFilter(type, selectedApparelTypes, setSelectedApparelTypes)}
                    className="rounded"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Breed</h3>
            <div className="space-y-2">
              {breeds.map(breed => (
                <label key={breed} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBreeds.includes(breed)}
                    onChange={() => toggleFilter(breed, selectedBreeds, setSelectedBreeds)}
                    className="rounded"
                  />
                  <span className="text-sm">{breed}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <Badge
                  key={size}
                  variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleFilter(size, selectedSizes, setSelectedSizes)}
                >
                  {size}
                </Badge>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </aside>

        <div className="flex-1">
          {loading ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-[#6B5D56]">Loading products...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-16 text-center">
                <p className="text-[#8B4A4A] mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-[#E8E4DF] rounded-2xl overflow-hidden"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                      {product.images[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
                    </div>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant="secondary">{product.apparelType}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-[#5C3D2E] font-bold text-lg">${product.price.toFixed(2)}</span>
                        <div className="flex flex-wrap justify-end gap-1">
                          {product.sizesAvailable.map(size => (
                            <span key={size} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <PackageOpen className="w-16 h-16 mx-auto mb-4 text-[#C4714A]" />
                  <p className="text-[#6B5D56] mb-4">No products found matching your filters</p>
                  <Button onClick={handleClearFilters}>Clear All Filters</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

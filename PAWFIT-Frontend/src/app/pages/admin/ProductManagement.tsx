import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Product, ApparelType, Breed, Size } from '../../types';
import { productsAPI } from '../../services/api';
import { normalizeProduct } from '../../utils/dataMappers';
import { Plus, Edit, Trash2, PackageOpen } from 'lucide-react';
import { toast } from 'sonner';

type ProductForm = {
  name: string;
  description: string;
  price: string;
  apparelType: ApparelType;
  breedCompatibility: Breed[];
  sizesAvailable: Size[];
  imageUrl: string;
  glbAsset: string;
};

const apparelTypes: ApparelType[] = ['Shirt', 'Coat', 'Sweater', 'Hoodie'];
const breeds: Breed[] = ['Labrador Retriever', 'Shih Tzu', 'Dachshund', 'Pomeranian', 'Aspin/Mixed'];
const sizes: Size[] = ['XS', 'S', 'M', 'L', 'XL'];
const initialForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  apparelType: 'Shirt',
  breedCompatibility: [],
  sizesAvailable: [],
  imageUrl: '',
  glbAsset: '',
};

const toBackendType = (type: ApparelType) => type.toLowerCase();

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>(initialForm);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsAPI.getProducts();
      setProducts(Array.isArray(data) ? data.map(normalizeProduct).filter(product => product.id) : []);
    } catch (err) {
      toast.error('Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenDialog = (product?: Product) => {
    setEditingProduct(product || null);
    setFormData(product ? {
      name: product.name,
      description: product.description,
      price: String(product.price),
      apparelType: product.apparelType,
      breedCompatibility: product.breedCompatibility,
      sizesAvailable: product.sizesAvailable,
      imageUrl: product.images[0] || '',
      glbAsset: product.glbAsset || '',
    } : initialForm);
    setDialogOpen(true);
  };

  const toggleArrayValue = <T,>(value: T, selected: T[], key: keyof ProductForm) => {
    const next = selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value];
    setFormData({ ...formData, [key]: next });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || formData.sizesAvailable.length === 0) {
      toast.error('Please fill in the required product details');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      type: toBackendType(formData.apparelType),
      breedCompatibility: formData.breedCompatibility,
      sizes: formData.sizesAvailable,
      imageUrl: formData.imageUrl,
      glbAssetUrl: formData.glbAsset,
    };

    try {
      if (editingProduct) {
        await productsAPI.updateProduct(editingProduct.id, payload);
        toast.success('Product updated');
      } else {
        await productsAPI.createProduct(payload);
        toast.success('Product created');
      }
      setDialogOpen(false);
      await loadProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save product');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productsAPI.deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete product');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
          Product Management
        </h1>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-4 py-2 bg-[#5C3D2E] hover:bg-[#4A3024] text-white rounded-xl font-medium"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-[#6B5D56]">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-[#6B5D56]">
              <PackageOpen className="w-12 h-12 mx-auto mb-3 text-[#C4714A]" />
              No products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sizes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded mr-3 overflow-hidden">
                            {product.images[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">{product.apparelType}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{product.sizesAvailable.join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenDialog(product)} className="text-teal-600 hover:text-teal-800" aria-label="Edit product">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800" aria-label="Delete product">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </div>

              <div>
                <Label htmlFor="apparelType">Apparel Type</Label>
                <select
                  id="apparelType"
                  value={formData.apparelType}
                  onChange={(e) => setFormData({ ...formData, apparelType: e.target.value as ApparelType })}
                  className="w-full p-2 border rounded-md"
                >
                  {apparelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>Breed Compatibility</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {breeds.map(breed => (
                  <label key={breed} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.breedCompatibility.includes(breed)}
                      onChange={() => toggleArrayValue(breed, formData.breedCompatibility, 'breedCompatibility')}
                      className="rounded"
                    />
                    <span className="text-sm">{breed}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Size Availability</Label>
              <div className="flex gap-2 mt-2">
                {sizes.map(size => (
                  <label key={size} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.sizesAvailable.includes(size)}
                      onChange={() => toggleArrayValue(size, formData.sizesAvailable, 'sizesAvailable')}
                      className="rounded"
                    />
                    <span className="text-sm">{size}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="imageUrl">Product Image Link</Label>
              <Input id="imageUrl" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
            </div>

            <div>
              <Label htmlFor="glbAsset">3D GLB Asset Link</Label>
              <Input id="glbAsset" value={formData.glbAsset} onChange={(e) => setFormData({ ...formData, glbAsset: e.target.value })} />
            </div>

            <button onClick={handleSave} className="w-full px-4 py-2 bg-[#5C3D2E] hover:bg-[#4A3024] text-white rounded-xl font-medium transition-colors">
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

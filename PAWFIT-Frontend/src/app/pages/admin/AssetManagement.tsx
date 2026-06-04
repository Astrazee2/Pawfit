import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Plus, Upload, Trash2, Edit, Package } from 'lucide-react';
import { Breed, ApparelType, Product } from '../../types';
import { productsAPI } from '../../services/api';
import { toast } from 'sonner';

interface Asset3D {
  id: string;
  name: string;
  description?: string;
  type: 'avatar' | 'apparel' | 'pre-combined';
  breed?: Breed;
  apparelType?: ApparelType;
  productId?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  format: 'glb' | 'gltf';
  thumbnailUrl?: string;
  scale?: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  uploadDate: string;
  compatible?: Breed[];
  createdAt?: string;
  preCombinedInfo?: {
    dogBreed?: string;
    apparelType?: string;
    apparelName?: string;
  };
}

interface AssetForm {
  name: string;
  description: string;
  type: 'avatar' | 'apparel' | 'pre-combined';
  breed?: Breed;
  apparelType?: ApparelType;
  productId?: string;
  fileUrl: string;
  thumbnailUrl: string;
  scale: string;
  compatible: Breed[];
  tags: string;
  preCombinedDogBreed?: Breed;
  preCombinedApparelType?: ApparelType;
  preCombinedApparelName?: string;
}

const breeds: Breed[] = ['Labrador Retriever', 'Dachshund', 'Pomeranian', 'Aspin/Mixed'];
const apparelTypes: ApparelType[] = ['Shirt', 'Coat', 'Sweater', 'Hoodie'];

const initialForm: AssetForm = {
  name: '',
  description: '',
  type: 'avatar',
  breed: undefined,
  apparelType: undefined,
  productId: undefined,
  fileUrl: '',
  thumbnailUrl: '',
  scale: '1',
  compatible: [],
  tags: '',
  preCombinedDogBreed: undefined,
  preCombinedApparelType: undefined,
  preCombinedApparelName: ''
};

export function AssetManagement() {
  const [assets, setAssets] = useState<Asset3D[]>([
    {
      id: '1',
      name: 'Labrador Avatar',
      type: 'avatar',
      breed: 'Labrador Retriever',
      fileUrl: 'https://example.com/labrador.glb',
      fileName: 'labrador.glb',
      fileSize: 2300000,
      format: 'glb',
      uploadDate: '2026-04-15',
    },
    {
      id: '2',
      name: 'Premium Tee - Shirt',
      type: 'apparel',
      apparelType: 'Shirt',
      fileUrl: 'https://example.com/tee-shirt.glb',
      fileName: 'tee-shirt.glb',
      fileSize: 1200000,
      format: 'glb',
      uploadDate: '2026-04-16',
      compatible: ['Labrador Retriever', 'Dachshund'],
    },
    {
      id: '3',
      name: 'Winter Coat - Coat',
      type: 'apparel',
      apparelType: 'Coat',
      fileUrl: 'https://example.com/winter-coat.glb',
      fileName: 'winter-coat.glb',
      fileSize: 1500000,
      format: 'glb',
      uploadDate: '2026-04-16',
      compatible: ['Labrador Retriever', 'Shih Tzu'],
    },
  ]);

  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset3D | null>(null);
  const [formData, setFormData] = useState<AssetForm>(initialForm);
  const [filterType, setFilterType] = useState<'all' | 'avatar' | 'apparel' | 'pre-combined'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsAPI.getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error('Unable to load products');
      }
    };
    loadProducts();
  }, []);

  const handleOpenDialog = (asset?: Asset3D) => {
    setEditingAsset(asset || null);
    if (asset) {
      setFormData({
        name: asset.name,
        description: asset.description || '',
        type: asset.type,
        breed: asset.breed,
        apparelType: asset.apparelType,
        productId: asset.productId,
        fileUrl: asset.fileUrl,
        thumbnailUrl: asset.thumbnailUrl || '',
        scale: String(asset.scale || 1),
        compatible: asset.compatible || [],
        tags: '',
        preCombinedDogBreed: asset.preCombinedInfo?.dogBreed as Breed | undefined,
        preCombinedApparelType: asset.preCombinedInfo?.apparelType as ApparelType | undefined,
        preCombinedApparelName: asset.preCombinedInfo?.apparelName || ''
      });
    } else {
      setFormData(initialForm);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.fileUrl) {
      toast.error('Please fill in required fields');
      return;
    }

    if (formData.type === 'avatar' && !formData.breed) {
      toast.error('Avatar must have a breed');
      return;
    }

    if (formData.type === 'apparel' && !formData.apparelType) {
      toast.error('Apparel must have a type');
      return;
    }

    if (formData.type === 'pre-combined') {
      if (!formData.preCombinedDogBreed || !formData.preCombinedApparelType) {
        toast.error('Pre-combined model must specify dog breed and apparel type');
        return;
      }
    }

    setLoading(true);
    try {
      // In a real implementation, this would call the backend API
      const newAsset: Asset3D = {
        id: editingAsset?.id || String(Date.now()),
        name: formData.name,
        description: formData.description,
        type: formData.type,
        breed: formData.breed,
        apparelType: formData.apparelType,
        productId: formData.productId,
        fileUrl: formData.fileUrl,
        fileName: formData.fileUrl.split('/').pop() || 'asset.glb',
        fileSize: 0,
        format: 'glb',
        thumbnailUrl: formData.thumbnailUrl,
        scale: parseFloat(formData.scale),
        compatible: formData.compatible,
        uploadDate: new Date().toISOString().split('T')[0],
        preCombinedInfo: formData.type === 'pre-combined' ? {
          dogBreed: formData.preCombinedDogBreed,
          apparelType: formData.preCombinedApparelType,
          apparelName: formData.preCombinedApparelName
        } : undefined
      };

      if (editingAsset) {
        setAssets(assets.map(a => a.id === editingAsset.id ? newAsset : a));
        toast.success('Asset updated successfully');
      } else {
        setAssets([newAsset, ...assets]);
        toast.success('Asset uploaded successfully');
      }

      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    toast.success('Asset deleted');
  };

  const toggleCompatibleBreed = (breed: Breed) => {
    const updated = formData.compatible.includes(breed)
      ? formData.compatible.filter(b => b !== breed)
      : [...formData.compatible, breed];
    setFormData({ ...formData, compatible: updated });
  };

  const filteredAssets = filterType === 'all' ? assets : assets.filter(a => a.type === filterType);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
          3D Asset Management
        </h1>
        <button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2 px-4 py-2 bg-[#5C3D2E] hover:bg-[#4A3024] text-white rounded-xl font-medium"
        >
          <Plus className="w-4 h-4" />
          Upload New Asset
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        {(['all', 'avatar', 'apparel', 'pre-combined'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors capitalize ${
              filterType === type
                ? 'bg-[#5C3D2E] text-white'
                : 'border border-[#E8E4DF] text-[#6B5D56] hover:bg-[#FAF7F2]'
            }`}
          >
            {type === 'all' ? 'All Assets' : type === 'avatar' ? 'Dog Avatars' : type === 'apparel' ? 'Clothing' : 'Pre-Combined'}
          </button>
        ))}
      </div>

      <Card className="border-0 shadow-sm rounded-3xl">
        <CardContent className="p-0">
          {assets.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-[#C4714A]" />
              <p className="text-[#6B5D56]">No 3D assets yet. Upload your first model!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAssets.map(asset => (
                    <tr key={asset.id} className="hover:bg-[#FAF7F2]">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#5C3D2E]">{asset.name}</p>
                          <p className="text-xs text-[#6B5D56]">{asset.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={asset.type === 'avatar' ? 'default' : asset.type === 'apparel' ? 'secondary' : 'outline'} className="capitalize">
                          {asset.type === 'pre-combined' ? 'Pre-Combined' : asset.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          {asset.type === 'avatar' && asset.breed && (
                            <p className="text-[#6B5D56]">Breed: {asset.breed}</p>
                          )}
                          {asset.type === 'apparel' && asset.apparelType && (
                            <>
                              <p className="text-[#6B5D56]">Type: {asset.apparelType}</p>
                              {asset.compatible && asset.compatible.length > 0 && (
                                <p className="text-xs text-[#8B7B74]">
                                  Compatible: {asset.compatible.slice(0, 2).join(', ')}{asset.compatible.length > 2 ? '...' : ''}
                                </p>
                              )}
                            </>
                          )}
                          {asset.type === 'pre-combined' && asset.preCombinedInfo && (
                            <>
                              <p className="text-[#6B5D56]">Breed: {asset.preCombinedInfo.dogBreed}</p>
                              <p className="text-[#6B5D56]">Apparel: {asset.preCombinedInfo.apparelType}</p>
                              {asset.preCombinedInfo.apparelName && (
                                <p className="text-xs text-[#8B7B74]">{asset.preCombinedInfo.apparelName}</p>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B5D56]">
                        {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B5D56]">
                        {asset.uploadDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenDialog(asset)}
                            className="text-teal-600 hover:text-teal-800"
                            title="Edit asset"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete asset"
                          >
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
            <DialogTitle>{editingAsset ? 'Edit 3D Asset' : 'Upload New 3D Asset'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="assetName">Asset Name *</Label>
              <Input
                id="assetName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Premium Tee Shirt"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the asset"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Asset Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => {
                    const type = e.target.value as 'avatar' | 'apparel' | 'pre-combined';
                    setFormData({
                      ...formData,
                      type,
                      breed: type === 'avatar' ? 'Labrador Retriever' : undefined,
                      apparelType: type === 'apparel' ? 'Shirt' : undefined,
                      preCombinedDogBreed: type === 'pre-combined' ? 'Labrador Retriever' : undefined,
                      preCombinedApparelType: type === 'pre-combined' ? 'Shirt' : undefined
                    });
                  }}
                  className="w-full p-2 border border-[#E8E4DF] rounded-lg"
                >
                  <option value="avatar">Dog Avatar</option>
                  <option value="apparel">Clothing Item</option>
                  <option value="pre-combined">Pre-Combined Model</option>
                </select>
              </div>

              {formData.type === 'avatar' ? (
                <div>
                  <Label htmlFor="breed">Breed *</Label>
                  <select
                    id="breed"
                    value={formData.breed || ''}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value as Breed })}
                    className="w-full p-2 border border-[#E8E4DF] rounded-lg"
                  >
                    {breeds.map(breed => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                </div>
              ) : formData.type === 'apparel' ? (
                <div>
                  <Label htmlFor="apparelType">Clothing Type *</Label>
                  <select
                    id="apparelType"
                    value={formData.apparelType || ''}
                    onChange={(e) => setFormData({ ...formData, apparelType: e.target.value as ApparelType })}
                    className="w-full p-2 border border-[#E8E4DF] rounded-lg"
                  >
                    {apparelTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <Label htmlFor="preCombinedDogBreed">Dog Breed *</Label>
                  <select
                    id="preCombinedDogBreed"
                    value={formData.preCombinedDogBreed || ''}
                    onChange={(e) => setFormData({ ...formData, preCombinedDogBreed: e.target.value as Breed })}
                    className="w-full p-2 border border-[#E8E4DF] rounded-lg"
                  >
                    {breeds.map(breed => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {formData.type === 'apparel' && (
              <>
                <div>
                  <Label>Compatible Breeds</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {breeds.map(breed => (
                      <label key={breed} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.compatible.includes(breed)}
                          onChange={() => toggleCompatibleBreed(breed)}
                          className="rounded"
                        />
                        <span className="text-sm">{breed}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="scale">Scale</Label>
                  <Input
                    id="scale"
                    type="number"
                    step="0.1"
                    value={formData.scale}
                    onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                    placeholder="1.0"
                  />
                </div>
              </>
            )}

            {formData.type === 'pre-combined' && (
              <>
                <div>
                  <Label htmlFor="preCombinedApparelType">Apparel Type *</Label>
                  <select
                    id="preCombinedApparelType"
                    value={formData.preCombinedApparelType || ''}
                    onChange={(e) => setFormData({ ...formData, preCombinedApparelType: e.target.value as ApparelType })}
                    className="w-full p-2 border border-[#E8E4DF] rounded-lg"
                  >
                    {apparelTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="preCombinedApparelName">Apparel Name</Label>
                  <Input
                    id="preCombinedApparelName"
                    value={formData.preCombinedApparelName}
                    onChange={(e) => setFormData({ ...formData, preCombinedApparelName: e.target.value })}
                    placeholder="e.g., Premium Tee, Winter Jacket"
                  />
                </div>

                <div>
                  <Label htmlFor="productId">Product ID (Optional)</Label>
                  <select
                    id="productId"
                    value={formData.productId || ''}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full p-2 border border-[#E8E4DF] rounded-lg"
                  >
                    <option value="">-- Link to Product (Optional) --</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="fileUrl">GLB/glTF File URL *</Label>
              <Input
                id="fileUrl"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="/models/labrador-blue-shirt.glb"
              />
              <p className="text-xs text-[#6B5D56] mt-1">
                Backend URL format: <code className="bg-gray-100 px-1 rounded">/models/filename.glb</code> or <code className="bg-gray-100 px-1 rounded">http://localhost:5000/models/filename.glb</code>
              </p>
            </div>

            <div>
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="/assets/labrador-blue-shirt-thumb.png"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 bg-[#5C3D2E] hover:bg-[#4A3024] text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                {editingAsset ? 'Update Asset' : 'Upload Asset'}
              </Button>
              <Button
                onClick={() => setDialogOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

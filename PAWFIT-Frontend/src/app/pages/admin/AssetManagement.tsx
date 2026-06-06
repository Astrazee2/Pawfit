import { ChangeEvent, useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Asset3D, Breed } from '../../types';
import { assetsAPI } from '../../services/api';
import { normalizeAsset3D } from '../../utils/dataMappers';
import { Edit, PackageOpen, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

type AssetForm = {
  name: string;
  type: Asset3D['type'];
  breed: Breed | '';
  file: File | null;
};

const breeds: Breed[] = ['Labrador Retriever', 'Shih Tzu', 'Dachshund', 'Pomeranian', 'Aspin/Mixed'];
const initialForm: AssetForm = {
  name: '',
  type: 'product',
  breed: '',
  file: null,
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return '-';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
};

export function AssetManagement() {
  const [assets, setAssets] = useState<Asset3D[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset3D | null>(null);
  const [formData, setFormData] = useState<AssetForm>(initialForm);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const data = await assetsAPI.getAssets();
      setAssets(Array.isArray(data) ? data.map(normalizeAsset3D).filter(asset => asset.id) : []);
    } catch (err) {
      toast.error('Unable to load 3D assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleOpenDialog = (asset?: Asset3D) => {
    setEditingAsset(asset || null);
    setFormData(asset ? {
      name: asset.name,
      type: asset.type,
      breed: asset.breed || '',
      file: null,
    } : initialForm);
    setDialogOpen(true);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFormData({ ...formData, file });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Asset name is required');
      return;
    }

    if (!editingAsset && !formData.file) {
      toast.error('Please choose a GLB or glTF file');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('type', formData.type);
    payload.append('breed', formData.type === 'body' ? formData.breed : '');
    if (formData.file) {
      payload.append('file', formData.file);
    }

    setSaving(true);
    try {
      if (editingAsset) {
        await assetsAPI.updateAsset(editingAsset.id, payload);
        toast.success('3D asset updated');
      } else {
        await assetsAPI.createAsset(payload);
        toast.success('3D asset uploaded');
      }
      setDialogOpen(false);
      await loadAssets();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save 3D asset');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await assetsAPI.deleteAsset(id);
      setAssets(assets.filter(asset => asset.id !== id));
      toast.success('3D asset deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete 3D asset');
    }
  };

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

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-[#6B5D56]">Loading 3D assets...</div>
          ) : assets.length === 0 ? (
            <div className="p-12 text-center text-[#6B5D56]">
              <PackageOpen className="w-12 h-12 mx-auto mb-3 text-[#C4714A]" />
              No 3D assets uploaded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Associated Breed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-xs text-gray-500">{asset.originalName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={asset.type === 'body' ? 'default' : 'secondary'}>
                          {asset.type === 'body' ? 'Base Body Model' : 'Product/Clothing Model'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{asset.breed || ''}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(asset.size)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-sm">
                        <a href={asset.url} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">
                          {asset.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button onClick={() => handleOpenDialog(asset)} className="text-teal-600 hover:text-teal-800" aria-label="Edit asset">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(asset.id)} className="text-red-600 hover:text-red-800" aria-label="Delete asset">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAsset ? 'Edit 3D Asset' : 'Upload New 3D Asset'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assetName">Asset Name</Label>
              <Input id="assetName" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div>
              <Label htmlFor="assetType">Asset Type</Label>
              <select
                id="assetType"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Asset3D['type'], breed: e.target.value === 'body' ? formData.breed : '' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="product">Product/Clothing Model</option>
                <option value="body">Base Body Model</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Base body models should be unclothed pet bodies. Clothing or fitted outfits should be product models and assigned in Product Management.
              </p>
            </div>

            {formData.type === 'body' && (
              <div>
                <Label htmlFor="breed">Associated Breed</Label>
                <select
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value as Breed | '' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">None</option>
                  {breeds.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="file">GLB/glTF File</Label>
              <div className="mt-2 flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-600">
                    {formData.file?.name || (editingAsset ? 'Choose a replacement file' : 'Click to upload GLB/glTF file')}
                  </span>
                  <input id="file" type="file" className="hidden" accept=".glb,.gltf" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-2 bg-[#5C3D2E] hover:bg-[#4A3024] text-white rounded-xl font-medium disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingAsset ? 'Update Asset' : 'Upload Asset'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

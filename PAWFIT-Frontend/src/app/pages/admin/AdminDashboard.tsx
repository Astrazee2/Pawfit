import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Package, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Order, Product } from '../../types';
import { ordersAPI, productsAPI } from '../../services/api';
import { normalizeOrder, normalizeProduct } from '../../utils/dataMappers';

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productData, orderData] = await Promise.all([
          productsAPI.getProducts(),
          ordersAPI.getOrders(),
        ]);

        setProducts(Array.isArray(productData) ? productData.map(normalizeProduct).filter(product => product.id) : []);
        setOrders(Array.isArray(orderData) ? orderData.map(normalizeOrder) : []);
      } catch (err) {
        setProducts([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const revenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  const popularProducts = products.slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            Overview
          </h2>
          <select className="px-4 py-2 border border-[#E8E4DF] rounded-xl text-sm text-[#6B5D56]">
            <option>Current data</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm rounded-3xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-[#8B4A4A] mb-2">Total Products</p>
                  <p className="text-4xl font-bold text-[#5C3D2E] mb-2">{loading ? '-' : products.length}</p>
                  <div className="flex items-center gap-1 text-sm text-[#6B5D56]">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Synced from database
                  </div>
                </div>
                <Package className="w-8 h-8 text-[#C4714A]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-3xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-[#4A4A8B] mb-2">Total Orders</p>
                  <p className="text-4xl font-bold text-[#5C3D2E] mb-2">{loading ? '-' : orders.length}</p>
                  <div className="flex items-center gap-1 text-sm text-[#6B5D56]">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Synced from database
                  </div>
                </div>
                <ShoppingBag className="w-8 h-8 text-[#C4714A]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-3xl">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-[#4A6B8B] mb-2">Revenue</p>
                  <p className="text-4xl font-bold text-[#5C3D2E] mb-2">${loading ? '-' : revenue.toFixed(2)}</p>
                  <div className="flex items-center gap-1 text-sm text-[#6B5D56]">
                    <Users className="w-4 h-4 text-[#C4714A]" />
                    Based on loaded orders
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-sm rounded-3xl">
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-[#5C3D2E] mb-6">Products</h3>
          <div className="space-y-4">
            {popularProducts.length === 0 ? (
              <p className="text-sm text-[#6B5D56]">No products available yet.</p>
            ) : popularProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between pb-4 border-b border-[#E8E4DF] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#FAF7F2] rounded-xl overflow-hidden">
                    {product.images[0] && <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-medium text-[#5C3D2E]">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{product.apparelType}</Badge>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-[#5C3D2E]">${product.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

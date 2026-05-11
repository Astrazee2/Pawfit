import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ApparelType, Breed, Order, OrderStatus, Product, Size } from '../types';
import { ordersAPI } from '../services/api';
import { Package } from 'lucide-react';

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
};

type BackendOrderItem = {
  product?: BackendProduct | string | null;
  size?: Size;
  quantity?: number;
  price?: number;
};

type BackendOrder = {
  _id?: string;
  id?: string;
  orderNumber?: string;
  createdAt?: string;
  date?: string;
  items?: BackendOrderItem[];
  totalAmount?: number;
  total?: number;
  status?: string;
  shippingAddress?: {
    fullName?: string;
    address?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    phone?: string;
  };
  shippingInfo?: Order['shippingInfo'];
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

const normalizeProduct = (product: BackendProduct | string | null | undefined, itemPrice = 0): Product => {
  if (!product || typeof product === 'string') {
    return {
      id: typeof product === 'string' ? product : '',
      name: 'Product unavailable',
      description: '',
      price: itemPrice,
      apparelType: 'Shirt',
      breedCompatibility: [],
      sizesAvailable: [],
      images: [],
    };
  }

  return {
    id: product.id ?? product._id ?? '',
    name: product.name ?? 'Product unavailable',
    description: product.description ?? '',
    price: product.price ?? itemPrice,
    apparelType: apparelTypeLabels[product.apparelType ?? product.type ?? 'shirt'] ?? 'Shirt',
    breedCompatibility: product.breedCompatibility ?? [],
    sizesAvailable: product.sizesAvailable ?? product.sizes ?? [],
    images: product.images ?? (product.imageUrl ? [product.imageUrl] : []),
    glbAsset: product.glbAsset ?? product.glbAssetUrl,
  };
};

const normalizeStatus = (status?: string): OrderStatus => {
  switch (status) {
    case 'shipped':
    case 'Shipped':
      return 'Shipped';
    case 'delivered':
    case 'Delivered':
      return 'Delivered';
    case 'cancelled':
    case 'Cancelled':
      return 'Cancelled';
    default:
      return 'Processing';
  }
};

const normalizeOrder = (order: BackendOrder): Order => {
  const id = order.id ?? order._id ?? '';
  const items = (order.items ?? []).map(item => ({
    product: normalizeProduct(item.product, item.price ?? 0),
    size: item.size ?? 'M',
    quantity: item.quantity ?? 1,
  }));

  return {
    id,
    orderNumber: order.orderNumber ?? `#${id.slice(-6).toUpperCase()}`,
    date: order.date ?? order.createdAt ?? new Date().toISOString(),
    items,
    total: order.total ?? order.totalAmount ?? items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    status: normalizeStatus(order.status),
    shippingInfo: order.shippingInfo ?? {
      name: order.shippingAddress?.fullName ?? '',
      address: [
        order.shippingAddress?.address,
        order.shippingAddress?.city,
        order.shippingAddress?.province,
        order.shippingAddress?.zipCode,
      ].filter(Boolean).join(', '),
      contactNumber: order.shippingAddress?.phone ?? '',
    },
  };
};

export function OrderHistory() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await ordersAPI.getOrders();

        if (!Array.isArray(data)) {
          throw new Error(data?.message || 'Unable to load orders');
        }

        setOrders(data.map(normalizeOrder));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to view order history</h1>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8 text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
        <span className="mr-3">📦</span>
        Order History
      </h1>

      {loading ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-[#C4714A]" />
            <p className="text-[#6B5D56]">Loading orders...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-[#8B4A4A] mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-8xl mb-4">🐶</div>
            <h2 className="text-2xl font-bold mb-2 text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>No orders yet</h2>
            <p className="text-[#6B5D56] mb-6">Start shopping to create your first order</p>
            <Button onClick={() => navigate('/products')}>Browse Products</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Order {order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.date).toLocaleDateString()} • {order.items.length} items
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-right">
                      <p className="text-sm text-[#6B5D56]">Total</p>
                      <p className="text-lg font-bold text-[#5C3D2E]">${order.total.toFixed(2)}</p>
                    </div>
                    <Badge
                      variant={
                        order.status === 'Delivered' ? 'default' :
                        order.status === 'Shipped' ? 'secondary' :
                        'outline'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.product.name} (Size {item.size}) × {item.quantity}
                        </span>
                        <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

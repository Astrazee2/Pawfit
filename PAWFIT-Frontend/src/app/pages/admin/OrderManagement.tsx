import { useEffect, useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Order, OrderStatus } from '../../types';
import { toast } from 'sonner';
import { ordersAPI } from '../../services/api';
import { normalizeOrder } from '../../utils/dataMappers';

const toBackendStatus: Record<OrderStatus, string> = {
  Processing: 'pending',
  Shipped: 'shipped',
  Delivered: 'delivered',
  Cancelled: 'cancelled',
};

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'All'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await ordersAPI.getOrders();
        setOrders(Array.isArray(data) ? data.map(normalizeOrder) : []);
      } catch (err) {
        toast.error('Unable to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = normalizeOrder(await ordersAPI.updateOrderStatus(orderId, toBackendStatus[newStatus]));
      setOrders(orders.map(order => order.id === orderId ? updatedOrder : order));
      toast.success('Order status updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to update order');
    }
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
        Order Management
      </h1>

      <div className="mb-6 flex gap-2">
        {(['All', 'Processing', 'Shipped', 'Delivered'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === status
                ? 'bg-[#5C3D2E] text-white'
                : 'border border-[#E8E4DF] text-[#6B5D56] hover:bg-[#FAF7F2]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading orders...</td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No orders found</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{order.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium">{order.shippingInfo.name}</div>
                          <div className="text-gray-500">{order.shippingInfo.contactNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-teal-600">${order.total.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ShippingInfo } from '../types';
import { toast } from 'sonner';
import { ordersAPI } from '../services/api';
import { Model3DViewer } from '../components/Model3DViewer';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    paypal?: any;
  }
}

export function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: user?.name || '',
    address: '',
    contactNumber: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);

  // Load PayPal SDK
  useEffect(() => {
    if (!window.paypal) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}`;
      script.async = true;
      script.onload = () => {
        setPaypalReady(true);
      };
      document.head.appendChild(script);
    } else {
      setPaypalReady(true);
    }
  }, []);

  const handleCreateOrder = async () => {
    if (!shippingInfo.name || !shippingInfo.address || !shippingInfo.contactNumber) {
      toast.error('Please fill in all shipping information');
      return;
    }

    setLoading(true);
    try {
      // First create the order in the database
      const createdOrder = await ordersAPI.createOrder({
        items: cart.map(item => ({
          product: item.product.id,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
        })),
        totalAmount: cartTotal + 5,
        shippingAddress: {
          fullName: shippingInfo.name,
          address: shippingInfo.address,
          phone: shippingInfo.contactNumber,
        },
        paymentMethod: paymentMethod,
      });

      setOrderId(createdOrder._id || createdOrder.id);

      if (paymentMethod === 'COD') {
        await clearCart();
        navigate(`/order-confirmation/${createdOrder._id || createdOrder.id}`);
        toast.success('Order placed successfully!');
      } else if (paymentMethod === 'PayPal') {
        handlePayPalPayment(createdOrder._id || createdOrder.id);
      } else if (paymentMethod === 'GCash') {
        handleGCashPayment(createdOrder._id || createdOrder.id);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to place order');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async (createdOrderId: string) => {
    try {
      // Get PayPal order details
      const paypalOrderResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/paypal/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderId: createdOrderId })
      });

      const paypalOrder = await paypalOrderResponse.json();
      
      if (paypalOrder.link) {
        // Redirect to PayPal
        window.location.href = paypalOrder.link;
      }
    } catch (err) {
      toast.error('Failed to process PayPal payment');
    }
  };

  const handleGCashPayment = async (createdOrderId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/payments/gcash/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          orderId: createdOrderId,
          amount: cartTotal + 5
        })
      });

      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      toast.error('Failed to process GCash payment');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Please login to checkout</h1>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8 text-[#5C3D2E]" style={{ fontFamily: "'DM Serif Display', serif" }}>
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label htmlFor="address">Shipping Address</Label>
                <Input
                  id="address"
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  placeholder="123 Main St, City, Country"
                />
              </div>

              <div>
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={shippingInfo.contactNumber}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, contactNumber: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['COD', 'GCash', 'PayPal'].map((method) => (
                  <label key={method} className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={loading}
                    />
                    <span className={loading ? 'text-gray-400' : ''}>{method}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 text-sm text-blue-700">
                {paymentMethod === 'COD' && 'Pay when you receive your order'}
                {paymentMethod === 'PayPal' && 'You will be redirected to PayPal to complete payment'}
                {paymentMethod === 'GCash' && 'You will be redirected to GCash payment gateway'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {cart.map((item) => {
                  const key = `${item.product.id}-${item.size}`;
                  
                  return (
                    <div key={key} className="border-b pb-4">
                      <div className="flex justify-between gap-4 text-sm mb-2">
                        <span className="text-gray-600 font-medium">
                          {item.product.name} (Size {item.size}) x {item.quantity}
                        </span>
                        <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      {item.product.glbAsset && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-[#E8E4DF]">
                          <Model3DViewer
                            modelUrl={item.product.glbAsset}
                            scale={1}
                            autoRotate={true}
                            className="w-full h-32"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">$5.00</span>
                </div>
              </div>

              <div className="border-t border-[#E8E4DF] pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-[#5C3D2E]">Total</span>
                  <span className="text-[#5C3D2E]">${(cartTotal + 5).toFixed(2)}</span>
                </div>
              </div>

              <Button 
                onClick={handleCreateOrder} 
                className="w-full bg-[#5C3D2E] hover:bg-[#4A3024] rounded-xl" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `${paymentMethod === 'COD' ? 'Place Order' : 'Continue to Payment'}`
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

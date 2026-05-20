import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem, Product, Size } from '../types';
import { cartAPI } from '../services/api';
import { normalizeCartItems } from '../utils/dataMappers';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: Size) => Promise<void>;
  removeFromCart: (productId: string, size: Size) => Promise<void>;
  updateQuantity: (productId: string, size: Size, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }

    const loadCart = async () => {
      const data = await cartAPI.getCart();
      setCart(normalizeCartItems(data.items));
    };

    loadCart().catch(() => setCart([]));
  }, [isAuthenticated]);

  const addToCart = async (product: Product, size: Size) => {
    const data = await cartAPI.addToCart(product.id, size, 1, product.price);
    setCart(normalizeCartItems(data.items));
  };

  const removeFromCart = async (productId: string, size: Size) => {
    const item = cart.find(cartItem => cartItem.product.id === productId && cartItem.size === size);
    if (!item?.cartItemId) return;

    const data = await cartAPI.removeFromCart(item.cartItemId);
    setCart(normalizeCartItems(data.items));
  };

  const updateQuantity = async (productId: string, size: Size, quantity: number) => {
    const item = cart.find(cartItem => cartItem.product.id === productId && cartItem.size === size);
    if (!item?.cartItemId) return;

    if (quantity <= 0) {
      await removeFromCart(productId, size);
      return;
    }

    const data = await cartAPI.updateCartItem(item.cartItemId, quantity);
    setCart(normalizeCartItems(data.items));
  };

  const clearCart = async () => {
    await cartAPI.clearCart();
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

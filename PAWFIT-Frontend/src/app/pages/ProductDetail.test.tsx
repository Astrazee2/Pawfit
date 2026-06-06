import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductDetail } from '../ProductDetail';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import * as api from '../../services/api';

vi.mock('../../services/api');
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockProduct = {
  id: '1',
  name: 'Premium Dog Shirt',
  price: 29.99,
  description: 'A comfortable and stylish shirt for your furry friend',
  apparelType: 'Shirt',
  images: ['image1.jpg', 'image2.jpg'],
  sizesAvailable: ['XS', 'S', 'M', 'L', 'XL'],
  breedCompatibility: ['Labrador Retriever', 'Dachshund'],
  glbAsset: 'model.glb'
};

const mockAuthContext = {
  user: { id: '123', name: 'John Doe', email: 'john@example.com', role: 'user' },
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn()
};

const mockCartContext = {
  cart: [],
  addToCart: vi.fn(),
  removeFromCart: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  cartTotal: 0
};

const renderComponent = (
  authValue = mockAuthContext,
  cartValue = mockCartContext
) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        <CartContext.Provider value={cartValue}>
          <ProductDetail />
        </CartContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('ProductDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Product Loading', () => {
    it('should display loading state initially', async () => {
      vi.mocked(api.productsAPI.getProductById).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockProduct), 100))
      );

      renderComponent();
      expect(screen.getByText(/loading product/i)).toBeInTheDocument();
    });

    it('should load and display product details', async () => {
      vi.mocked(api.productsAPI.getProductById).mockResolvedValue(mockProduct);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
      });
      expect(screen.getByText(/premium dog shirt/i)).toBeInTheDocument();
      expect(screen.getByText(`$${mockProduct.price.toFixed(2)}`)).toBeInTheDocument();
    });

    it('should display error when product fails to load', async () => {
      vi.mocked(api.productsAPI.getProductById).mockRejectedValue(
        new Error('Product not found')
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/product not found/i)).toBeInTheDocument();
      });
    });

    it('should display error when product ID is missing', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/product not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Product Display', () => {
    beforeEach(() => {
      vi.mocked(api.productsAPI.getProductById).mockResolvedValue(mockProduct);
    });

    it('should display product images', async () => {
      renderComponent();

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });

    it('should display product description', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
      });
    });

    it('should display apparel type badge', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Shirt')).toBeInTheDocument();
      });
    });

    it('should display breed compatibility', async () => {
      renderComponent();

      await waitFor(() => {
        mockProduct.breedCompatibility.forEach(breed => {
          expect(screen.getByText(breed)).toBeInTheDocument();
        });
      });
    });

    it('should display all available sizes', async () => {
      renderComponent();

      await waitFor(() => {
        mockProduct.sizesAvailable.forEach(size => {
          expect(screen.getByText(size)).toBeInTheDocument();
        });
      });
    });

    it('should display product details card', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/product details/i)).toBeInTheDocument();
        expect(screen.getByText(/apparel type/i)).toBeInTheDocument();
        expect(screen.getByText(/available sizes/i)).toBeInTheDocument();
      });
    });
  });

  describe('Size Selection', () => {
    beforeEach(() => {
      vi.mocked(api.productsAPI.getProductById).mockResolvedValue(mockProduct);
    });

    it('should allow selecting a size', async () => {
      renderComponent();

      await waitFor(() => {
        const sizeButtons = screen.getAllByRole('button');
        const mButton = sizeButtons.find(btn => btn.textContent === 'M');
        expect(mButton).toBeInTheDocument();
      });
    });

    it('should highlight selected size', async () => {
      renderComponent();

      await waitFor(() => {
        const sizeButtons = screen.getAllByRole('button');
        const mButton = sizeButtons.find(btn => btn.textContent === 'M');
        fireEvent.click(mButton!);
        
        expect(mButton).toHaveClass('bg-[#F5EFE7]');
      });
    });

    it('should disable add to cart without size selection', async () => {
      renderComponent();

      await waitFor(() => {
        const addToCartBtn = screen.getByRole('button', { name: /add to cart/i });
        expect(addToCartBtn).toBeDisabled();
      });
    });
  });

  describe('Add to Cart', () => {
    beforeEach(() => {
      vi.mocked(api.productsAPI.getProductById).mockResolvedValue(mockProduct);
    });

    it('should show error when adding to cart without size', async () => {
      const { toast } = require('sonner');
      renderComponent();

      await waitFor(() => {
        const addToCartBtn = screen.getByRole('button', { name: /add to cart/i });
        fireEvent.click(addToCartBtn);
        expect(toast.error).toHaveBeenCalledWith('Please select a size');
      });
    });

    it('should show error when not authenticated', async () => {
      const { toast } = require('sonner');
      const unauthContext = { ...mockAuthContext, isAuthenticated: false };
      
      vi.mocked(api.productsAPI.getProductById).mockResolvedValue(mockProduct);
      renderComponent(unauthContext);

      await waitFor(() => {
        const sizeButtons = screen.getAllByRole('button');
        const mButton = sizeButtons.find(btn => btn.textContent === 'M');
        fireEvent.click(mButton!);
        
        const addToCartBtn = screen.getByRole('button', { name: /add to cart/i });
        fireEvent.click(addToCartBtn);

        expect(toast.error).toHaveBeenCalledWith('Please login to add items to cart');
      });
    });

    it('should add item to cart with size selected', async () => {
      const { toast } = require('sonner');
      const mockAddToCart = vi.fn();
      const customCartContext = { ...mockCartContext, addToCart: mockAddToCart };

      vi.mocked(api.productsAPI.getProductById).mockResolvedValue(mockProduct);
      renderComponent(mockAuthContext, customCartContext);

      await waitFor(() => {
        const sizeButtons = screen.getAllByRole('button');
        const mButton = sizeButtons.find(btn => btn.textContent === 'M');
        fireEvent.click(mButton!);

        const addToCartBtn = screen.getByRole('button', { name: /add to cart/i });
        fireEvent.click(addToCartBtn);

        expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 'M');
        expect(toast.success).toHaveBeenCalledWith('Added to cart');
      });
    });

    it('should handle add to cart errors', async () => {
      const { toast } = require('sonner');
      const mockAddToCart = vi.fn().mockRejectedValue(new Error('Network error'));
      const customCartContext = { ...mockCartContext, addToCart: mockAddToCart };

      vi.mocked(api.productsAPI.getProductById).mockResolvedValue(mockProduct);
      renderComponent(mockAuthContext, customCartContext);

      await waitFor(() => {
        const sizeButtons = screen.getAllByRole('button');
        const mButton = sizeButtons.find(btn => btn.textContent === 'M');
        fireEvent.click(mButton!);

        const addToCartBtn = screen.getByRole('button', { name: /add to cart/i });
        fireEvent.click(addToCartBtn);

        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });
  });

  describe('Try On Feature', () => {
    beforeEach(() => {
      vi.mocked(api.productsAPI.getProductById).mockResolvedValue(mockProduct);
    });

    it('should navigate to try-on page when button clicked', async () => {
      const navigateMock = vi.fn();
      renderComponent();

      await waitFor(() => {
        const tryOnBtn = screen.getByRole('button', { name: /try on in 3d/i });
        fireEvent.click(tryOnBtn);
        expect(navigateMock).toHaveBeenCalledWith(`/try-on?product=${mockProduct.id}`);
      });
    });

    it('should display try-on button with sparkles icon', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try on in 3d/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      vi.mocked(api.productsAPI.getProductById).mockResolvedValue(mockProduct);
    });

    it('should display back button', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to products/i })).toBeInTheDocument();
      });
    });

    it('should have back button when product not found', async () => {
      vi.mocked(api.productsAPI.getProductById).mockRejectedValue(
        new Error('Not found')
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to products/i })).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      vi.mocked(api.productsAPI.getProductById).mockResolvedValue(mockProduct);
    });

    it('should have responsive grid layout', async () => {
      renderComponent();

      await waitFor(() => {
        const container = screen.getByText(mockProduct.name).closest('div');
        expect(container).toHaveClass('grid');
      });
    });
  });

  describe('Price Display', () => {
    beforeEach(() => {
      vi.mocked(api.productsAPI.getProductById).mockResolvedValue(mockProduct);
    });

    it('should display price correctly formatted', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('$29.99')).toBeInTheDocument();
      });
    });

    it('should have correct currency symbol', async () => {
      renderComponent();

      await waitFor(() => {
        const priceText = screen.getByText('$29.99');
        expect(priceText.textContent).toMatch(/^\$/);
      });
    });
  });
});

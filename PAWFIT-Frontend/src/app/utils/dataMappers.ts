import { ApparelType, Breed, CartItem, Order, OrderStatus, Product, Size } from '../types';

export type BackendProduct = {
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
  message?: string;
};

export type BackendOrderItem = {
  _id?: string;
  product?: BackendProduct | string | null;
  size?: Size;
  quantity?: number;
  price?: number;
};

export type BackendOrder = {
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

export type BackendCart = {
  items?: BackendOrderItem[];
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

export const normalizeProduct = (product: BackendProduct | string | null | undefined, itemPrice = 0): Product => {
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
    name: product.name ?? 'Untitled Product',
    description: product.description ?? '',
    price: product.price ?? itemPrice,
    apparelType: apparelTypeLabels[product.apparelType ?? product.type ?? 'shirt'] ?? 'Shirt',
    breedCompatibility: product.breedCompatibility ?? [],
    sizesAvailable: product.sizesAvailable ?? product.sizes ?? [],
    images: product.images ?? (product.imageUrl ? [product.imageUrl] : []),
    glbAsset: product.glbAsset ?? product.glbAssetUrl,
  };
};

export const normalizeCartItems = (items: BackendOrderItem[] = []): CartItem[] =>
  items
    .map(item => ({
      product: normalizeProduct(item.product, item.price ?? 0),
      size: item.size ?? 'M',
      quantity: item.quantity ?? 1,
      cartItemId: item._id,
    }))
    .filter(item => item.product.id);

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

export const normalizeOrder = (order: BackendOrder): Order => {
  const id = order.id ?? order._id ?? '';
  const items = normalizeCartItems(order.items);

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

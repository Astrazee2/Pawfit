const BASE_URL = 'http://localhost:5000/api'

// Helper function to get token
const getToken = () => localStorage.getItem('token')

// Helper function for headers
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
})

const jsonOrThrow = async (res: Response) => {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || 'Request failed')
  }
  return data
}

// ==================== AUTH ====================
export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    return jsonOrThrow(res)
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return jsonOrThrow(res)
  }
}

// ==================== PETS ====================
export const petsAPI = {
  getPets: async () => {
    const res = await fetch(`${BASE_URL}/pets`, {
      headers: authHeaders()
    })
    return jsonOrThrow(res)
  },

  createPet: async (petData: any) => {
    const res = await fetch(`${BASE_URL}/pets`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(petData)
    })
    return jsonOrThrow(res)
  },

  updatePet: async (id: string, petData: any) => {
    const res = await fetch(`${BASE_URL}/pets/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(petData)
    })
    return jsonOrThrow(res)
  },

  deletePet: async (id: string) => {
    const res = await fetch(`${BASE_URL}/pets/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    return jsonOrThrow(res)
  }
}

// ==================== PRODUCTS ====================
export const productsAPI = {
  getProducts: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString()
    const res = await fetch(`${BASE_URL}/products?${params}`)
    return jsonOrThrow(res)
  },

  getProductById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/products/${id}`)
    return jsonOrThrow(res)
  },

  createProduct: async (productData: any) => {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(productData)
    })
    return jsonOrThrow(res)
  },

  updateProduct: async (id: string, productData: any) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(productData)
    })
    return jsonOrThrow(res)
  },

  deleteProduct: async (id: string) => {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    return jsonOrThrow(res)
  }
}

// ==================== CART ====================
export const cartAPI = {
  getCart: async () => {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: authHeaders()
    })
    return jsonOrThrow(res)
  },

  addToCart: async (productId: string, size: string, quantity: number, price: number) => {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ productId, size, quantity, price })
    })
    return jsonOrThrow(res)
  },

  updateCartItem: async (itemId: string, quantity: number) => {
    const res = await fetch(`${BASE_URL}/cart/${itemId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ quantity })
    })
    return jsonOrThrow(res)
  },

  removeFromCart: async (itemId: string) => {
    const res = await fetch(`${BASE_URL}/cart/${itemId}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    return jsonOrThrow(res)
  },

  clearCart: async () => {
    const res = await fetch(`${BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    return jsonOrThrow(res)
  }
}

// ==================== ORDERS ====================
export const ordersAPI = {
  createOrder: async (orderData: any) => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(orderData)
    })
    return jsonOrThrow(res)
  },

  getOrders: async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      headers: authHeaders()
    })
    return jsonOrThrow(res)
  },

  getOrderById: async (id: string) => {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      headers: authHeaders()
    })
    return jsonOrThrow(res)
  },

  updateOrderStatus: async (id: string, status: string) => {
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    })
    return jsonOrThrow(res)
  }
}

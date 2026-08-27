import Order from '../models/Order.js'
import Cart from '../models/Cart.js'

// Create order
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body

    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending'
    })

    // Clear cart after order
    await Cart.findOneAndDelete({ user: req.user.id })

    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get user orders
export const getOrders = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user.id }
    const orders = await Order.find(filter)
      .populate('items.product')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user.id }
    const order = await Order.findOne(filter)
      .populate('items.product')
      .populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Update order status (admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid order status' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate('items.product').populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
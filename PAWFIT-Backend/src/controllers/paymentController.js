import Order from '../models/Order.js'
import axios from 'axios'

// PayPal Configuration
const PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'sandbox' 
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com'

const getPayPalToken = async () => {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )
    return response.data.access_token
  } catch (err) {
    throw new Error('Failed to get PayPal access token: ' + err.message)
  }
}

// Create PayPal Order
export const createPayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.body
    const order = await Order.findById(orderId).populate('items.product')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const token = await getPayPalToken()

    const paypalOrder = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: order.totalAmount.toString()
          },
          description: `PawFit Order - ${order._id}`
        }
      ],
      return_url: `${process.env.FRONTEND_URL}/order-confirmation/${order._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout`
    }

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders`,
      paypalOrder,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    res.json({
      id: response.data.id,
      link: response.data.links.find(link => link.rel === 'approve')?.href
    })
  } catch (err) {
    res.status(500).json({ message: 'Payment processing error', error: err.message })
  }
}

// Capture PayPal Payment
export const capturePayPalPayment = async (req, res) => {
  try {
    const { orderId, paypalOrderId } = req.body
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const token = await getPayPalToken()

    const response = await axios.post(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data.status === 'COMPLETED') {
      const captureId = response.data.purchase_units[0].payments.captures[0].id
      
      order.paymentStatus = 'completed'
      order.status = 'confirmed'
      order.paymentId = captureId
      order.paymentDetails = {
        transactionId: captureId,
        provider: 'PayPal',
        paidAt: new Date()
      }
      
      await order.save()

      return res.json({
        success: true,
        message: 'Payment completed successfully',
        order
      })
    }

    res.status(400).json({ message: 'Payment was not completed' })
  } catch (err) {
    res.status(500).json({ message: 'Payment capture error', error: err.message })
  }
}

// Process GCash Payment (using Paymongo)
export const processGCashPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Create Paymongo checkout session
    const paymongoResponse = await axios.post(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        data: {
          attributes: {
            send_email_receipt: false,
            show_payment_details: true,
            line_items: [
              {
                currency: 'PHP',
                amount: Math.round(amount * 100), // Convert to centavos
                description: `PawFit Order ${order._id}`,
                quantity: 1,
                name: 'PawFit Order'
              }
            ],
            payment_method_types: ['gcash'],
            success_url: `${process.env.FRONTEND_URL}/order-confirmation/${order._id}?paymentMethod=gcash`,
            cancel_url: `${process.env.FRONTEND_URL}/checkout`
          }
        }
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const checkoutUrl = paymongoResponse.data.data.attributes.checkout_url

    // Store checkout session info
    order.paymentId = paymongoResponse.data.data.id
    order.paymentMethod = 'GCash'
    await order.save()

    res.json({
      success: true,
      checkoutUrl,
      sessionId: paymongoResponse.data.data.id
    })
  } catch (err) {
    res.status(500).json({ message: 'GCash payment error', error: err.message })
  }
}

// Verify Payment Status
export const verifyPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json({
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      orderStatus: order.status
    })
  } catch (err) {
    res.status(500).json({ message: 'Error verifying payment', error: err.message })
  }
}

// COD Order (Cash on Delivery)
export const createCODOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body

    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      status: 'confirmed'
    })

    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ message: 'Error creating COD order', error: err.message })
  }
}

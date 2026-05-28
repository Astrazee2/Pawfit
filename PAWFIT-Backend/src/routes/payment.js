import express from 'express'
import {
  createPayPalOrder,
  capturePayPalPayment,
  processGCashPayment,
  verifyPaymentStatus,
  createCODOrder
} from '../controllers/paymentController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.post('/paypal/create-order', protect, createPayPalOrder)
router.post('/paypal/capture', protect, capturePayPalPayment)
router.post('/gcash/create-checkout', protect, processGCashPayment)
router.get('/status/:orderId', protect, verifyPaymentStatus)
router.post('/cod', protect, createCODOrder)

export default router

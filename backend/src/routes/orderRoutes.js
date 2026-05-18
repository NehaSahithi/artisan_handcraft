import express from 'express'
import * as orderController from '../controllers/orderController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, orderController.createOrder)
router.post('/verify', protect, orderController.verifyPayment)
router.get('/', protect, orderController.getOrders)
router.get('/stats', protect, authorize('artisan', 'admin'), orderController.getSalesStats)
router.get('/:id', protect, orderController.getOrderById)
router.put('/:id/status', protect, authorize('artisan', 'admin'), orderController.updateOrderStatus)
router.put('/:id/cancel', protect, orderController.cancelOrder)

export default router

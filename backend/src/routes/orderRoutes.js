import express from 'express';
import * as orderController from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, updateItemStatusSchema } from '../validators/orderValidator.js';

const router = express.Router();

// 1. Checkout (Restricted to Buyers + Zod Validation)
router.post(
  '/', 
  protect, 
  authorize('buyer'), 
  validate(createOrderSchema), 
  orderController.createOrder
);

// 2. Secure signature verify (Session Protected)
router.post('/verify-payment', protect, orderController.verifyPayment);

// 3. Buyer order history listing
router.get('/my-orders', protect, orderController.getMyOrders);

// 4. Seller order history listing
router.get('/seller-orders', protect, authorize('artisan'), orderController.getSellerOrders);

// 5. Seller sales statistics
router.get('/stats', protect, authorize('artisan'), orderController.getSalesStats);

// 6. Detailed Order retrieval (with secure owner/seller authorization filter)
router.get('/:id', protect, orderController.getOrderById);

// 7. Seller specific shipping status update (Updates specific order item stage)
router.put(
  '/:id/item/:itemId/status',
  protect,
  authorize('artisan'),
  validate(updateItemStatusSchema),
  orderController.updateItemStatus
);

// 8. Buyer specific cancellation (Restores stocks + marks refund if paid)
router.put('/:id/cancel', protect, authorize('buyer'), orderController.cancelOrder);

export default router;

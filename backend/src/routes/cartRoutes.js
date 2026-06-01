import express from 'express';
import * as cartController from '../controllers/cartController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Enforce authentication & buyer role guards globally for all cart routes
router.use(protect, authorize('buyer'));

// View cart (self-healing for deactivated listings)
router.get('/', cartController.getCart);

// Add product to cart (stock + quantity check)
router.post('/add', cartController.addToCart);

// Update item quantity
router.put('/update', cartController.updateCartItem);

// Clear entire cart
router.delete('/clear', cartController.clearCart);

// Remove specific item by product ID
router.delete('/:productId', cartController.removeCartItem);

export default router;

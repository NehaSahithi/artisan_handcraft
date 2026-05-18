import express from 'express'
import * as cartController from '../controllers/cartController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, cartController.getCart)
router.post('/', protect, cartController.addToCart)
router.put('/:productId', protect, cartController.updateCartItem)
router.delete('/:productId', protect, cartController.removeFromCart)
router.delete('/', protect, cartController.clearCart)
router.post('/coupon/apply', protect, cartController.applyCoupon)

export default router

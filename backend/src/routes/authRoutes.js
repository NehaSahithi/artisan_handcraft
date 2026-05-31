import express from 'express'
import rateLimit from 'express-rate-limit'
import * as authController from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: 'Too many login attempts, please try again after 15 minutes',
	},
})

const registerLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 3,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: 'Too many registration attempts, please try again after 15 minutes',
	},
})

router.post('/register', registerLimiter, authController.register)
router.post('/login', loginLimiter, authController.login)
router.post('/logout', authController.logout)

router.get('/me', protect, authController.getCurrentUser)
router.put('/profile', protect, authController.updateProfile)

// Address routes
router.post('/addresses', protect, authController.addAddress)
router.put('/addresses/:addressId', protect, authController.updateAddress)
router.delete('/addresses/:addressId', protect, authController.deleteAddress)

// Wishlist routes
router.get('/wishlist', protect, authController.getWishlist)
router.post('/wishlist/:productId', protect, authController.addToWishlist)
router.delete('/wishlist/:productId', protect, authController.removeFromWishlist)

export default router

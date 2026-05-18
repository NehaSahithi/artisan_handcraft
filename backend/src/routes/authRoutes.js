import express from 'express'
import * as authController from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)
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

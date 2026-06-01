import express from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadAvatar } from '../middleware/upload.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  addressSchema
} from '../validators/authValidator.js';

const router = express.Router();

// 1. Configure specialized endpoint limiters (15-min lockout)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after 15 minutes.'
  }
});

// 2. Authentication entry points (with Rate Limits + Zod Validators)
router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// 3. User verification and password recovery
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);

// 4. Secure Profile Management (Zod Validated & Token Protected)
router.get('/me', protect, authController.getCurrentUser);
router.put('/profile', protect, validate(updateProfileSchema), authController.updateProfile);
router.put('/change-password', protect, validate(changePasswordSchema), authController.changePassword);

// 5. Cloudinary Avatar Uploads
router.put('/avatar', protect, uploadAvatar, authController.updateAvatar);

// 6. Address CRUD operations
router.post('/addresses', protect, validate(addressSchema), authController.addAddress);
router.put('/addresses/:id', protect, validate(addressSchema), authController.updateAddress);
router.delete('/addresses/:id', protect, authController.deleteAddress);

// 7. Wishlist Management
router.get('/wishlist', protect, authController.getWishlist);
router.post('/wishlist/:productId', protect, authController.addToWishlist);
router.delete('/wishlist/:productId', protect, authController.removeFromWishlist);

export default router;

import express from 'express';
import * as artisanController from '../controllers/artisanController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadKYCDocs, uploadShopMedia } from '../middleware/upload.js';

const router = express.Router();

// 1. Private Artisan-Only Settings (Session Protected + Role Guarded)
router.get('/me', protect, authorize('artisan'), artisanController.getMyProfile);
router.get('/dashboard/stats', protect, authorize('artisan'), artisanController.getDashboardStats);
router.put('/profile', protect, authorize('artisan'), artisanController.createOrUpdateProfile);

// 2. Cloud KYC Documents Upload (Aadhaar & PAN to Cloudinary)
router.post('/kyc', protect, authorize('artisan'), uploadKYCDocs, artisanController.updateKYC);

// 3. Shop Media Assets Manager (Logo & Banner to Cloudinary)
router.put('/shop-media', protect, authorize('artisan'), uploadShopMedia, artisanController.updateShopMedia);

// 4. Public Discovery Endpoints (Dynamic parameters MUST be defined last to avoid precedence bugs)
router.get('/', artisanController.getAllArtisans);
router.get('/featured', artisanController.getFeaturedArtisans);
router.get('/states', artisanController.getStatesList);
router.get('/:id', artisanController.getArtisanById);

export default router;

import express from 'express'
import * as artisanController from '../controllers/artisanController.js'
import { protect, authorize } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// Public routes
router.get('/', artisanController.getAllArtisans)
router.get('/featured', artisanController.getFeaturedArtisans)
router.get('/state/list', artisanController.getStatesList)
router.get('/crafts/list', artisanController.getCrafts)
router.get('/state/:state', artisanController.getArtisansByState)

// Protected routes (artisan)
router.post(
  '/profile',
  protect,
  authorize('artisan'),
  artisanController.createOrUpdateProfile
)
router.get('/profile/me', protect, authorize('artisan'), artisanController.getMyProfile)
router.put('/kyc/update', protect, authorize('artisan'), artisanController.updateKYC)
router.get('/stats/my', protect, authorize('artisan'), artisanController.getArtisanStats)
router.put(
  '/media/update',
  protect,
  authorize('artisan'),
  upload.fields([
    { name: 'shopBanner', maxCount: 1 },
    { name: 'shopLogo', maxCount: 1 },
  ]),
  artisanController.updateShopMedia
)

router.get('/:id', artisanController.getArtisanById)

export default router

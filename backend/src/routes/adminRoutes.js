import express from 'express'
import * as adminController from '../controllers/adminController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, authorize('admin'))

router.get('/metrics', adminController.getMetrics)
router.get('/pending-artisans', adminController.getPendingArtisans)
router.post('/verify-artisan/:id', adminController.verifyArtisan)

export default router
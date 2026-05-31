import express from 'express'
import * as productController from '../controllers/productController.js'
import { protect, authorize } from '../middleware/auth.js'
import { uploadMultiple } from '../middleware/upload.js'

const router = express.Router()

// Public routes
router.get('/', productController.getAllProducts)
router.get('/featured', productController.getFeaturedProducts)
router.get('/categories', productController.getCategories)
router.get('/artisan/:artisanId', productController.getProductsByArtisan)
router.get('/:id', productController.getProductById)

// Protected routes (artisan)
router.post('/', protect, authorize('artisan'), uploadMultiple, productController.createProduct)
router.put('/:id', protect, authorize('artisan', 'admin'), uploadMultiple, productController.updateProduct)
router.delete('/:id', protect, authorize('artisan', 'admin'), productController.deleteProduct)

// Review routes
router.post('/:productId/reviews', protect, productController.addReview)

export default router

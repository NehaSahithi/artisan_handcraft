import express from 'express';
import * as productController from '../controllers/productController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadProductImages } from '../middleware/upload.js';
import {
  createProductSchema,
  updateProductSchema,
  reviewSchema
} from '../validators/productValidator.js';

const router = express.Router();

// 1. Isolated Artisan Inventory Management (Placed first to avoid route precedence conflicts)
router.get('/my-products', protect, authorize('artisan'), productController.getMyProducts);

// 2. Public catalog views (with optional auth mapping for wishlist highlights)
router.get('/', optionalAuth, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', optionalAuth, productController.getProductById);

// 3. Protected Product CRUD Operations (Cloudinary uploads + Zod validations)
router.post(
  '/', 
  protect, 
  authorize('artisan'), 
  uploadProductImages, 
  validate(createProductSchema), 
  productController.createProduct
);

router.put(
  '/:id', 
  protect, 
  authorize('artisan', 'admin'), 
  uploadProductImages, 
  validate(updateProductSchema), 
  productController.updateProduct
);

router.delete(
  '/:id', 
  protect, 
  authorize('artisan', 'admin'), 
  productController.deleteProduct
);

// 4. Secure Reviews (Restricted to verified Buyers)
router.post(
  '/:id/reviews', 
  protect, 
  authorize('buyer'), 
  validate(reviewSchema), 
  productController.addReview
);

export default router;

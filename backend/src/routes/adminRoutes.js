import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Enforce strict administrative locks globally across all admin routes
router.use(protect, authorize('admin'));

// 1. Dashboard Metrics Summary
router.get('/metrics', adminController.getDashboardMetrics);

// 2. User Account Administration
router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle-active', adminController.toggleUserActive);

// 3. Artisan KYC verification Panel
router.get('/kyc/pending', adminController.getPendingKYC);
router.put('/kyc/:id/verify', adminController.verifyArtisan);

// 4. E-commerce Order Ledger auditing
router.get('/orders', adminController.getAllOrders);

// 5. Product Catalog auditing
router.get('/products', adminController.getAllProducts);
router.put('/products/:id/toggle-active', adminController.toggleProductActive);
router.put('/products/:id/toggle-featured', adminController.toggleProductFeatured);

export default router;
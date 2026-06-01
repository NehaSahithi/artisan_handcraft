import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import artisanRoutes from './artisanRoutes.js';
import adminRoutes from './adminRoutes.js';
import webhookRoutes from './webhookRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/artisans', artisanRoutes);
router.use('/admin', adminRoutes);
router.use('/webhook', webhookRoutes); // Mount webhook router for Razorpay notifications

export default router;

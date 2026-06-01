import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Webhook route for Razorpay payments and refund captured status updates
router.post('/razorpay', handleRazorpayWebhook);

export default router;

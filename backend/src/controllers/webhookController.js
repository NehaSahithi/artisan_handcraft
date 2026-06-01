import crypto from 'node:crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import { sendOrderConfirmation } from '../utils/email.js';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../constants/categories.js';

// @desc    Process Razorpay asynchronous webhook notifications
// @route   POST /api/webhook/razorpay
// @access  Public (Called by Razorpay)
export const handleRazorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature) {
    console.error('❌ Webhook received without signature header.');
    return res.status(400).send('Signature missing');
  }

  // 1. Verify cryptographic signature using raw body buffer
  const rawBody = req.body; // Injected as Buffer by express.raw() in server.js
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    console.error('❌ Webhook signature verification failed.');
    return res.status(400).send('Invalid signature');
  }

  // 2. Parse payload safely
  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    console.error('❌ Failed to parse webhook raw JSON body.');
    return res.status(400).send('Malformed JSON');
  }

  const { event, payload: eventData } = payload;
  console.log(`🔌 Razorpay Webhook Event Received: "${event}"`);

  // 3. Process events
  switch (event) {
    case 'payment.captured': {
      const paymentInfo = eventData.payment.entity;
      const razorpayOrderId = paymentInfo.order_id;
      const razorpayPaymentId = paymentInfo.id;

      const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
      
      if (!order) {
        console.error(`⚠️  Webhook Order not found for Razorpay Order ID: ${razorpayOrderId}`);
        break;
      }

      // Check if checkout verify-payment already processed this to avoid double-processing
      if (order.payment.status !== PAYMENT_STATUSES.COMPLETED) {
        console.log(`🛡️ Webhook captured payment for Order: ${order.orderNumber}`);

        // Atomically decrement stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
          });
        }

        // Update order status
        order.payment.razorpayPaymentId = razorpayPaymentId;
        order.payment.status = PAYMENT_STATUSES.COMPLETED;
        order.status = ORDER_STATUSES.CONFIRMED;
        order.items.forEach((item) => {
          item.status = ORDER_STATUSES.CONFIRMED;
        });

        await order.save();

        // Clear user's cart
        await Cart.findOneAndUpdate(
          { user: order.user },
          { $set: { items: [], subtotal: 0, totalItems: 0 } }
        );

        // Send order confirmation email
        try {
          const buyer = await User.findById(order.user);
          if (buyer) {
            await sendOrderConfirmation(order, buyer);
          }
        } catch (err) {
          console.error(`Failed to send order email: ${err.message}`);
        }
      }
      break;
    }

    case 'payment.failed': {
      const paymentInfo = eventData.payment.entity;
      const razorpayOrderId = paymentInfo.order_id;

      const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
      if (order && order.payment.status !== PAYMENT_STATUSES.COMPLETED) {
        console.log(`❌ Webhook recorded payment failure for Order: ${order.orderNumber}`);
        order.payment.status = PAYMENT_STATUSES.FAILED;
        await order.save();
      }
      break;
    }

    case 'refund.processed': {
      const refundInfo = eventData.refund.entity;
      const paymentId = refundInfo.payment_id;

      const order = await Order.findOne({ 'payment.razorpayPaymentId': paymentId });
      if (order && order.payment.status !== PAYMENT_STATUSES.REFUNDED) {
        console.log(`↩️ Webhook recorded refund processing for Order: ${order.orderNumber}`);
        order.payment.status = PAYMENT_STATUSES.REFUNDED;
        order.status = ORDER_STATUSES.CANCELLED;
        order.items.forEach((item) => {
          item.status = ORDER_STATUSES.CANCELLED;
        });

        // Restore stocks
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }

        await order.save();
      }
      break;
    }

    default:
      console.log(`Unhandled webhook event type: "${event}"`);
  }

  // Always return a 200 OK to acknowledge receipt to Razorpay
  res.status(200).json({ received: true });
};

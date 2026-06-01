import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../constants/categories.js';

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'An order must belong to a buyer'],
      index: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Order item must be linked to a product']
        },
        artisan: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: [true, 'Order item must be linked to an artisan'],
          index: true
        },
        name: {
          type: String,
          required: [true, 'Snapshot of product name is required']
        },
        image: {
          type: String,
          required: [true, 'Snapshot of product image is required']
        },
        quantity: {
          type: Number,
          required: [true, 'Order item quantity is required'],
          min: [1, 'Quantity must be at least 1']
        },
        price: {
          type: Number,
          required: [true, 'Order item price is required'],
          min: [0, 'Price must be positive']
        },
        status: {
          type: String,
          enum: Object.values(ORDER_STATUSES),
          default: ORDER_STATUSES.PENDING
        },
        trackingNumber: {
          type: String,
          default: ''
        }
      }
    ],
    shippingAddress: {
      fullName: { type: String, required: [true, 'Recipient full name is required'] },
      phone: { type: String, required: [true, 'Recipient phone number is required'] },
      street: { type: String, required: [true, 'Street address is required'] },
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String, required: [true, 'State is required'] },
      pincode: { 
        type: String, 
        required: [true, 'PIN code is required'],
        match: [/^\d{6}$/, 'Pincode must be exactly 6 digits']
      }
    },
    payment: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      method: { type: String, default: 'razorpay' },
      status: {
        type: String,
        enum: Object.values(PAYMENT_STATUSES),
        default: PAYMENT_STATUSES.PENDING
      }
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shippingCharge: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUSES),
      default: ORDER_STATUSES.PENDING,
      index: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: Generate unique cryptographically secure orderNumber prefixing ORD-
OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + crypto.randomUUID().split('-')[0].toUpperCase();
  }
  next();
});

export default mongoose.model('Order', OrderSchema);

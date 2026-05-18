import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      default: () => 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        artisan: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        status: {
          type: String,
          enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
          default: 'pending',
        },
        trackingNumber: { type: String },
        estimatedDelivery: { type: Date },
        actualDelivery: { type: Date },
        itemNotes: { type: String },
        returnRequested: { type: Boolean, default: false },
        returnReason: { type: String },
        refundStatus: {
          type: String,
          enum: ['none', 'pending', 'approved', 'rejected', 'completed'],
          default: 'none',
        },
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      email: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'upi', 'netbanking', 'wallet'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDetails: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      transactionId: String,
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    specialInstructions: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'confirmed',
    },
    cancellationReason: String,
    cancelledAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

export default mongoose.model('Order', OrderSchema)

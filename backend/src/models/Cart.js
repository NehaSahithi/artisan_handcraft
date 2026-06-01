import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A cart must belong to a user'],
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Cart item must link to a product'],
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
          max: [10, 'Cannot add more than 10 units of a single product'],
          validate: {
            validator: Number.isInteger,
            message: 'Quantity must be an integer'
          }
        },
        price: {
          type: Number,
          required: [true, 'Price snapshot is required']
        }
      },
    ],
    subtotal: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete expired carts
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Recalculates cart totalItems and subtotal based on item prices and quantities.
 */
CartSchema.methods.calculateTotals = function () {
  let subtotalSum = 0;
  let countSum = 0;

  this.items.forEach((item) => {
    subtotalSum += item.quantity * item.price;
    countSum += item.quantity;
  });

  this.subtotal = Math.round(subtotalSum * 100) / 100;
  this.totalItems = countSum;
  
  // Extend expiration on modification
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

export default mongoose.model('Cart', CartSchema);

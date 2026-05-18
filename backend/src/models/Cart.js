import mongoose from 'mongoose'

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
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
        quantity: {
          type: Number,
          required: true,
          min: 1,
          validate: {
            validator: function (v) {
              return Number.isInteger(v)
            },
            message: 'Quantity must be an integer',
          },
        },
        addedAt: { type: Date, default: Date.now },
        notes: { type: String },
      },
    ],
    subtotal: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
    appliedCoupon: {
      code: String,
      discount: Number,
      discountType: { type: String, enum: ['percentage', 'fixed'] },
    },
    lastModified: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
)

CartSchema.methods.calculateTotals = function () {
  let total = 0
  let count = 0
  this.items.forEach((item) => {
    total += item.quantity
    count += item.quantity
  })
  this.totalItems = count
  this.lastModified = new Date()
}

export default mongoose.model('Cart', CartSchema)

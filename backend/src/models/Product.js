import mongoose from 'mongoose';
import { CRAFT_CATEGORIES } from '../constants/categories.js';

const ProductSchema = new mongoose.Schema(
  {
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A product must be linked to an artisan'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a product category'],
      enum: {
        values: CRAFT_CATEGORIES,
        message: 'Please select a valid craft category'
      },
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [0, 'Price must be positive'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be less than 0%'],
      max: [99, 'Discount cannot exceed 99%'],
    },
    finalPrice: { 
      type: Number 
    },
    images: {
      type: [{
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        alt: { type: String, default: '' }
      }],
      required: [true, 'Please provide at least one product image'],
      validate: {
        validator: function (v) {
          return v && v.length >= 1;
        },
        message: 'Please provide at least one product image',
      },
    },
    stock: {
      type: Number,
      required: [true, 'Please specify product stock'],
      min: [0, 'Stock cannot be less than 0'],
      default: 0,
    },
    materials: {
      type: [String],
      default: [],
    },
    technique: {
      type: String,
      trim: true,
    },
    craftingTime: {
      type: String,
      trim: true,
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      weight: { type: Number, min: 0 },
      unit: { type: String, default: 'cm' }
    },
    originState: {
      type: String,
      trim: true,
    },
    originDistrict: {
      type: String,
      trim: true,
    },
    giCertified: {
      type: Boolean,
      default: false,
    },
    customizable: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5, index: true },
      count: { type: Number, default: 0 },
    },
    tags: {
      type: [String],
      default: [],
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-validate hook: Calculate finalPrice after applying discount, rounded to 2 decimals
ProductSchema.pre('validate', function (next) {
  if (this.price !== undefined) {
    const discountedPrice = this.price - (this.price * (this.discount || 0)) / 100;
    this.finalPrice = Math.round(discountedPrice * 100) / 100;
  }
  next();
});

// Setup compound indexes and text search indices
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ finalPrice: 1 });

export default mongoose.model('Product', ProductSchema);

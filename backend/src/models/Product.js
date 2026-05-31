import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema(
  {
    artisan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a product category'],
      enum: [
        'Pottery', 'Handloom', 'Woodwork', 'Jewellery', 'Painting',
        'Embroidery', 'Metalwork', 'Leatherwork', 'Bamboo & Cane',
        'Stone Carving', 'Terracotta', 'Block Printing', 'Dhokra',
        'Warli Art', 'Madhubani', 'Pattachitra', 'Other',
      ],
    },
    subcategory: { type: String },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      min: [1, 'Price must be at least 1'],
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalPrice: { type: Number, required: true },
    images: {
      type: [String],
      required: [true, 'Please provide at least one product image'],
      validate: {
        validator: function (v) {
          return v && v.length >= 1
        },
        message: 'Please provide at least one image',
      },
    },
    craftStory: {
      type: String,
      maxlength: [2000, 'Craft story cannot exceed 2000 characters'],
    },
    materials: [
      {
        name: String,
        source: String,
      },
    ],
    dimensions: {
      length: { type: String },
      width: { type: String },
      height: { type: String },
      weight: { type: String },
    },
    colors: [String],
    care: [String],
    artisanNotes: { type: String },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxQuantityPerOrder: { type: Number, default: 10 },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    reviews: [
      {
        user: mongoose.Schema.Types.ObjectId,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    giCertified: { type: Boolean, default: false },
    deliveryTime: { type: String, default: '7-14 days' },
    international: { type: Boolean, default: false },
    tags: [String],
    seoKeywords: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

ProductSchema.pre('validate', function (next) {
  if (this.price !== undefined) {
    this.finalPrice = this.price - (this.price * (this.discount || 0)) / 100
  }
  next()
})

ProductSchema.index({ name: 'text', description: 'text' })

export default mongoose.model('Product', ProductSchema)

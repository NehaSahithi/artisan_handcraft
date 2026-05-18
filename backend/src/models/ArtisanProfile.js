import mongoose from 'mongoose'

const ArtisanProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      required: [true, 'Please provide your shop name'],
      trim: true,
      maxlength: [100, 'Shop name cannot exceed 100 characters'],
    },
    tagline: {
      type: String,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
    },
    shopBanner: { type: String, default: null },
    shopLogo: { type: String, default: null },
    story: {
      type: String,
      maxlength: [5000, 'Story cannot exceed 5000 characters'],
    },
    craftTradition: {
      type: String,
      maxlength: [1000, 'Craft tradition description cannot exceed 1000 characters'],
    },
    yearsOfExperience: { type: Number, min: 0 },
    generationsPracticing: { type: Number, min: 1 },
    storyPhotos: [{ type: String }],
    village: { type: String },
    district: { type: String },
    state: {
      type: String,
      required: [true, 'Please provide your state'],
    },
    pincode: { type: String },
    craftCategories: [
      {
        type: String,
        enum: [
          'Pottery', 'Handloom', 'Woodwork', 'Jewellery', 'Painting',
          'Embroidery', 'Metalwork', 'Leatherwork', 'Bamboo & Cane',
          'Stone Carving', 'Terracotta', 'Block Printing', 'Dhokra',
          'Warli Art', 'Madhubani', 'Pattachitra', 'Other',
        ],
      },
    ],
    kyc: {
      status: {
        type: String,
        enum: ['pending', 'submitted', 'verified', 'rejected'],
        default: 'pending',
      },
      aadhaarNumber: { type: String, select: false },
      panNumber: { type: String, select: false },
      aadhaarDoc: { type: String },
      panDoc: { type: String },
      bankAccountNumber: { type: String, select: false },
      ifscCode: { type: String },
      bankName: { type: String },
      verifiedAt: { type: Date },
      rejectionReason: { type: String },
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    responseTime: { type: String, default: 'Within 24 hours' },
    giTagged: { type: Boolean, default: false },
    giTagDetails: { type: String },
    certifications: [{ type: String }],
    socialLinks: {
      instagram: { type: String },
      facebook: { type: String },
      youtube: { type: String },
    },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

ArtisanProfileSchema.virtual('products', {
  ref: 'Product',
  localField: 'user',
  foreignField: 'artisan',
  count: true,
})

export default mongoose.model('ArtisanProfile', ArtisanProfileSchema)

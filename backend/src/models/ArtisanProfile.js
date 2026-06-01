import mongoose from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { CRAFT_CATEGORIES, KYC_STATUSES } from '../constants/categories.js';

const ArtisanProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Artisan profile must be linked to a user account'],
      unique: true,
      index: true
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
      trim: true
    },
    shopBanner: { 
      type: String, 
      default: null 
    },
    shopLogo: { 
      type: String, 
      default: null 
    },
    story: {
      type: String,
      maxlength: [5000, 'Story cannot exceed 5000 characters'],
      trim: true
    },
    craftTradition: {
      type: String,
      maxlength: [1000, 'Craft tradition description cannot exceed 1000 characters'],
      trim: true
    },
    yearsOfExperience: { 
      type: Number, 
      min: [0, 'Years of experience cannot be negative'] 
    },
    location: {
      village: { type: String, trim: true },
      district: { type: String, trim: true },
      state: { 
        type: String, 
        required: [true, 'State location is required'],
        index: true 
      },
      pincode: { 
        type: String,
        match: [/^\d{6}$/, 'Pincode must be exactly 6 digits']
      }
    },
    craftCategories: [
      {
        type: String,
        enum: {
          values: CRAFT_CATEGORIES,
          message: 'Please select a valid craft category'
        },
        index: true
      }
    ],
    kyc: {
      status: {
        type: String,
        enum: Object.values(KYC_STATUSES),
        default: KYC_STATUSES.NOT_SUBMITTED,
        index: true
      },
      aadhaarNumber: { 
        type: String, 
        select: false 
      },
      panNumber: { 
        type: String, 
        select: false 
      },
      aadhaarDoc: { 
        type: String 
      },
      panDoc: { 
        type: String 
      },
      bankDetails: {
        accountNumber: { 
          type: String, 
          select: false 
        },
        ifsc: { 
          type: String,
          match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code (e.g. SBIN0001234)']
        },
        bankName: { 
          type: String,
          trim: true
        }
      },
      submittedAt: { type: Date },
      verifiedAt: { type: Date },
      rejectionReason: { type: String }
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },
    totalSales: { 
      type: Number, 
      default: 0 
    },
    totalRevenue: { 
      type: Number, 
      default: 0 
    },
    isVerified: { 
      type: Boolean, 
      default: false,
      index: true
    },
    isFeatured: { 
      type: Boolean, 
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Apply Mongoose Field Encryption plugin to protect sensitive KYC values at rest
ArtisanProfileSchema.plugin(fieldEncryption, {
  fields: ['kyc.aadhaarNumber', 'kyc.panNumber', 'kyc.bankDetails.accountNumber'],
  secret: process.env.ENCRYPTION_KEY
});

// Virtual populate for products
ArtisanProfileSchema.virtual('products', {
  ref: 'Product',
  localField: 'user',
  foreignField: 'artisan'
});

export default mongoose.model('ArtisanProfile', ArtisanProfileSchema);

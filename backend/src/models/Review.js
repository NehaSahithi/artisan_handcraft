import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'A review must belong to a product'],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A review must be written by a user']
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      trim: true
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
      trim: true
    },
    images: {
      type: [String], // Array of image URLs (Cloudinary)
      default: []
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee a user can review a product only once
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating and save to product
ReviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numberOfRatings: { $sum: 1 }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        'rating.average': Math.round(stats[0].averageRating * 10) / 10,
        'rating.count': stats[0].numberOfRatings
      });
    } else {
      await mongoose.model('Product').findByIdAndUpdate(productId, {
        'rating.average': 0,
        'rating.count': 0
      });
    }
  } catch (err) {
    console.error('Error in calculateAverageRating:', err);
  }
};

// Call calculateAverageRating after saving review
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

// Call calculateAverageRating after deleting review
ReviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.calculateAverageRating(this.product);
});

export default mongoose.model('Review', ReviewSchema);

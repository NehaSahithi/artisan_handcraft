import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import { ApiError } from '../middleware/errorHandler.js';
import { CRAFT_CATEGORIES } from '../constants/categories.js';
import { escapeRegex, paginateQuery } from '../utils/helpers.js';
import cloudinary from '../config/cloudinary.js';

// Helper to filter allowed fields for creation and updates
const pickAllowedProductFields = (source) => {
  const allowedFields = [
    'name',
    'description',
    'category',
    'price',
    'discount',
    'stock',
    'materials',
    'technique',
    'craftingTime',
    'dimensions',
    'originState',
    'originDistrict',
    'giCertified',
    'customizable',
    'tags'
  ];

  return allowedFields.reduce((picked, field) => {
    if (source[field] !== undefined) {
      picked[field] = source[field];
    }
    return picked;
  }, {});
};

// @desc    Get all products (with rich filtering & pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  const { category, minPrice, maxPrice, state, search, sortBy, page = 1, limit = 12 } = req.query;

  const filter = { isActive: true };

  // 1. Category Filter
  if (category) {
    filter.category = category;
  }

  // 2. Price Range Filter (on finalPrice calculated pre-validate)
  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);
  if (!isNaN(min) || !isNaN(max)) {
    filter.finalPrice = {};
    if (!isNaN(min)) filter.finalPrice.$gte = min;
    if (!isNaN(max)) filter.finalPrice.$lte = max;
  }

  // 3. Origin State Filter
  if (state) {
    filter.originState = state;
  }

  // 4. Secured Search Query (Defends against ReDoS via escapeRegex)
  if (search) {
    const escapedSearch = escapeRegex(search);
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { description: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  // 5. Sort Setup
  const sortOptions = {};
  if (sortBy === 'price_asc') sortOptions.finalPrice = 1;
  else if (sortBy === 'price_desc') sortOptions.finalPrice = -1;
  else if (sortBy === 'rating') sortOptions['rating.average'] = -1;
  else if (sortBy === 'newest') sortOptions.createdAt = -1;
  else sortOptions.createdAt = -1; // Default to newest

  const paginatedResults = await paginateQuery(
    Product,
    filter,
    page,
    limit,
    { path: 'artisan', select: 'name shopName user avatar' },
    sortOptions
  );

  res.status(200).json({
    success: true,
    ...paginatedResults
  });
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate({ path: 'artisan', select: 'name shopName avatar story' });

  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found or has been deactivated.');
  }

  // Fetch reviews separately from the Review collection
  const reviews = await Review.find({ product: product._id })
    .populate({ path: 'user', select: 'name avatar' })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    product,
    reviews
  });
};

// @desc    Create a product (Artisan only)
// @route   POST /api/products
// @access  Private/Artisan
export const createProduct = async (req, res) => {
  // Guardrail: Ensure artisan profile exists and is verified before creating a product
  const profile = await ArtisanProfile.findOne({ user: req.user._id });
  if (!profile) {
    throw new ApiError(403, 'Studio Profile not found. Please complete profile onboarding before listing products.');
  }

  const allowedData = pickAllowedProductFields(req.body);
  allowedData.artisan = req.user._id;

  // Process files uploaded to Cloudinary
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map((file) => ({
      url: file.path, // Cloudinary URL
      publicId: file.filename, // Cloudinary public ID for clean deletion
      alt: req.body.name || 'Product Image'
    }));
  } else if (req.body.images && Array.isArray(req.body.images)) {
    // Fallback if passing pre-existing image structures (e.g. seeds)
    images = req.body.images;
  }

  if (images.length === 0) {
    throw new ApiError(400, 'Please provide at least one product image.');
  }

  allowedData.images = images;

  const product = await Product.create(allowedData);

  res.status(201).json({
    success: true,
    message: 'Handicraft product created successfully.',
    product
  });
};

// @desc    Update a product (Owner/Admin only)
// @route   PUT /api/products/:id
// @access  Private/Artisan/Admin
export const updateProduct = async (req, res) => {
  // Guardrail: Ensure artisan profile exists and is verified before updating a product (except for admins)
  if (req.user.role !== 'admin') {
    const profile = await ArtisanProfile.findOne({ user: req.user._id });
    if (!profile) {
      throw new ApiError(403, 'Studio Profile not found. Please complete profile onboarding before updating products.');
    }
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  // Authorization check
  if (product.artisan.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to modify this product.');
  }

  const allowedUpdates = pickAllowedProductFields(req.body);

  // If new images are uploaded, clean up old ones on Cloudinary
  if (req.files && req.files.length > 0) {
    // Dynamic deletion of old images
    for (const image of product.images) {
      if (image.publicId) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (err) {
          console.error(`Failed to delete Cloudinary image: ${image.publicId}`, err);
        }
      }
    }

    allowedUpdates.images = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      alt: req.body.name || product.name
    }));
  }

  product.set(allowedUpdates);
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product updated successfully.',
    product
  });
};

// @desc    Delete product (Owner/Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Artisan/Admin
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  // Authorization check
  if (product.artisan.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this product.');
  }

  // 1. Clean up Cloudinary storage media
  for (const image of product.images) {
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (err) {
        console.error(`Failed to delete Cloudinary image: ${image.publicId}`, err);
      }
    }
  }

  // 2. Delete all related reviews
  await Review.deleteMany({ product: product._id });

  // 3. Remove product document
  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product and associated reviews deleted successfully.'
  });
};

// @desc    Get artisan's own products
// @route   GET /api/products/my-products
// @access  Private/Artisan
export const getMyProducts = async (req, res) => {
  const { page = 1, limit = 12 } = req.query;

  const paginatedResults = await paginateQuery(
    Product,
    { artisan: req.user._id },
    page,
    limit
  );

  res.status(200).json({
    success: true,
    ...paginatedResults
  });
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .limit(8)
    .populate('artisan', 'name shopName avatar');

  res.status(200).json({
    success: true,
    products
  });
};

// @desc    Get craft categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
  res.status(200).json({
    success: true,
    categories: CRAFT_CATEGORIES
  });
};

// @desc    Submit a product review (Verified buyers only)
// @route   POST /api/products/:id/reviews
// @access  Private/Buyer
export const addReview = async (req, res) => {
  const productId = req.params.id;
  const { rating, comment, title } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found.');
  }

  // Prevent duplicate reviews
  const existingReview = await Review.findOne({ product: productId, user: req.user._id });
  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this handicraft.');
  }

  // Check if buyer has completed a purchase of this product
  const completedOrder = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    status: 'delivered' // Verify actual shipment delivery
  });

  const isVerifiedPurchase = !!completedOrder;

  // Create review
  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    title,
    comment,
    isVerifiedPurchase
  });

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully.',
    review
  });
};

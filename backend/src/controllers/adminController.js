import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import { ApiError } from '../middleware/errorHandler.js';
import { KYC_STATUSES, PAYMENT_STATUSES } from '../constants/categories.js';
import { escapeRegex, paginateQuery } from '../utils/helpers.js';

// @desc    Get administrative dashboard metrics
// @route   GET /api/admin/metrics
// @access  Private/Admin
export const getDashboardMetrics = async (req, res) => {
  const [
    userCount,
    verifiedArtisanCount,
    productCount,
    orderCount,
    revenueResult,
    pendingKYCCount,
    recentOrders
  ] = await Promise.all([
    User.countDocuments(),
    ArtisanProfile.countDocuments({ isVerified: true }),
    Product.countDocuments(),
    Order.countDocuments({ 'payment.status': PAYMENT_STATUSES.COMPLETED }),
    Order.aggregate([
      { $match: { 'payment.status': PAYMENT_STATUSES.COMPLETED } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]),
    ArtisanProfile.countDocuments({ 'kyc.status': KYC_STATUSES.PENDING }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
  ]);

  res.status(200).json({
    success: true,
    metrics: {
      totalUsers: userCount,
      totalArtisans: verifiedArtisanCount,
      totalProducts: productCount,
      totalOrders: orderCount,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      pendingKYCs: pendingKYCCount,
      recentOrders
    }
  });
};

// @desc    Get all users (with search and pagination)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  const { role, search, page = 1, limit = 10 } = req.query;

  const filter = {};

  if (role) {
    filter.role = role;
  }

  if (search) {
    const escapedSearch = escapeRegex(search);
    filter.$or = [
      { name: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  const paginatedResults = await paginateQuery(
    User,
    filter,
    page,
    limit,
    '',
    { createdAt: -1 }
  );

  res.status(200).json({
    success: true,
    ...paginatedResults
  });
};

// @desc    Toggle user active/deactivated state
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private/Admin
export const toggleUserActive = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User account not found.');
  }

  // Prevent admin from deactivating self
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot deactivate your own admin account.');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User account has been successfully ${user.isActive ? 'activated' : 'deactivated'}.`,
    user
  });
};

// @desc    Get pending KYC profile submissions
// @route   GET /api/admin/kyc/pending
// @access  Private/Admin
export const getPendingKYC = async (req, res) => {
  const artisans = await ArtisanProfile.find({ 'kyc.status': KYC_STATUSES.PENDING })
    .populate('user', 'name email phone avatar')
    .sort({ 'kyc.submittedAt': 1 }); // Oldest submissions first

  res.status(200).json({
    success: true,
    artisans,
    profiles: artisans
  });
};

// @desc    Approve or Reject artisan KYC submission
// @route   PUT /api/admin/kyc/:id/verify
// @access  Private/Admin
export const verifyArtisan = async (req, res) => {
  const { status, rejectionReason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Verification status must be either "approved" or "rejected".');
  }

  const profile = await ArtisanProfile.findById(req.params.id);
  if (!profile) {
    throw new ApiError(404, 'Artisan profile not found.');
  }

  if (status === 'approved') {
    profile.kyc.status = KYC_STATUSES.VERIFIED;
    profile.kyc.verifiedAt = new Date();
    profile.kyc.rejectionReason = null;
    profile.isVerified = true;
    
    // Guarantee that user is tagged with artisan role
    await User.findByIdAndUpdate(profile.user, { role: 'artisan' });
  } else {
    if (!rejectionReason || rejectionReason.trim() === '') {
      throw new ApiError(400, 'Please provide a reason for rejecting the KYC submission.');
    }
    profile.kyc.status = KYC_STATUSES.REJECTED;
    profile.kyc.rejectionReason = rejectionReason;
    profile.kyc.verifiedAt = null;
    profile.isVerified = false;
  }

  await profile.save();

  res.status(200).json({
    success: true,
    message: `Artisan KYC submission has been ${status === 'approved' ? 'approved and verified' : 'rejected'}.`,
    profile
  });
};

// @desc    Get all orders placed on the platform
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const paginatedResults = await paginateQuery(
    Order,
    filter,
    page,
    limit,
    [
      { path: 'user', select: 'name email phone' },
      { path: 'items.product', select: 'name finalPrice price' },
      { path: 'items.artisan', select: 'name shopName' }
    ]
  );

  res.status(200).json({
    success: true,
    ...paginatedResults
  });
};

// @desc    Get all products listed on the platform
// @route   GET /api/admin/products
// @access  Private/Admin
export const getAllProducts = async (req, res) => {
  const { page = 1, limit = 12 } = req.query;

  const paginatedResults = await paginateQuery(
    Product,
    {},
    page,
    limit,
    { path: 'artisan', select: 'name shopName' }
  );

  res.status(200).json({
    success: true,
    ...paginatedResults
  });
};

// @desc    Toggle product active state (approve/suspend listings)
// @route   PUT /api/admin/products/:id/toggle-active
// @access  Private/Admin
export const toggleProductActive = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product listing not found.');
  }

  product.isActive = !product.isActive;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product listing has been successfully ${product.isActive ? 'activated' : 'suspended'}.`,
    product
  });
};

// @desc    Toggle product featured state (homepage banner selection)
// @route   PUT /api/admin/products/:id/toggle-featured
// @access  Private/Admin
export const toggleProductFeatured = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product listing not found.');
  }

  product.isFeatured = !product.isFeatured;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product listing has been successfully ${product.isFeatured ? 'marked as featured' : 'removed from featured list'}.`,
    product
  });
};
import crypto from 'node:crypto';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { ApiError } from '../middleware/errorHandler.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';

/**
 * Utility helper to construct and set JWT cookies securely.
 * Token is NEVER sent in response body.
 */
const sendTokenCookie = (user, statusCode, res, message) => {
  const token = user.getSignedJwtToken();
  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7;

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: cookieExpireDays * 24 * 60 * 60 * 1000,
    path: '/'
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    }
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'Email address already registered.');
  }

  // Only allow buyer and artisan registrations publicly (admin must be seeded/created manually)
  const allowedRoles = ['buyer', 'artisan'];
  const userRole = allowedRoles.includes(role) ? role : 'buyer';

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    phone
  });

  // Generate email verification token
  const verificationToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email asynchronously (failure shouldn't block signup)
  try {
    await sendVerificationEmail(user, verificationToken);
  } catch (err) {
    console.error(`Verification email failed to send: ${err.message}`);
  }

  sendTokenCookie(user, 201, res, 'Registration successful. A verification link has been sent to your email.');
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(400, 'Invalid email or password.');
  }

  // Crucial: Deactivated check
  if (!user.isActive) {
    throw new ApiError(403, 'Your account is deactivated. Please contact support.');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(400, 'Invalid email or password.');
  }

  // Fetch or initialize cart item count for display badge synchronization
  let cartCount = 0;
  if (user.role === 'buyer') {
    const cart = await Cart.findOne({ user: user._id });
    if (cart) {
      cartCount = cart.totalItems;
    }
  }

  const token = user.getSignedJwtToken();
  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE, 10) || 7;

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: cookieExpireDays * 24 * 60 * 60 * 1000,
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    },
    cartCount
  });
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0),
    path: '/'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user
  });
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired email verification link.');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email address verified successfully.'
  });
};

// @desc    Send password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw new ApiError(404, 'No account registered with this email.');
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, resetToken);
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your registered email.'
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    throw new ApiError(500, 'Could not send recovery email. Please try again.');
  }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  }).select('+password');

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset link.');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenCookie(user, 200, res, 'Password reset successfully. You are now logged in.');
};

// @desc    Change logged-in user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenCookie(user, 200, res, 'Password updated successfully.');
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const fieldsToUpdate = {};
  if (req.body.name) fieldsToUpdate.name = req.body.name;
  if (req.body.phone) fieldsToUpdate.phone = req.body.phone;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: fieldsToUpdate },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user
  });
};

// @desc    Upload user avatar
// @route   PUT /api/auth/avatar
// @access  Private
export const updateAvatar = async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please select an image file to upload.');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.file.path }, // Cloudinary URL automatically injected by multer storage
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Profile picture updated successfully.',
    avatar: user.avatar
  });
};

// Address Management CRUD
// ==========================================

// @desc    Add shipping address
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const newAddress = req.body;

  // If set to default, clear other default addresses first
  if (newAddress.isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  // If it's the very first address, default it automatically
  if (user.addresses.length === 0) {
    newAddress.isDefault = true;
  }

  user.addresses.push(newAddress);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address added successfully.',
    addresses: user.addresses
  });
};

// @desc    Update shipping address
// @route   PUT /api/auth/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  const updatedDetails = req.body;

  // If this address is updated to default, disable default on other addresses
  if (updatedDetails.isDefault) {
    user.addresses.forEach((addr) => {
      if (addr._id.toString() !== req.params.id) {
        addr.isDefault = false;
      }
    });
  }

  Object.assign(address, updatedDetails);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully.',
    addresses: user.addresses
  });
};

// @desc    Delete shipping address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.id);

  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  const wasDefault = address.isDefault;
  user.addresses.id(req.params.id).deleteOne();

  // If we deleted the default address, set default to the first remaining one
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully.',
    addresses: user.addresses
  });
};

// Wishlist Management
// ==========================================

// @desc    Get user wishlist
// @route   GET /api/auth/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    select: 'name finalPrice price discount images rating category stock originState giCertified artisan',
    populate: {
      path: 'artisan',
      select: 'name shopName'
    }
  });

  res.status(200).json({
    success: true,
    wishlist: user.wishlist
  });
};

// @desc    Add product to wishlist
// @route   POST /api/auth/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    throw new ApiError(404, 'Product does not exist.');
  }

  const user = await User.findById(req.user._id);

  if (user.wishlist.includes(req.params.productId)) {
    return res.status(200).json({
      success: true,
      message: 'Product is already in wishlist.'
    });
  }

  user.wishlist.push(req.params.productId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist.'
  });
};

// @desc    Remove product from wishlist
// @route   DELETE /api/auth/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== req.params.productId
  );
  
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist.'
  });
};

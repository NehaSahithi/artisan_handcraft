import ArtisanProfile from '../models/ArtisanProfile.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { ApiError } from '../middleware/errorHandler.js';
import { escapeRegex, paginateQuery } from '../utils/helpers.js';
import { CRAFT_CATEGORIES, KYC_STATUSES } from '../constants/categories.js';
import cloudinary from '../config/cloudinary.js';

// Whitelisted profile fields for security (prevents mass-assignment updates to isVerified, totalSales, etc.)
const whitelistedProfileFields = (source) => {
  const allowed = [
    'shopName',
    'tagline',
    'story',
    'craftTradition',
    'yearsOfExperience',
    'socialLinks'
  ];

  const picked = {};
  
  allowed.forEach((field) => {
    if (source[field] !== undefined) {
      picked[field] = source[field];
    }
  });

  // Nested Location details whitelisting
  if (source.location && typeof source.location === 'object') {
    picked.location = {};
    const locAllowed = ['village', 'district', 'state', 'pincode'];
    locAllowed.forEach((f) => {
      if (source.location[f] !== undefined) {
        picked.location[f] = source.location[f];
      }
    });
  }

  // Categories list
  if (source.craftCategories && Array.isArray(source.craftCategories)) {
    picked.craftCategories = source.craftCategories.filter(cat => 
      CRAFT_CATEGORIES.includes(cat)
    );
  }

  return picked;
};

// @desc    Get all verified artisans (public listing)
// @route   GET /api/artisans
// @access  Public
export const getAllArtisans = async (req, res) => {
  const { state, craft, search, page = 1, limit = 12 } = req.query;

  // Public listings show all artisan profiles
  const filter = {};

  if (state) {
    filter['location.state'] = state;
  }

  if (craft) {
    filter.craftCategories = { $in: [craft] };
  }

  if (search) {
    const escapedSearch = escapeRegex(search);
    filter.$or = [
      { shopName: { $regex: escapedSearch, $options: 'i' } },
      { story: { $regex: escapedSearch, $options: 'i' } }
    ];
  }

  const paginatedResults = await paginateQuery(
    ArtisanProfile,
    filter,
    page,
    limit,
    { path: 'user', select: 'name email phone avatar' },
    { isFeatured: -1, 'rating.average': -1 }
  );

  res.status(200).json({
    success: true,
    ...paginatedResults
  });
};

// @desc    Get artisan profile & products by ID
// @route   GET /api/artisans/:id
// @access  Public
export const getArtisanById = async (req, res) => {
  const artisan = await ArtisanProfile.findById(req.params.id)
    .populate({ path: 'user', select: 'name email phone avatar' });

  if (!artisan) {
    throw new ApiError(404, 'Artisan profile not found.');
  }

  // Fetch artisan products
  const products = await Product.find({ artisan: artisan.user?._id, isActive: true })
    .limit(12)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    artisan,
    products
  });
};

// @desc    Create or update artisan profile details
// @route   PUT /api/artisans/profile
// @access  Private/Artisan
export const createOrUpdateProfile = async (req, res) => {
  let profile = await ArtisanProfile.findOne({ user: req.user._id });
  const whitelistedData = whitelistedProfileFields(req.body);

  if (!profile) {
    // New Profile Creation
    whitelistedData.user = req.user._id;
    profile = await ArtisanProfile.create(whitelistedData);
    
    // Explicitly update user role to artisan
    await User.findByIdAndUpdate(req.user._id, { role: 'artisan' });
  } else {
    // Updating existing profile
    profile.set(whitelistedData);
    await profile.save();
  }

  res.status(200).json({
    success: true,
    message: 'Artisan profile saved successfully.',
    profile
  });
};

// @desc    Get current artisan's own profile
// @route   GET /api/artisans/me
// @access  Private/Artisan
export const getMyProfile = async (req, res) => {
  const profile = await ArtisanProfile.findOne({ user: req.user._id })
    .populate({ path: 'user', select: 'name email phone avatar' });

  if (!profile) {
    throw new ApiError(404, 'Artisan profile does not exist. Please complete setup.');
  }

  res.status(200).json({
    success: true,
    profile
  });
};

// @desc    Submit KYC details & documents for verification
// @route   POST /api/artisans/kyc
// @access  Private/Artisan
export const updateKYC = async (req, res) => {
  const profile = await ArtisanProfile.findOne({ user: req.user._id });
  if (!profile) {
    throw new ApiError(404, 'Artisan profile not found. Complete profile details first.');
  }

  // 1. Validate documents uploads
  if (!req.files || !req.files.aadhaarDoc || !req.files.panDoc) {
    throw new ApiError(400, 'Please upload both Aadhaar and PAN card documents.');
  }

  const { aadhaarNumber, panNumber, bankDetails } = req.body;
  if (!aadhaarNumber || !panNumber || !bankDetails) {
    throw new ApiError(400, 'Please provide Aadhaar number, PAN number, and Bank Account details.');
  }

  let bankParsed = bankDetails;
  if (typeof bankDetails === 'string') {
    try {
      bankParsed = JSON.parse(bankDetails);
    } catch (e) {
      throw new ApiError(400, 'Invalid bank account details structure.');
    }
  }

  if (!bankParsed.accountNumber || !bankParsed.ifsc || !bankParsed.bankName) {
    throw new ApiError(400, 'Bank details must include Account Number, IFSC, and Bank Name.');
  }

  // Clean up old KYC documents on Cloudinary if they exist
  if (profile.kyc.aadhaarDoc && profile.kyc.aadhaarDoc.includes('cloudinary')) {
    const pubId = profile.kyc.aadhaarDoc.split('/').pop().split('.')[0];
    try {
      await cloudinary.uploader.destroy(`karigar/kyc/${pubId}`);
    } catch (err) {
      console.error(err);
    }
  }
  if (profile.kyc.panDoc && profile.kyc.panDoc.includes('cloudinary')) {
    const pubId = profile.kyc.panDoc.split('/').pop().split('.')[0];
    try {
      await cloudinary.uploader.destroy(`karigar/kyc/${pubId}`);
    } catch (err) {
      console.error(err);
    }
  }

  // 2. Set whitelisted KYC fields
  profile.kyc = {
    status: KYC_STATUSES.PENDING,
    aadhaarNumber,
    panNumber,
    aadhaarDoc: req.files.aadhaarDoc[0].path, // Cloudinary URL
    panDoc: req.files.panDoc[0].path, // Cloudinary URL
    bankDetails: {
      accountNumber: bankParsed.accountNumber,
      ifsc: bankParsed.ifsc,
      bankName: bankParsed.bankName
    },
    submittedAt: new Date(),
    verifiedAt: null,
    rejectionReason: null
  };

  await profile.save();

  res.status(200).json({
    success: true,
    message: 'KYC documents submitted successfully. Verification is pending.',
    kycStatus: profile.kyc.status
  });
};

// @desc    Update shop media (Logo / Banner)
// @route   PUT /api/artisans/shop-media
// @access  Private/Artisan
export const updateShopMedia = async (req, res) => {
  const profile = await ArtisanProfile.findOne({ user: req.user._id });
  if (!profile) {
    throw new ApiError(404, 'Artisan profile not found.');
  }

  // Logo update
  if (req.files?.shopLogo) {
    // Delete old logo
    if (profile.shopLogo && profile.shopLogo.includes('cloudinary')) {
      const pubId = profile.shopLogo.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`karigar/shops/${pubId}`);
      } catch (err) {
        console.error(err);
      }
    }
    profile.shopLogo = req.files.shopLogo[0].path;
  }

  // Banner update
  if (req.files?.shopBanner) {
    // Delete old banner
    if (profile.shopBanner && profile.shopBanner.includes('cloudinary')) {
      const pubId = profile.shopBanner.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`karigar/shops/${pubId}`);
      } catch (err) {
        console.error(err);
      }
    }
    profile.shopBanner = req.files.shopBanner[0].path;
  }

  await profile.save();

  res.status(200).json({
    success: true,
    message: 'Shop media assets updated successfully.',
    profile
  });
};

// @desc    Get dashboard summary statistics (Artisan only)
// @route   GET /api/artisans/dashboard/stats
// @access  Private/Artisan
export const getDashboardStats = async (req, res) => {
  const profile = await ArtisanProfile.findOne({ user: req.user._id });
  if (!profile) {
    throw new ApiError(404, 'Profile not found.');
  }

  const productsCount = await Product.countDocuments({ artisan: req.user._id });
  const activeProducts = await Product.countDocuments({ artisan: req.user._id, isActive: true });

  res.status(200).json({
    success: true,
    stats: {
      shopName: profile.shopName,
      totalSales: profile.totalSales,
      totalRevenue: profile.totalRevenue,
      ratingAverage: profile.rating.average,
      ratingCount: profile.rating.count,
      totalProducts: productsCount,
      activeProducts,
      isVerified: profile.isVerified,
      kycStatus: profile.kyc.status
    }
  });
};

// @desc    Get featured artisans
// @route   GET /api/artisans/featured
// @access  Public
export const getFeaturedArtisans = async (req, res) => {
  const artisans = await ArtisanProfile.find({ isFeatured: true })
    .populate({ path: 'user', select: 'name avatar' })
    .limit(6);

  res.status(200).json({
    success: true,
    artisans
  });
};

// @desc    Get list of states having active artisans
// @route   GET /api/artisans/states
// @access  Public
export const getStatesList = async (req, res) => {
  const states = await ArtisanProfile.distinct('location.state');
  res.status(200).json({
    success: true,
    states: states.sort()
  });
};

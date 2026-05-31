import ArtisanProfile from '../models/ArtisanProfile.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'

// Get all artisans
export const getAllArtisans = asyncHandler(async (req, res) => {
  const { state, craft, search, page = 1, limit = 20 } = req.query

  let filter = { isActive: true }
  if (state) filter.state = state
  if (craft) filter.craftCategories = craft
  if (search) {
    filter.$or = [
      { shopName: { $regex: search, $options: 'i' } },
      { story: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = (page - 1) * limit
  const artisans = await ArtisanProfile.find(filter)
    .populate('user', 'name email phone')
    .limit(limit)
    .skip(skip)
    .sort({ isFeatured: -1, 'rating.average': -1 })

  const total = await ArtisanProfile.countDocuments(filter)

  res.json({
    success: true,
    artisans,
    pagination: { total, pages: Math.ceil(total / limit), currentPage: page },
  })
})

// Get artisan by ID
export const getArtisanById = asyncHandler(async (req, res) => {
  const artisan = await ArtisanProfile.findById(req.params.id)
    .populate('user', '-password')

  if (!artisan) {
    throw new ApiError(404, 'Artisan not found')
  }

  const artisanUserId = artisan.user?._id || artisan.user
  const products = artisanUserId
    ? await Product.find({ artisan: artisanUserId, isActive: true }).limit(12)
    : []

  res.json({
    success: true,
    artisan,
    products,
  })
})

// Create/Update artisan profile
export const createOrUpdateProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== 'artisan') {
    throw new ApiError(403, 'Only artisans can create/update profile')
  }

  let profile = await ArtisanProfile.findOne({ user: req.user.id })

  if (!profile) {
    profile = await ArtisanProfile.create({
      ...req.body,
      user: req.user.id,
    })
  } else {
    Object.assign(profile, req.body)
    await profile.save()
  }

  // Update user role if not already set
  const user = await User.findByIdAndUpdate(req.user.id, { role: 'artisan' }, { new: true })

  res.status(profile._id ? 200 : 201).json({
    success: true,
    message: 'Profile saved successfully',
    profile,
  })
})

// Get my profile
export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await ArtisanProfile.findOne({ user: req.user.id })
    .populate('user', '-password')

  if (!profile) {
    throw new ApiError(404, 'Profile not found')
  }

  res.json({ success: true, profile })
})

// Update KYC
export const updateKYC = asyncHandler(async (req, res) => {
  const profile = await ArtisanProfile.findOne({ user: req.user.id })

  if (!profile) {
    throw new ApiError(404, 'Profile not found')
  }

  profile.kyc = { ...profile.kyc, ...req.body, status: 'submitted' }
  await profile.save()

  res.json({ success: true, message: 'KYC submitted successfully', profile })
})

// Get featured artisans
export const getFeaturedArtisans = asyncHandler(async (req, res) => {
  const artisans = await ArtisanProfile.find({
    isFeatured: true,
    isActive: true,
  })
    .populate('user', 'name email')
    .limit(12)

  res.json({ success: true, artisans })
})

// Search artisans by state
export const getArtisansByState = asyncHandler(async (req, res) => {
  const { state } = req.params

  const artisans = await ArtisanProfile.find({
    state,
    isActive: true,
  })
    .populate('user', 'name email')
    .limit(20)

  res.json({ success: true, artisans })
})

// Get artisan statistics
export const getArtisanStats = asyncHandler(async (req, res) => {
  const profile = await ArtisanProfile.findOne({ user: req.user.id })
  if (!profile) {
    throw new ApiError(404, 'Profile not found')
  }

  const products = await Product.find({ artisan: req.user.id })
  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.isActive).length

  res.json({
    success: true,
    stats: {
      totalProducts,
      activeProducts,
      totalSales: profile.totalSales,
      totalRevenue: profile.totalRevenue,
      rating: profile.rating,
      isVerified: profile.kyc.status === 'verified',
    },
  })
})

// Update shop banner/logo
export const updateShopMedia = asyncHandler(async (req, res) => {
  const profile = await ArtisanProfile.findOne({ user: req.user.id })

  if (!profile) {
    throw new ApiError(404, 'Profile not found')
  }

  if (req.files?.shopBanner) {
    profile.shopBanner = req.files.shopBanner[0].filename
  }

  if (req.files?.shopLogo) {
    profile.shopLogo = req.files.shopLogo[0].filename
  }

  await profile.save()
  res.json({ success: true, message: 'Media updated', profile })
})

// Get all states with artisans
export const getStatesList = asyncHandler(async (req, res) => {
  const states = await ArtisanProfile.distinct('state', { isActive: true })
  res.json({ success: true, states: states.sort() })
})

// Get craft traditions
export const getCrafts = asyncHandler(async (req, res) => {
  const crafts = [
    'Pottery',
    'Handloom',
    'Woodwork',
    'Jewellery',
    'Painting',
    'Embroidery',
    'Metalwork',
    'Leatherwork',
    'Bamboo & Cane',
    'Stone Carving',
    'Terracotta',
    'Block Printing',
    'Dhokra',
    'Warli Art',
    'Madhubani',
    'Pattachitra',
  ]

  res.json({ success: true, crafts })
})

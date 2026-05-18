import Product from '../models/Product.js'
import ArtisanProfile from '../models/ArtisanProfile.js'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'

// Get all products
export const getAllProducts = asyncHandler(async (req, res) => {
  const { category, search, sortBy, page = 1, limit = 20 } = req.query

  let filter = { isActive: true }
  if (category) filter.category = category
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  const sortOptions = {}
  if (sortBy === 'price-low') sortOptions.finalPrice = 1
  else if (sortBy === 'price-high') sortOptions.finalPrice = -1
  else if (sortBy === 'rating') sortOptions['rating.average'] = -1
  else if (sortBy === 'newest') sortOptions.createdAt = -1
  else sortOptions.createdAt = -1

  const skip = (page - 1) * limit
  const products = await Product.find(filter)
    .populate('artisan', 'name')
    .sort(sortOptions)
    .limit(limit)
    .skip(skip)

  const total = await Product.countDocuments(filter)

  res.json({
    success: true,
    products,
    pagination: { total, pages: Math.ceil(total / limit), currentPage: page },
  })
})

// Get product by ID
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('artisan', '-password')
    .populate('reviews.user', 'name avatar')

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  res.json({ success: true, product })
})

// Create product (artisan only)
export const createProduct = asyncHandler(async (req, res) => {
  if (req.user.role !== 'artisan') {
    throw new ApiError(403, 'Only artisans can create products')
  }

  const productData = {
    ...req.body,
    artisan: req.user.id,
    images: req.files ? req.files.map((f) => f.filename) : [],
  }

  const product = await Product.create(productData)
  res.status(201).json({ success: true, message: 'Product created successfully', product })
})

// Update product
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  if (product.artisan.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to update this product')
  }

  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((f) => f.filename)
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })

  res.json({ success: true, message: 'Product updated successfully', product })
})

// Delete product
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  if (product.artisan.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this product')
  }

  await Product.findByIdAndDelete(req.params.id)
  res.json({ success: true, message: 'Product deleted successfully' })
})

// Get products by artisan
export const getProductsByArtisan = asyncHandler(async (req, res) => {
  const { artisanId } = req.params
  const products = await Product.find({ artisan: artisanId, isActive: true })

  res.json({ success: true, products })
})

// Add review
export const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { rating, comment } = req.body

  const product = await Product.findById(productId)
  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  product.reviews.push({
    user: req.user.id,
    rating,
    comment,
  })

  // Update rating average
  const avgRating =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
  product.rating.average = Math.round(avgRating * 10) / 10
  product.rating.count = product.reviews.length

  await product.save()
  res.json({ success: true, message: 'Review added successfully', product })
})

// Get featured products
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .limit(12)
    .populate('artisan', 'name')

  res.json({ success: true, products })
})

// Get categories
export const getCategories = asyncHandler(async (req, res) => {
  const categories = [
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

  res.json({ success: true, categories })
})

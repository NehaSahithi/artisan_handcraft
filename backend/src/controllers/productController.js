import Product from '../models/Product.js'
import ArtisanProfile from '../models/ArtisanProfile.js'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'

const pickAllowedProductFields = (source) => {
  const allowedFields = [
    'name',
    'description',
    'shortDescription',
    'category',
    'subcategory',
    'price',
    'discount',
    'craftStory',
    'materials',
    'dimensions',
    'colors',
    'care',
    'artisanNotes',
    'stock',
    'maxQuantityPerOrder',
    'deliveryTime',
    'international',
    'tags',
    'seoKeywords',
  ]

  return allowedFields.reduce((picked, field) => {
    if (source[field] !== undefined) {
      picked[field] = source[field]
    }

    return picked
  }, {})
}

// Get all products
export const getAllProducts = asyncHandler(async (req, res) => {
  const { category, search, sortBy, page = 1, limit = 20 } = req.query
  const pageNumber = Math.max(1, Number(page) || 1)
  const limitNumber = Math.max(1, Number(limit) || 20)

  let filter = { isActive: true }
  if (category) filter.category = category
  if (search) {
    filter.$text = { $search: search }
  }

  const sortOptions = {}
  if (sortBy === 'price-low') sortOptions.finalPrice = 1
  else if (sortBy === 'price-high') sortOptions.finalPrice = -1
  else if (sortBy === 'rating') sortOptions['rating.average'] = -1
  else if (sortBy === 'newest') sortOptions.createdAt = -1
  else sortOptions.createdAt = -1

  const skip = (pageNumber - 1) * limitNumber
  const products = await Product.find(filter)
    .populate('artisan', 'name')
    .sort(sortOptions)
    .limit(limitNumber)
    .skip(skip)

  const total = await Product.countDocuments(filter)

  res.json({
    success: true,
    products,
    pagination: { total, pages: Math.ceil(total / limitNumber), currentPage: pageNumber },
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

  let bodyImages = []
  if (req.body.images) {
    bodyImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images]
  } else if (req.body.imageUrl) {
    bodyImages = [req.body.imageUrl]
  }

  const productData = {
    ...pickAllowedProductFields(req.body),
    artisan: req.user.id,
    images: req.files && req.files.length > 0 ? req.files.map((f) => f.filename) : bodyImages,
  }

  const product = await Product.create(productData)
  res.status(201).json({ success: true, message: 'Product created successfully', product })
})

// Update product
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  if (!req.user._id.equals(product.artisan) && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to update this product')
  }

  const allowedUpdates = pickAllowedProductFields(req.body)

  if (req.files && req.files.length > 0) {
    allowedUpdates.images = req.files.map((f) => f.filename)
  } else if (req.body.images) {
    allowedUpdates.images = Array.isArray(req.body.images) ? req.body.images : [req.body.images]
  } else if (req.body.imageUrl) {
    allowedUpdates.images = [req.body.imageUrl]
  }

  product.set(allowedUpdates)
  await product.save()

  res.json({ success: true, message: 'Product updated successfully', product })
})

// Delete product
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  if (!req.user._id.equals(product.artisan) && req.user.role !== 'admin') {
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
  const ratingValue = Number(rating)

  if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5')
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    {
      $push: {
        reviews: {
          user: req.user._id,
          rating: ratingValue,
          comment,
          createdAt: new Date(),
        },
      },
      $inc: {
        'rating.count': 1,
        'rating.total': ratingValue,
      },
    },
    { new: true }
  )

  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  product.rating.average = Math.round((product.rating.total / product.rating.count) * 10) / 10
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

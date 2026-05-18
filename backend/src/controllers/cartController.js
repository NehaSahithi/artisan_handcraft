import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'

// Get cart
export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id })
    .populate('items.product')
    .populate('items.artisan', 'name')

  if (!cart) {
    cart = await Cart.create({ user: req.user.id })
  }

  res.json({ success: true, cart })
})

// Add to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body

  if (quantity < 1) {
    throw new ApiError(400, 'Quantity must be at least 1')
  }

  const product = await Product.findById(productId)
  if (!product) {
    throw new ApiError(404, 'Product not found')
  }

  if (product.stock < quantity) {
    throw new ApiError(400, 'Insufficient stock')
  }

  let cart = await Cart.findOne({ user: req.user.id })
  if (!cart) {
    cart = await Cart.create({ user: req.user.id })
  }

  const existingItem = cart.items.find((item) => item.product.toString() === productId)

  if (existingItem) {
    if (existingItem.quantity + quantity > product.maxQuantityPerOrder) {
      throw new ApiError(400, 'Exceeds maximum quantity per order')
    }
    existingItem.quantity += quantity
  } else {
    if (quantity > product.maxQuantityPerOrder) {
      throw new ApiError(400, 'Exceeds maximum quantity per order')
    }
    cart.items.push({
      product: productId,
      artisan: product.artisan,
      quantity,
    })
  }

  cart.calculateTotals()
  await cart.save()

  res.json({ success: true, message: 'Added to cart', cart })
})

// Update cart item
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const { quantity } = req.body

  if (quantity < 1) {
    throw new ApiError(400, 'Quantity must be at least 1')
  }

  const cart = await Cart.findOne({ user: req.user.id })
  if (!cart) {
    throw new ApiError(404, 'Cart not found')
  }

  const item = cart.items.find((item) => item.product.toString() === productId)
  if (!item) {
    throw new ApiError(404, 'Item not in cart')
  }

  const product = await Product.findById(productId)
  if (quantity > product.stock) {
    throw new ApiError(400, 'Insufficient stock')
  }

  if (quantity > product.maxQuantityPerOrder) {
    throw new ApiError(400, 'Exceeds maximum quantity per order')
  }

  item.quantity = quantity
  cart.calculateTotals()
  await cart.save()

  res.json({ success: true, message: 'Cart updated', cart })
})

// Remove from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params

  const cart = await Cart.findOne({ user: req.user.id })
  if (!cart) {
    throw new ApiError(404, 'Cart not found')
  }

  cart.items = cart.items.filter((item) => item.product.toString() !== productId)
  cart.calculateTotals()
  await cart.save()

  res.json({ success: true, message: 'Item removed from cart', cart })
})

// Clear cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id })
  if (!cart) {
    throw new ApiError(404, 'Cart not found')
  }

  cart.items = []
  cart.totalItems = 0
  cart.subtotal = 0
  await cart.save()

  res.json({ success: true, message: 'Cart cleared' })
})

// Apply coupon
export const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body

  const cart = await Cart.findOne({ user: req.user.id })
  if (!cart) {
    throw new ApiError(404, 'Cart not found')
  }

  // Coupon logic can be extended with a Coupon model
  cart.appliedCoupon = { code: couponCode }
  await cart.save()

  res.json({ success: true, message: 'Coupon applied', cart })
})

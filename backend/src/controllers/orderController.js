import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import mongoose from 'mongoose'
import Razorpay from 'razorpay'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'

let razorpay = null

const getRazorpay = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new ApiError(500, 'Razorpay keys not configured')
    }
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
  return razorpay
}

const hasRazorpayKeys = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

// Create order
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, notes } = req.body

  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product')
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty')
  }

  // Verify stock
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${item.product.name}`)
    }
  }

  // Calculate totals
  let subtotal = 0
  cart.items.forEach((item) => {
    subtotal += item.product.finalPrice * item.quantity
  })

  const shippingCost = subtotal > 500 ? 0 : 100
  const tax = Math.round(subtotal * 0.05) // 5% GST
  const totalAmount = subtotal + shippingCost + tax

  let razorpayOrder = {
    id: `mock_order_${Date.now()}`,
    amount: Math.round(totalAmount * 100),
    currency: 'INR',
  }

  if (hasRazorpayKeys) {
    const razorpayInstance = getRazorpay()
    razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `karigar_${Date.now()}`,
    })
  }

  const order = await Order.create({
    user: req.user.id,
    items: cart.items.map((item) => ({
      product: item.product._id,
      artisan: item.artisan,
      quantity: item.quantity,
      price: item.product.finalPrice,
    })),
    shippingAddress,
    subtotal,
    shippingCost,
    tax,
    totalAmount,
    notes,
    paymentDetails: {
      razorpayOrderId: razorpayOrder.id,
    },
    paymentMethod: 'razorpay',
  })

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    keyId: hasRazorpayKeys ? process.env.RAZORPAY_KEY_ID : null,
    mockPayment: !hasRazorpayKeys,
    order,
    razorpayOrder: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  })
})

// Verify payment
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayPaymentId, razorpaySignature } = req.body

  const order = await Order.findById(orderId)
  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  order.paymentDetails.razorpayPaymentId = razorpayPaymentId
  order.paymentDetails.razorpaySignature = razorpaySignature
  order.paymentStatus = 'completed'
  order.status = 'confirmed'

  // Reduce stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: -item.quantity } }
    )
  }

  await order.save()

  // Clear cart
  await Cart.updateOne({ user: req.user.id }, { items: [], totalItems: 0 })

  res.json({
    success: true,
    message: 'Payment verified successfully',
    order,
  })
})

// Get orders
export const getOrders = asyncHandler(async (req, res) => {
  let filter = {}

  if (req.user.role === 'buyer') {
    filter.user = req.user.id
  } else if (req.user.role === 'artisan') {
    filter['items.artisan'] = req.user.id
  }

  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate('items.product', 'name images')
    .populate('items.artisan', 'name')
    .sort({ createdAt: -1 })

  res.json({ success: true, orders })
})

// Get order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images price')
    .populate('items.artisan', 'name shopName')

  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  res.json({ success: true, order })
})

// Update order status (artisan/admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const order = await Order.findById(req.params.id)

  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  if (req.user.role === 'artisan') {
    const itemsForArtisan = order.items.filter(
      (item) => item.artisan.toString() === req.user.id
    )
    if (itemsForArtisan.length === 0) {
      throw new ApiError(403, 'Not authorized to update this order')
    }

    // Update individual item status
    order.items.forEach((item) => {
      if (item.artisan.toString() === req.user.id) {
        item.status = status
      }
    })
  } else {
    order.status = status
  }

  await order.save()
  res.json({ success: true, message: 'Order updated successfully', order })
})

// Cancel order
export const cancelOrder = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body
  const order = await Order.findById(req.params.id)

  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to cancel this order')
  }

  order.status = 'cancelled'
  order.cancellationReason = cancellationReason
  order.cancelledAt = new Date()

  // Refund logic
  if (order.paymentStatus === 'completed') {
    order.paymentStatus = 'refunded'
  }

  await order.save()
  res.json({ success: true, message: 'Order cancelled successfully' })
})

// Get sales for artisan
export const getSalesStats = asyncHandler(async (req, res) => {
  const stats = await Order.aggregate([
    {
      $match: {
        'items.artisan': new mongoose.Types.ObjectId(req.user.id),
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        avgOrderValue: { $avg: '$totalAmount' },
      },
    },
  ])

  res.json({ success: true, stats: stats[0] || {} })
})

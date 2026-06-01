import crypto from 'node:crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { getRazorpay, hasValidKeys } from '../config/razorpay.js';
import { ApiError } from '../middleware/errorHandler.js';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../constants/categories.js';
import { calculateShipping, calculateTax, paginateQuery } from '../utils/helpers.js';
import { sendOrderConfirmation } from '../utils/email.js';

// @desc    Create a new Razorpay order & pending db order
// @route   POST /api/orders
// @access  Private/Buyer
export const createOrder = async (req, res) => {
  const { shippingAddress, notes } = req.body;

  // 1. Double check Razorpay configuration
  if (!hasValidKeys()) {
    throw new ApiError(500, 'Payment service is currently unavailable. Please contact support.');
  }

  // 2. Fetch buyer's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Your cart is empty.');
  }

  // 3. Verify stock availability for all products in the cart
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      throw new ApiError(400, `The product "${item.product ? item.product.name : 'Unknown'}" is no longer active.`);
    }
    if (item.product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for "${item.product.name}". Available stock: ${item.product.stock}`);
    }
  }

  // 4. Calculate total amounts securely on the backend
  let subtotal = 0;
  const itemsData = [];

  for (const item of cart.items) {
    const itemSubtotal = item.product.finalPrice * item.quantity;
    subtotal += itemSubtotal;

    // Safely extract product image URL, supporting both object schema and old string schemas
    let imageUrl = '';
    if (item.product.images && item.product.images.length > 0) {
      const firstImg = item.product.images[0];
      if (firstImg) {
        imageUrl = typeof firstImg === 'string' ? firstImg : (firstImg.url || '');
      }
    }
    // Hard fallback to placeholder to satisfy the non-empty Mongoose validator
    if (!imageUrl) {
      imageUrl = 'https://placehold.co/600x400?text=Handicrafts';
    }

    itemsData.push({
      product: item.product._id,
      artisan: item.product.artisan,
      name: item.product.name,
      image: imageUrl,
      quantity: item.quantity,
      price: item.product.finalPrice,
      status: ORDER_STATUSES.PENDING
    });
  }

  const shippingCharge = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);
  const totalAmount = Math.round((subtotal + shippingCharge + tax) * 100) / 100;

  // 5. Generate Razorpay Order
  const razorpayInstance = getRazorpay();
  let razorpayOrder;
  try {
    razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(totalAmount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    });
  } catch (err) {
    console.error('Razorpay Order Creation Failed:', err);
    throw new ApiError(500, 'Failed to initialize payment gateway order.');
  }

  // 6. Save pending Order in the database
  const order = await Order.create({
    user: req.user._id,
    items: itemsData,
    shippingAddress,
    payment: {
      razorpayOrderId: razorpayOrder.id,
      method: 'razorpay',
      status: PAYMENT_STATUSES.PENDING
    },
    subtotal,
    shippingCharge,
    tax,
    totalAmount,
    status: ORDER_STATUSES.PENDING,
    notes
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully. Awaiting payment.',
    order,
    razorpayOrder: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    },
    key: process.env.RAZORPAY_KEY_ID
  });
};

// @desc    Verify Razorpay payment signature & confirm order
// @route   POST /api/orders/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
  const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
  const razorpayPaymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id;
  const razorpaySignature = req.body.razorpaySignature || req.body.razorpay_signature;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, 'Missing payment parameters for verification.');
  }

  // 1. Verify Payment Signature
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`) // CORRECT ORDER: orderId|paymentId
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    throw new ApiError(400, 'Cryptographic payment signature verification failed.');
  }

  // 2. Find corresponding order
  const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
  if (!order) {
    throw new ApiError(404, 'No pending order found for this payment transaction.');
  }

  // 3. Atomically decrement stock
  for (const item of order.items) {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (!updatedProduct) {
      // Out of stock case (extremely rare if check happens immediately at checkout)
      throw new ApiError(400, `Stock exhausted for "${item.name}" before payment could be verified.`);
    }
  }

  // 4. Update order payment statuses
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.razorpaySignature = razorpaySignature;
  order.payment.status = PAYMENT_STATUSES.COMPLETED;
  order.status = ORDER_STATUSES.CONFIRMED;

  // Set all items status to confirmed
  order.items.forEach((item) => {
    item.status = ORDER_STATUSES.CONFIRMED;
  });

  await order.save();

  // 5. Clear user's cart
  await Cart.findOneAndUpdate(
    { user: order.user },
    { $set: { items: [], subtotal: 0, totalItems: 0 } }
  );

  // 6. Send order confirmation email
  try {
    const buyer = await User.findById(order.user);
    if (buyer) {
      await sendOrderConfirmation(order, buyer);
    }
  } catch (err) {
    console.error(`Failed to send order email: ${err.message}`);
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified and order confirmed successfully.',
    order
  });
};

// @desc    Get buyer's own orders
// @route   GET /api/orders/my-orders
// @access  Private/Buyer
export const getMyOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const paginatedResults = await paginateQuery(
    Order,
    { user: req.user._id },
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

// @desc    Get orders placed for artisan's products
// @route   GET /api/orders/seller-orders
// @access  Private/Artisan
export const getSellerOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Find orders where items.artisan contains the artisan's id
  const paginatedResults = await paginateQuery(
    Order,
    { 'items.artisan': req.user._id, 'payment.status': PAYMENT_STATUSES.COMPLETED },
    page,
    limit,
    '',
    { createdAt: -1 }
  );

  // Filter items in each order to only show products belonging to this seller
  const filteredOrders = paginatedResults.results.map((ord) => {
    const orderObj = ord.toObject();
    orderObj.items = orderObj.items.filter(
      (item) => item.artisan.toString() === req.user._id.toString()
    );
    return orderObj;
  });

  res.status(200).json({
    success: true,
    results: filteredOrders,
    pagination: paginatedResults.pagination
  });
};

// @desc    Get single order by ID with secure authorization checks
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate({ path: 'user', select: 'name email phone' })
    .populate({ path: 'items.product', select: 'name images price finalPrice' })
    .populate({ path: 'items.artisan', select: 'name shopName' });

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  // Security authorization: User must be order owner, seller of an item, or an admin
  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isSeller = order.items.some(
    (item) => item.artisan._id.toString() === req.user._id.toString()
  );
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isSeller && !isAdmin) {
    throw new ApiError(403, 'Not authorized to view this order details.');
  }

  res.status(200).json({
    success: true,
    order
  });
};

// @desc    Update order item shipping status (Artisan only)
// @route   PUT /api/orders/:id/item/:itemId/status
// @access  Private/Artisan
export const updateItemStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  const item = order.items.id(req.params.itemId);
  if (!item) {
    throw new ApiError(404, 'Order item not found.');
  }

  // Authorization: Only the artisan who owns the item can update its status
  if (item.artisan.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to update this item status.');
  }

  item.status = status;

  // Cascade order-level status based on item statuses
  const allItemStatuses = order.items.map((i) => i.status);
  
  if (allItemStatuses.every((s) => s === ORDER_STATUSES.DELIVERED)) {
    order.status = ORDER_STATUSES.DELIVERED;
  } else if (allItemStatuses.every((s) => s === ORDER_STATUSES.SHIPPED || s === ORDER_STATUSES.DELIVERED)) {
    order.status = ORDER_STATUSES.SHIPPED;
  } else if (allItemStatuses.some((s) => s === ORDER_STATUSES.PROCESSING)) {
    order.status = ORDER_STATUSES.PROCESSING;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Item shipping status updated successfully.',
    order
  });
};

// @desc    Cancel order (Buyer only, only if order is not shipped)
// @route   PUT /api/orders/:id/cancel
// @access  Private/Buyer
export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  // Verify ownership
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to cancel this order.');
  }

  // Can only cancel pending or newly confirmed orders (not processing/shipped)
  const nonCancellableStates = [
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.DELIVERED,
    ORDER_STATUSES.CANCELLED
  ];
  if (nonCancellableStates.includes(order.status)) {
    throw new ApiError(400, `Cannot cancel order at "${order.status}" stage.`);
  }

  order.status = ORDER_STATUSES.CANCELLED;
  order.items.forEach((item) => {
    item.status = ORDER_STATUSES.CANCELLED;
  });

  // Restore inventory stocks atomically
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  // Handle payments if completed
  if (order.payment.status === PAYMENT_STATUSES.COMPLETED) {
    order.payment.status = PAYMENT_STATUSES.REFUNDED;
    // NOTE: Razorpay refund API logic can be optionally integrated here
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully and product inventory restored.'
  });
};

// @desc    Get detailed seller sales statistics
// @route   GET /api/orders/stats
// @access  Private/Artisan
export const getSalesStats = async (req, res) => {
  const stats = await Order.aggregate([
    { $unwind: '$items' },
    {
      $match: {
        'items.artisan': req.user._id,
        'payment.status': PAYMENT_STATUSES.COMPLETED
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $addToSet: '$_id' }, // Uniquely distinct orders
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }, // Artisan's own items only
        totalItemsSold: { $sum: '$items.quantity' }
      }
    },
    {
      $project: {
        _id: 0,
        totalOrders: { $size: '$totalOrders' },
        totalRevenue: 1,
        totalItemsSold: 1
      }
    }
  ]);

  const responseStats = stats[0] || { totalOrders: 0, totalRevenue: 0, totalItemsSold: 0 };

  res.status(200).json({
    success: true,
    stats: responseStats
  });
};

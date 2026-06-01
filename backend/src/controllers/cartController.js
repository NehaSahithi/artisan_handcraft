import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { ApiError } from '../middleware/errorHandler.js';

// @desc    Get user's cart (self-healing for deactivated products)
// @route   GET /api/cart
// @access  Private/Buyer
export const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate({
      path: 'items.product',
      select: 'name finalPrice price discount images stock isActive artisan',
      populate: { path: 'artisan', select: 'name shopName' }
    });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Self-Healing: Check if any populated products are null or deactivated
  const originalItemCount = cart.items.length;
  cart.items = cart.items.filter(
    (item) => item.product && item.product.isActive
  );

  // If items were pruned, update price snapshots and recalculate totals
  if (cart.items.length !== originalItemCount) {
    cart.items.forEach((item) => {
      item.price = item.product.finalPrice;
    });
    cart.calculateTotals();
    await cart.save();
  } else if (cart.items.length > 0) {
    // Standard update: Refresh price snapshots in case prices changed
    let priceChanged = false;
    cart.items.forEach((item) => {
      if (item.price !== item.product.finalPrice) {
        item.price = item.product.finalPrice;
        priceChanged = true;
      }
    });
    if (priceChanged) {
      cart.calculateTotals();
      await cart.save();
    }
  }

  res.status(200).json({
    success: true,
    cart
  });
};

// @desc    Add product to cart
// @route   POST /api/cart/add
// @access  Private/Buyer
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (quantity < 1) {
    throw new ApiError(400, 'Quantity must be at least 1.');
  }

  // 1. Fetch and validate product
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, 'Product not found or has been deactivated.');
  }

  // Check stock
  if (product.stock < quantity) {
    throw new ApiError(400, `Insufficient stock. Only ${product.stock} units are available.`);
  }

  // 2. Fetch or create cart
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // 3. Find if item already exists in cart
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > 10) {
      throw new ApiError(400, 'Cannot purchase more than 10 units of a single item in one order.');
    }

    if (product.stock < newQuantity) {
      throw new ApiError(400, `Insufficient stock. Total cart quantity (${newQuantity}) exceeds available stock (${product.stock}).`);
    }

    existingItem.quantity = newQuantity;
    existingItem.price = product.finalPrice; // Update snapshot to current price
  } else {
    if (quantity > 10) {
      throw new ApiError(400, 'Cannot purchase more than 10 units of a single item in one order.');
    }

    cart.items.push({
      product: productId,
      quantity,
      price: product.finalPrice // Snapshot current price
    });
  }

  cart.calculateTotals();
  await cart.save();

  // Populate product details for response consistency
  await cart.populate({
    path: 'items.product',
    select: 'name finalPrice price discount images stock isActive artisan'
  });

  res.status(200).json({
    success: true,
    message: `Added "${product.name}" to cart.`,
    cart
  });
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private/Buyer
export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    throw new ApiError(400, 'Quantity must be at least 1.');
  }

  if (quantity > 10) {
    throw new ApiError(400, 'Cannot purchase more than 10 units of a single item.');
  }

  // 1. Fetch cart
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Shopping cart not found.');
  }

  // 2. Find cart item
  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    throw new ApiError(404, 'Item not found in shopping cart.');
  }

  // 3. Fetch product for live stock checking
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    // If the product was deactivated, remove it entirely
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    cart.calculateTotals();
    await cart.save();
    throw new ApiError(404, 'This product is no longer active and has been removed from your cart.');
  }

  if (product.stock < quantity) {
    throw new ApiError(400, `Insufficient stock. Only ${product.stock} units are available.`);
  }

  // 4. Update quantity and refresh price snapshot
  item.quantity = quantity;
  item.price = product.finalPrice;

  cart.calculateTotals();
  await cart.save();

  await cart.populate({
    path: 'items.product',
    select: 'name finalPrice price discount images stock isActive artisan'
  });

  res.status(200).json({
    success: true,
    message: 'Cart item quantity updated.',
    cart
  });
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private/Buyer
export const removeCartItem = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Shopping cart not found.');
  }

  const originalLength = cart.items.length;
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  if (cart.items.length === originalLength) {
    throw new ApiError(404, 'Item not found in shopping cart.');
  }

  cart.calculateTotals();
  await cart.save();

  await cart.populate({
    path: 'items.product',
    select: 'name finalPrice price discount images stock isActive artisan'
  });

  res.status(200).json({
    success: true,
    message: 'Item removed from cart.',
    cart
  });
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private/Buyer
export const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Shopping cart not found.');
  }

  cart.items = [];
  cart.subtotal = 0;
  cart.totalItems = 0;
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully.'
  });
};

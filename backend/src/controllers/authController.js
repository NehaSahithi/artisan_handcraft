import User from '../models/User.js'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'

// Register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, phone } = req.body

  if (!name || !email || !password || !confirmPassword) {
    throw new ApiError(400, 'Please provide all required fields')
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match')
  }

  const userExists = await User.findOne({ email })
  if (userExists) {
    throw new ApiError(400, 'Email is already registered')
  }

  // Always create users as 'buyer' by default. Role elevation to artisan/admin
  // must happen through controlled flows (KYC / admin approval).
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'buyer',
  })

  const token = user.getSignedJwtToken()

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000,
  })

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  })
})

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password')
  }

  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    throw new ApiError(400, 'Invalid email or password')
  }

  const isMatch = await user.matchPassword(password)
  if (!isMatch) {
    throw new ApiError(400, 'Invalid email or password')
  }

  const token = user.getSignedJwtToken()

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000,
  })

  res.json({
    success: true,
    message: 'Logged in successfully',
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  })
})

// Logout
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token')
  res.json({ success: true, message: 'Logged out successfully' })
})

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  res.json({ success: true, user })
})

// Update profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  )

  res.json({ success: true, message: 'Profile updated successfully', user })
})

// Add address
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  user.addresses.push(req.body)
  await user.save()

  res.json({ success: true, message: 'Address added successfully', addresses: user.addresses })
})

// Update address
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params
  const user = await User.findById(req.user.id)

  const address = user.addresses.id(addressId)
  if (!address) {
    throw new ApiError(404, 'Address not found')
  }

  Object.assign(address, req.body)
  await user.save()

  res.json({ success: true, message: 'Address updated successfully', addresses: user.addresses })
})

// Delete address
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params
  const user = await User.findById(req.user.id)

  user.addresses.id(addressId).deleteOne()
  await user.save()

  res.json({ success: true, message: 'Address deleted successfully', addresses: user.addresses })
})

// Get wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist')
  res.json({ success: true, wishlist: user.wishlist })
})

// Add to wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const user = await User.findById(req.user.id)

  if (!user.wishlist.includes(productId)) {
    user.wishlist.push(productId)
    await user.save()
  }

  res.json({ success: true, message: 'Added to wishlist' })
})

// Remove from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const user = await User.findById(req.user.id)

  user.wishlist = user.wishlist.filter((id) => id.toString() !== productId)
  await user.save()

  res.json({ success: true, message: 'Removed from wishlist' })
})

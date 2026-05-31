import User from '../models/User.js'
import Order from '../models/Order.js'
import ArtisanProfile from '../models/ArtisanProfile.js'
import { asyncHandler, ApiError } from '../middleware/errorHandler.js'

export const getMetrics = asyncHandler(async (req, res) => {
  const [totalUsers, totalArtisans, totalOrders, revenueResult] = await Promise.all([
    User.countDocuments(),
    ArtisanProfile.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]),
  ])

  res.json({
    success: true,
    metrics: {
      totalUsers,
      totalArtisans,
      totalOrders,
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
    },
  })
})

export const getPendingArtisans = asyncHandler(async (req, res) => {
  const artisans = await ArtisanProfile.find({
    'kyc.status': { $in: ['pending', 'submitted'] },
    isActive: true,
  })
    .populate('user', 'name email phone avatar')
    .sort({ updatedAt: -1 })

  res.json({ success: true, artisans })
})

export const verifyArtisan = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body
  const artisan = await ArtisanProfile.findById(req.params.id)

  if (!artisan) {
    throw new ApiError(404, 'Artisan profile not found')
  }

  const nextStatus = status === 'approved' ? 'verified' : 'rejected'
  artisan.kyc.status = nextStatus
  artisan.kyc.verifiedAt = nextStatus === 'verified' ? new Date() : null
  artisan.kyc.rejectionReason = nextStatus === 'rejected' ? (rejectionReason || 'Rejected by admin') : undefined
  artisan.isVerified = nextStatus === 'verified'
  await artisan.save()

  if (nextStatus === 'verified') {
    await User.findByIdAndUpdate(artisan.user, { role: 'artisan' })
  }

  res.json({ success: true, message: `Artisan ${nextStatus}`, artisan })
})
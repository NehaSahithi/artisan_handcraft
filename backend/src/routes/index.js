import express from 'express'
import authRoutes from './authRoutes.js'
import productRoutes from './productRoutes.js'
import cartRoutes from './cartRoutes.js'
import orderRoutes from './orderRoutes.js'
import artisanRoutes from './artisanRoutes.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/cart', cartRoutes)
router.use('/orders', orderRoutes)
router.use('/artisans', artisanRoutes)

export default router

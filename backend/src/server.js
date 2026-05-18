import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'express-async-errors'
import connectDB from './config/database.js'
import routes from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()

// Connect to database
connectDB()

// Middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)

// Static files
app.use('/public', express.static('public'))

// API Routes
app.use('/api', routes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running ✅' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Error handling middleware
app.use(errorHandler)

// Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
  console.log(`📧 CORS enabled for: ${process.env.FRONTEND_URL}`)
})

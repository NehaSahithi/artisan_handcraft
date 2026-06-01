import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import { validateEnv } from './config/env.js';
// Validate env variables before doing anything else
validateEnv();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';

import connectDB from './config/database.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Trust proxy (crucial for accurate IP rate limiting behind reverse proxies like Nginx/Cloudflare)
app.set('trust proxy', 1);

// Connect to database
connectDB();

// 1. Raw body parser for webhooks (MUST be placed before express.json() to get exact raw bytes)
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// 2. Global Security Headers (Helmet)
app.use(helmet());

// 3. NoSQL Injection Prevention (Sanitize mongo queries)
app.use(mongoSanitize());

// 4. HTTP Parameter Pollution Prevention
app.use(hpp());

// 5. Global API Rate Limiting (100 requests per 15 minutes per IP)
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in standard headers
  legacyHeaders: false, // Disable the legacy X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api', globalRateLimiter);

// 6. Request Body Parsers (Harden with 1MB payload limits)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cookieParser());

// 7. Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
  })
);

// 8. API Routes
app.use('/api', routes);

// 9. Root Health check (no limiter needed)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: 'healthy',
    message: 'Karigar API is running securely ✅' 
  });
});

// 10. Fallback 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

// 11. Global Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server securely running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🔒 CORS enabled for: ${process.env.FRONTEND_URL}`);
});

// Graceful shut down on unhandled errors
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  server.close(() => process.exit(1));
});

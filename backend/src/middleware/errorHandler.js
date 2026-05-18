export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.message = err.message || 'Internal server error'

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0]
    err.statusCode = 400
    err.message = `${key.charAt(0).toUpperCase() + key.slice(1)} already exists`
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((error) => error.message)
      .join(', ')
    err.statusCode = 400
    err.message = message
  }

  // Mongoose Cast Error
  if (err.name === 'CastError') {
    err.statusCode = 400
    err.message = `Resource not found. Invalid: ${err.path}`
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401
    err.message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401
    err.message = 'Token has expired'
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  })
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

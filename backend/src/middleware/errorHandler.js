export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log details for debugging (only in development)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Handler Caught:', err);
  }

  // Handle specific database and auth errors
  
  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    const value = err.keyValue[key];
    error.statusCode = 400;
    error.message = `${key.charAt(0).toUpperCase() + key.slice(1)} '${value}' already exists`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error.statusCode = 400;
    error.message = message;
  }

  // Mongoose Cast Error (Invalid Object ID)
  if (err.name === 'CastError') {
    error.statusCode = 400;
    error.message = `Invalid resource ID. ${err.path}: ${err.value}`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid token. Please login again.';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Session expired. Please login again.';
  }

  // Zod Validation Error (if validator fails on server side)
  if (err.name === 'ZodError') {
    error.statusCode = 400;
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    error.message = 'Validation failed';
    return res.status(400).json({
      success: false,
      message: error.message,
      errors: details
    });
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, details: err })
  });
};

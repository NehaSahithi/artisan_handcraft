import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from './errorHandler.js';

export const protect = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized to access this route. Token missing.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      throw new ApiError(404, 'User no longer exists.');
    }

    // Crucial: Deactivated check
    if (!req.user.isActive) {
      throw new ApiError(403, 'Account is deactivated. Please contact support.');
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired. Please login again.'));
    } else {
      next(new ApiError(401, 'Not authorized. Invalid token.'));
    }
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized. User context missing.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role "${req.user.role}" is not authorized to access this route`
        )
      );
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (error) {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

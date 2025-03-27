// src/api/middleware/errorHandler.js
const logger = require('../../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code (optional)
   * @param {Array} details - Error details (optional)
   */
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'GENERIC_ERROR';
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert API error to response object
   * @returns {Object} Error response object
   */
  toResponse() {
    const response = {
      error: {
        message: this.message,
        code: this.code
      }
    };

    if (this.details) {
      response.error.details = this.details;
    }

    return response;
  }

  /**
   * Create a Bad Request error (400)
   * @param {string} message - Error message
   * @param {string} code - Error code (optional)
   * @param {Array} details - Error details (optional)
   * @returns {ApiError} Bad Request error
   */
  static badRequest(message, code = 'BAD_REQUEST', details = null) {
    return new ApiError(message, 400, code, details);
  }

  /**
   * Create an Unauthorized error (401)
   * @param {string} message - Error message
   * @param {string} code - Error code (optional)
   * @returns {ApiError} Unauthorized error
   */
  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED') {
    return new ApiError(message, 401, code);
  }

  /**
   * Create a Forbidden error (403)
   * @param {string} message - Error message
   * @param {string} code - Error code (optional)
   * @returns {ApiError} Forbidden error
   */
  static forbidden(message = 'Forbidden', code = 'FORBIDDEN') {
    return new ApiError(message, 403, code);
  }

  /**
   * Create a Not Found error (404)
   * @param {string} message - Error message
   * @param {string} code - Error code (optional)
   * @returns {ApiError} Not Found error
   */
  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(message, 404, code);
  }

  /**
   * Create a Conflict error (409)
   * @param {string} message - Error message
   * @param {string} code - Error code (optional)
   * @returns {ApiError} Conflict error
   */
  static conflict(message, code = 'CONFLICT') {
    return new ApiError(message, 409, code);
  }

  /**
   * Create an Internal Server Error (500)
   * @param {string} message - Error message
   * @param {string} code - Error code (optional)
   * @returns {ApiError} Internal Server Error
   */
  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new ApiError(message, 500, code);
  }
}

/**
 * Not Found middleware for handling undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiError.notFound(`Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // If the error is an ApiError, use its status code and response format
  if (err instanceof ApiError) {
    logger.error(`API Error: ${err.message}`, { 
      code: err.code, 
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
      userId: req.user ? req.user.id : 'anonymous'
    });
    
    return res.status(err.statusCode).json(err.toResponse());
  }

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // Duplicate key error
    if (err.code === 11000) {
      logger.error(`MongoDB duplicate key error: ${JSON.stringify(err.keyValue)}`, { 
        url: req.originalUrl,
        method: req.method,
        userId: req.user ? req.user.id : 'anonymous'
      });
      
      const field = Object.keys(err.keyValue)[0];
      const error = ApiError.conflict(`${field} already exists`, 'DUPLICATE_KEY');
      
      return res.status(error.statusCode).json(error.toResponse());
    }
    
    // Other MongoDB errors
    logger.error(`MongoDB error: ${err.message}`, { 
      code: err.code,
      url: req.originalUrl,
      method: req.method,
      userId: req.user ? req.user.id : 'anonymous'
    });
    
    const error = ApiError.internal('Database error');
    return res.status(error.statusCode).json(error.toResponse());
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    logger.error(`Validation error: ${err.message}`, { 
      url: req.originalUrl,
      method: req.method,
      userId: req.user ? req.user.id : 'anonymous'
    });
    
    const details = Object.keys(err.errors).map(field => ({
      field,
      message: err.errors[field].message
    }));
    
    const error = ApiError.badRequest('Validation failed', 'VALIDATION_ERROR', details);
    return res.status(error.statusCode).json(error.toResponse());
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    logger.error(`JWT error: ${err.message}`, { 
      url: req.originalUrl,
      method: req.method,
      userId: req.user ? req.user.id : 'anonymous'
    });
    
    const error = ApiError.unauthorized('Invalid token', 'INVALID_TOKEN');
    return res.status(error.statusCode).json(error.toResponse());
  }

  if (err.name === 'TokenExpiredError') {
    logger.error(`JWT expired: ${err.message}`, { 
      url: req.originalUrl,
      method: req.method,
      userId: req.user ? req.user.id : 'anonymous'
    });
    
    const error = ApiError.unauthorized('Token expired', 'TOKEN_EXPIRED');
    return res.status(error.statusCode).json(error.toResponse());
  }

  // Handle other errors as internal server errors
  logger.error(`Unhandled error: ${err.message}`, { 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user ? req.user.id : 'anonymous'
  });
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Internal server error';
  
  return res.status(statusCode).json({
    error: {
      message,
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler
};
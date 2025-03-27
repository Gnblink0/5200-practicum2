/**
 * Custom error class for application errors
 */
class AppError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Create a custom application error
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} details - Additional error details
 * @returns {AppError} Custom application error
 */
const createError = (statusCode, message, details = null) => {
    return new AppError(statusCode, message, details);
};

/**
 * Handle validation errors from Mongoose
 * @param {Error} error - Mongoose validation error
 * @returns {AppError} Custom application error
 */
const handleValidationError = (error) => {
    const errors = Object.values(error.errors).map(err => err.message);
    return new AppError(400, 'Validation Error', errors);
};

/**
 * Handle duplicate key errors from MongoDB
 * @param {Error} error - MongoDB duplicate key error
 * @returns {AppError} Custom application error
 */
const handleDuplicateKeyError = (error) => {
    const field = Object.keys(error.keyPattern)[0];
    return new AppError(409, `Duplicate value for ${field}`);
};

/**
 * Handle JWT errors
 * @param {Error} error - JWT error
 * @returns {AppError} Custom application error
 */
const handleJWTError = (error) => {
    if (error.name === 'JsonWebTokenError') {
        return new AppError(401, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
        return new AppError(401, 'Token expired');
    }
    return new AppError(401, 'Authentication error');
};

/**
 * Global error handler middleware
 * @param {Error} error - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
const errorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', error);
    }

    // Send error response
    res.status(error.statusCode).json({
        success: false,
        error: {
            message: error.message,
            details: error.details,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
    });
};

/**
 * Handle 404 Not Found errors
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 */
const notFoundHandler = (req, res, next) => {
    next(createError(404, `Route ${req.originalUrl} not found`));
};

/**
 * Handle async errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = {
    AppError,
    createError,
    handleValidationError,
    handleDuplicateKeyError,
    handleJWTError,
    errorHandler,
    notFoundHandler,
    catchAsync
}; 
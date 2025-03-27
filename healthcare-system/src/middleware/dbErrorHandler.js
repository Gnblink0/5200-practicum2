const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Handle MongoDB duplicate key errors
 * @param {Error} err - Error object
 * @returns {Object} Formatted error response
 */
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyPattern)[0];
    return {
        status: 409,
        message: `A record with this ${field} already exists`,
        field
    };
};

/**
 * Handle MongoDB validation errors
 * @param {Error} err - Error object
 * @returns {Object} Formatted error response
 */
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message
    }));

    return {
        status: 400,
        message: 'Validation Error',
        errors
    };
};

/**
 * Handle MongoDB cast errors
 * @param {Error} err - Error object
 * @returns {Object} Formatted error response
 */
const handleCastError = (err) => {
    return {
        status: 400,
        message: `Invalid ${err.path}: ${err.value}`,
        field: err.path
    };
};

/**
 * Handle MongoDB connection errors
 * @param {Error} err - Error object
 * @returns {Object} Formatted error response
 */
const handleConnectionError = (err) => {
    logger.logError('Database connection error:', err);
    return {
        status: 503,
        message: 'Database connection error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    };
};

/**
 * Handle MongoDB timeout errors
 * @param {Error} err - Error object
 * @returns {Object} Formatted error response
 */
const handleTimeoutError = (err) => {
    logger.logError('Database timeout error:', err);
    return {
        status: 504,
        message: 'Database operation timed out',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    };
};

/**
 * Main database error handler middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Next} next - Express next function
 */
const dbErrorHandler = (err, req, res, next) => {
    let errorResponse;

    if (err instanceof mongoose.Error) {
        switch (err.name) {
            case 'ValidationError':
                errorResponse = handleValidationError(err);
                break;
            case 'CastError':
                errorResponse = handleCastError(err);
                break;
            case 'MongoError':
                if (err.code === 11000) {
                    errorResponse = handleDuplicateKeyError(err);
                } else {
                    errorResponse = {
                        status: 500,
                        message: 'Database error',
                        error: process.env.NODE_ENV === 'development' ? err.message : undefined
                    };
                }
                break;
            default:
                errorResponse = {
                    status: 500,
                    message: 'Database error',
                    error: process.env.NODE_ENV === 'development' ? err.message : undefined
                };
        }
    } else if (err.name === 'MongoNetworkError') {
        errorResponse = handleConnectionError(err);
    } else if (err.name === 'MongoTimeoutError') {
        errorResponse = handleTimeoutError(err);
    } else {
        errorResponse = {
            status: 500,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        };
    }

    logger.logError('Database error:', {
        error: err,
        response: errorResponse,
        path: req.path,
        method: req.method
    });

    res.status(errorResponse.status).json(errorResponse);
};

module.exports = dbErrorHandler; 
// src/api/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { UserCrud } = require('../../models/crud-operations');
const logger = require('../../utils/logger');

/**
 * Authentication middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          message: 'Access denied. No token provided or invalid format.'
        }
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Add user info to request object
      req.user = decoded;

      // Get user from database to verify they still exist and have correct role
      const user = await UserCrud.getById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          error: {
            message: 'Invalid token. User not found.'
          }
        });
      }

      if (user.role !== decoded.role) {
        return res.status(403).json({
          error: {
            message: 'Invalid token. User role mismatch.'
          }
        });
      }

      next();
    } catch (error) {
      // Token verification failed
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: {
            message: 'Token expired. Please log in again.'
          }
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: {
            message: 'Invalid token. Please log in again.'
          }
        });
      }

      // Other errors
      logger.error('Error in authentication middleware:', error);
      return res.status(500).json({
        error: {
          message: 'Internal server error during authentication.'
        }
      });
    }
  } catch (error) {
    logger.error('Error in authentication middleware:', error);
    return res.status(500).json({
      error: {
        message: 'Internal server error.'
      }
    });
  }
};

/**
 * Optional authentication middleware that doesn't require a token
 * but will add user info to request if token is valid
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    // If no token, continue without authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Add user info to request object
      req.user = decoded;

      // Get user from database to verify they still exist and have correct role
      const user = await UserCrud.getById(decoded.id);
      
      if (!user || user.role !== decoded.role) {
        req.user = null;
      }
    } catch (error) {
      // If token verification fails, continue without authentication
      req.user = null;
    }

    next();
  } catch (error) {
    logger.error('Error in optional authentication middleware:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
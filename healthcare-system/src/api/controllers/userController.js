// src/api/controllers/userController.js
const { UserCrud } = require('../../models/crud-operations');
const userService = require('../../models/services/userService');
const logger = require('../../utils/logger');

/**
 * User controller for handling user-related operations
 */
class UserController {
  /**
   * Get current user information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;

      // Get user by ID
      const user = await UserCrud.getById(userId);

      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User not found'
          }
        });
      }

      // Remove sensitive information
      const { passwordHash, ...userInfo } = user;

      res.status(200).json(userInfo);
    } catch (error) {
      logger.error('Error in getCurrentUser controller:', error);
      next(error);
    }
  }

  /**
   * Update current user information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Ensure they cannot update their role or other sensitive fields
      const { role, passwordHash, ...allowedUpdates } = updateData;

      // If they're trying to update their email, we need to check if it's already in use
      if (allowedUpdates.email) {
        const existingUser = await UserCrud.getUserByEmail(allowedUpdates.email);
        
        if (existingUser && existingUser._id.toString() !== userId) {
          return res.status(409).json({
            error: {
              message: 'Email is already in use'
            }
          });
        }
      }

      // Update user
      const updated = await UserCrud.update(userId, allowedUpdates);

      if (!updated) {
        return res.status(404).json({
          error: {
            message: 'User not found'
          }
        });
      }

      res.status(200).json({
        message: 'User updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateCurrentUser controller:', error);
      next(error);
    }
  }

  /**
   * Get user by ID (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      // Get user by ID
      const user = await UserCrud.getById(id);

      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User not found'
          }
        });
      }

      // Remove sensitive information
      const { passwordHash, ...userInfo } = user;

      res.status(200).json(userInfo);
    } catch (error) {
      logger.error('Error in getUserById controller:', error);
      next(error);
    }
  }

  /**
   * Update user by ID (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // If updating email, check if it's already in use
      if (updateData.email) {
        const existingUser = await UserCrud.getUserByEmail(updateData.email);
        
        if (existingUser && existingUser._id.toString() !== id) {
          return res.status(409).json({
            error: {
              message: 'Email is already in use'
            }
          });
        }
      }

      // Update user
      const updated = await UserCrud.update(id, updateData);

      if (!updated) {
        return res.status(404).json({
          error: {
            message: 'User not found'
          }
        });
      }

      res.status(200).json({
        message: 'User updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateUser controller:', error);
      next(error);
    }
  }

  /**
   * Delete user (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Instead of directly deleting, we'll use the service which handles
      // all the related data deletion (patients, doctors, appointments, etc.)
      const deleted = await userService.deleteUserAndRelatedData(id);

      if (!deleted) {
        return res.status(404).json({
          error: {
            message: 'User not found'
          }
        });
      }

      res.status(200).json({
        message: 'User and related data deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteUser controller:', error);
      next(error);
    }
  }

  /**
   * Get all users with filtering and pagination (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllUsers(req, res, next) {
    try {
      const { role, username, email, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

      // Build filter
      const filter = {};
      if (role) filter.role = role;
      if (username) filter.username = { $regex: username, $options: 'i' };
      if (email) filter.email = { $regex: email, $options: 'i' };

      // Build sort object
      const sortObj = {};
      sortObj[sort] = order === 'desc' ? -1 : 1;

      // Calculate skip for pagination
      const skip = (page - 1) * parseInt(limit);

      // Get users
      const users = await UserCrud.find(filter, {
        skip,
        limit: parseInt(limit),
        sort: sortObj
      });

      // Count total users for pagination
      const total = await UserCrud.count(filter);

      // Remove sensitive information
      const sanitizedUsers = users.map(user => {
        const { passwordHash, ...userInfo } = user;
        return userInfo;
      });

      res.status(200).json({
        users: sanitizedUsers,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Error in getAllUsers controller:', error);
      next(error);
    }
  }

  /**
   * Change user password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Change password using service
      const success = await userService.changePassword(userId, currentPassword, newPassword);

      if (!success) {
        return res.status(400).json({
          error: {
            message: 'Current password is incorrect'
          }
        });
      }

      res.status(200).json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Error in changePassword controller:', error);
      next(error);
    }
  }
}

module.exports = new UserController();
// src/api/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserCrud } = require('../../models/crud-operations');
const authService = require('../../models/services/authService');
const logger = require('../../utils/logger');

/**
 * Authentication controller for handling user registration, login, and related operations
 */
class AuthController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async register(req, res, next) {
    try {
      const { username, email, password, role, contactInfo } = req.body;

      // Check if username or email already exists
      const existingUser = await UserCrud.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        return res.status(409).json({
          error: {
            message: existingUser.username === username 
              ? 'Username already exists' 
              : 'Email already exists'
          }
        });
      }

      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userData = {
        username,
        email,
        passwordHash,
        role,
        contactInfo
      };

      // Use auth service to register the user
      const userId = await authService.registerUser(userData);

      res.status(201).json({
        message: 'User registered successfully',
        userId
      });
    } catch (error) {
      logger.error('Error in register controller:', error);
      next(error);
    }
  }

  /**
   * User login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await UserCrud.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({
          error: {
            message: 'Invalid email or password'
          }
        });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatch) {
        return res.status(401).json({
          error: {
            message: 'Invalid email or password'
          }
        });
      }

      // Generate JWT token
      const tokenData = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      const token = jwt.sign(
        tokenData,
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Log successful login
      logger.info(`User ${user.username} (${user._id}) logged in`);

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      logger.error('Error in login controller:', error);
      next(error);
    }
  }

  /**
   * Log out user (invalidate token)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async logout(req, res, next) {
    try {
      // Note: JWT tokens are stateless and can't be invalidated on the server side
      // Typically, the client would remove the token from its storage
      
      // In a real-world app, you could add the token to a blacklist/revocation list
      // or implement a token rotation strategy

      // Just for demonstration, we'll log that the user logged out
      const userId = req.user ? req.user.id : 'Unknown';
      logger.info(`User ${userId} logged out`);

      res.status(200).json({
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Error in logout controller:', error);
      next(error);
    }
  }

  /**
   * Refresh authentication token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async refreshToken(req, res, next) {
    try {
      // Extract refresh token from request
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: {
            message: 'Refresh token is required'
          }
        });
      }

      // Verify the refresh token
      const userData = await authService.verifyRefreshToken(refreshToken);

      if (!userData) {
        return res.status(401).json({
          error: {
            message: 'Invalid or expired refresh token'
          }
        });
      }

      // Generate a new access token
      const newAccessToken = jwt.sign(
        {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'Token refreshed successfully',
        token: newAccessToken
      });
    } catch (error) {
      logger.error('Error in refreshToken controller:', error);
      next(error);
    }
  }

  /**
   * Request password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async requestPasswordReset(req, res, next) {
    try {
      const { email } = req.body;

      // Check if the user exists
      const user = await UserCrud.getUserByEmail(email);
      
      if (!user) {
        // For security reasons, don't reveal that the email doesn't exist
        return res.status(200).json({
          message: 'If your email exists in our system, you will receive a password reset link'
        });
      }

      // Generate reset token
      const resetToken = await authService.generatePasswordResetToken(user._id);

      // In a real application, you would send this token via email
      // For demonstration purposes, we'll just log it
      logger.info(`Password reset token for ${email}: ${resetToken}`);

      res.status(200).json({
        message: 'If your email exists in our system, you will receive a password reset link'
      });
    } catch (error) {
      logger.error('Error in requestPasswordReset controller:', error);
      next(error);
    }
  }

  /**
   * Reset password using token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;

      // Verify the reset token
      const userId = await authService.verifyPasswordResetToken(token);
      
      if (!userId) {
        return res.status(400).json({
          error: {
            message: 'Invalid or expired password reset token'
          }
        });
      }

      // Hash the new password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update user's password
      await UserCrud.update(userId, { passwordHash });

      // Invalidate the reset token
      await authService.invalidatePasswordResetToken(token);

      res.status(200).json({
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      logger.error('Error in resetPassword controller:', error);
      next(error);
    }
  }
}

module.exports = new AuthController();
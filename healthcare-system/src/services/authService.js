const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/authConfig');
const logger = require('../utils/logger');

class AuthService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Created user and token
     */
    async register(userData) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({
                $or: [
                    { email: userData.email },
                    { username: userData.username }
                ]
            });

            if (existingUser) {
                throw new Error('User already exists');
            }

            // Hash password
            const salt = await bcrypt.genSalt(config.password.saltRounds);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            // Create user
            const user = await User.create({
                ...userData,
                password: hashedPassword
            });

            // Generate tokens
            const { accessToken, refreshToken } = await this.generateTokens(user);

            return {
                user: user.toJSON(),
                accessToken,
                refreshToken
            };
        } catch (error) {
            logger.logError('Registration error:', error);
            throw error;
        }
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User data and tokens
     */
    async login(email, password) {
        try {
            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }

            // Check if user is active
            if (!user.isActive) {
                throw new Error('Account is deactivated');
            }

            // Generate tokens
            const { accessToken, refreshToken } = await this.generateTokens(user);

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            return {
                user: user.toJSON(),
                accessToken,
                refreshToken
            };
        } catch (error) {
            logger.logError('Login error:', error);
            throw error;
        }
    }

    /**
     * Generate access and refresh tokens
     * @param {Object} user - User object
     * @returns {Object} Access and refresh tokens
     */
    async generateTokens(user) {
        const accessToken = jwt.sign(
            {
                id: user._id,
                role: user.role,
                email: user.email
            },
            config.jwt.secret,
            config.jwt.options
        );

        const refreshToken = jwt.sign(
            {
                id: user._id
            },
            config.jwt.secret,
            {
                expiresIn: config.jwt.refreshExpiresIn
            }
        );

        return { accessToken, refreshToken };
    }

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<string>} New access token
     */
    async refreshAccessToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, config.jwt.secret);
            const user = await User.findById(decoded.id);

            if (!user) {
                throw new Error('User not found');
            }

            const { accessToken } = await this.generateTokens(user);
            return accessToken;
        } catch (error) {
            logger.logError('Token refresh error:', error);
            throw new Error('Invalid refresh token');
        }
    }

    /**
     * Verify email
     * @param {string} token - Email verification token
     * @returns {Promise<Object>} Updated user
     */
    async verifyEmail(token) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await User.findById(decoded.id);

            if (!user) {
                throw new Error('User not found');
            }

            user.emailVerified = true;
            await user.save();

            return user;
        } catch (error) {
            logger.logError('Email verification error:', error);
            throw new Error('Invalid verification token');
        }
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} Reset token
     */
    async requestPasswordReset(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }

            const resetToken = jwt.sign(
                { id: user._id },
                config.jwt.secret,
                { expiresIn: '1h' }
            );

            // Save reset token to user
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            return { resetToken };
        } catch (error) {
            logger.logError('Password reset request error:', error);
            throw error;
        }
    }

    /**
     * Reset password
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Updated user
     */
    async resetPassword(token, newPassword) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await User.findOne({
                _id: decoded.id,
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                throw new Error('Invalid or expired reset token');
            }

            // Hash new password
            const salt = await bcrypt.genSalt(config.password.saltRounds);
            user.password = await bcrypt.hash(newPassword, salt);

            // Clear reset token
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return user;
        } catch (error) {
            logger.logError('Password reset error:', error);
            throw new Error('Invalid or expired reset token');
        }
    }

    /**
     * Change password
     * @param {string} userId - User ID
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Updated user
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Verify current password
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                throw new Error('Current password is incorrect');
            }

            // Hash new password
            const salt = await bcrypt.genSalt(config.password.saltRounds);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            return user;
        } catch (error) {
            logger.logError('Password change error:', error);
            throw error;
        }
    }

    /**
     * Logout user
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    async logout(userId) {
        try {
            // In a real application, you might want to invalidate the refresh token
            // or add it to a blacklist
            logger.logInfo('User logged out successfully', { userId });
        } catch (error) {
            logger.logError('Logout error:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();

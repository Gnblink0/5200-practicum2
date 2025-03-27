const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validation');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile (own profile)
 * @access  Private
 */
router.get('/profile', authMiddleware.verifyToken, userController.getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', 
    authMiddleware.verifyToken, 
    validationMiddleware.validateUserProfile, 
    userController.updateUserProfile
);

/**
 * @route   PUT /api/users/avatar
 * @desc    Update user avatar
 * @access  Private
 */
router.put('/avatar', authMiddleware.verifyToken, userController.updateAvatar);

/**
 * @route   GET /api/users/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', authMiddleware.verifyToken, userController.getUserNotifications);

/**
 * @route   PUT /api/users/notifications/:id
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:id', authMiddleware.verifyToken, userController.markNotificationAsRead);

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', 
    authMiddleware.verifyToken, 
    validationMiddleware.validateUserPreferences, 
    userController.updateUserPreferences
);

/**
 * @route   GET /api/users/activity
 * @desc    Get user activity log
 * @access  Private
 */
router.get('/activity', authMiddleware.verifyToken, userController.getUserActivity);

/**
 * @route   PUT /api/users/2fa
 * @desc    Enable/disable two-factor authentication
 * @access  Private
 */
router.put('/2fa', authMiddleware.verifyToken, userController.toggleTwoFactorAuth);

/**
 * @route   POST /api/users/2fa/verify
 * @desc    Verify two-factor authentication code
 * @access  Private
 */
router.post('/2fa/verify', 
    authMiddleware.verifyToken, 
    validationMiddleware.validate2FACode, 
    userController.verify2FACode
);

module.exports = router;

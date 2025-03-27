// adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validation');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard data
 * @access  Private (Admin only)
 */
router.get('/dashboard', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getDashboard
);

/**
 * @route   GET /api/admin/statistics
 * @desc    Get system statistics
 * @access  Private (Admin only)
 */
router.get('/statistics', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getStatistics
);

/**
 * @route   GET /api/admin/statistics/daily
 * @desc    Get daily statistics
 * @access  Private (Admin only)
 */
router.get('/statistics/daily', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getDailyStatistics
);

/**
 * @route   GET /api/admin/statistics/monthly
 * @desc    Get monthly statistics
 * @access  Private (Admin only)
 */
router.get('/statistics/monthly', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getMonthlyStatistics
);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/users', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getAllUsers
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/users/:id', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getUserById
);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post('/users', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    validationMiddleware.validateUser, 
    adminController.createUser
);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private (Admin only)
 */
router.put('/users/:id', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    validationMiddleware.validateUser, 
    adminController.updateUser
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/users/:id', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.deleteUser
);

/**
 * @route   GET /api/admin/doctors
 * @desc    Get all doctors
 * @access  Private (Admin only)
 */
router.get('/doctors', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getAllDoctors
);

/**
 * @route   GET /api/admin/patients
 * @desc    Get all patients
 * @access  Private (Admin only)
 */
router.get('/patients', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getAllPatients
);

/**
 * @route   GET /api/admin/settings
 * @desc    Get system settings
 * @access  Private (Admin only)
 */
router.get('/settings', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getSettings
);

/**
 * @route   PUT /api/admin/settings
 * @desc    Update system settings
 * @access  Private (Admin only)
 */
router.put('/settings', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    validationMiddleware.validateSettings, 
    adminController.updateSettings
);

/**
 * @route   GET /api/admin/logs
 * @desc    Get system logs
 * @access  Private (Admin only)
 */
router.get('/logs', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getLogs
);

/**
 * @route   GET /api/admin/logs/:type
 * @desc    Get logs by type (error, access, etc)
 * @access  Private (Admin only)
 */
router.get('/logs/:type', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getLogsByType
);

/**
 * @route   DELETE /api/admin/logs
 * @desc    Clear logs
 * @access  Private (Admin only)
 */
router.delete('/logs', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.clearLogs
);

/**
 * @route   GET /api/admin/appointments
 * @desc    Get all appointments
 * @access  Private (Admin only)
 */
router.get('/appointments', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getAllAppointments
);

/**
 * @route   GET /api/admin/prescriptions
 * @desc    Get all prescriptions
 * @access  Private (Admin only)
 */
router.get('/prescriptions', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getAllPrescriptions
);

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments
 * @access  Private (Admin only)
 */
router.get('/payments', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getAllPayments
);

/**
 * @route   POST /api/admin/backup
 * @desc    Create system backup
 * @access  Private (Admin only)
 */
router.post('/backup', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.createBackup
);

/**
 * @route   GET /api/admin/backup
 * @desc    Get system backups
 * @access  Private (Admin only)
 */
router.get('/backup', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.getBackups
);

/**
 * @route   POST /api/admin/restore/:backupId
 * @desc    Restore system from backup
 * @access  Private (Admin only)
 */
router.post('/restore/:backupId', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    adminController.restoreBackup
);

module.exports = router;
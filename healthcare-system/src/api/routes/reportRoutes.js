const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validation');

/**
 * @route   GET /api/reports/admin
 * @desc    Generate admin reports (admin only)
 * @access  Private (Admin only)
 */
router.get('/admin', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    reportController.generateAdminReport
);

/**
 * @route   GET /api/reports/doctor/:doctorId
 * @desc    Generate doctor performance reports (admin and the doctor)
 * @access  Private
 */
router.get('/doctor/:doctorId', 
    authMiddleware.verifyToken, 
    reportController.generateDoctorReport
);

/**
 * @route   GET /api/reports/patient/:patientId
 * @desc    Generate patient health reports (accessible by patient and their doctors)
 * @access  Private
 */
router.get('/patient/:patientId', 
    authMiddleware.verifyToken, 
    reportController.generatePatientReport
);

/**
 * @route   GET /api/reports/financial
 * @desc    Generate financial reports (admin only)
 * @access  Private (Admin only)
 */
router.get('/financial', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    reportController.generateFinancialReport
);

/**
 * @route   GET /api/reports/appointments
 * @desc    Generate appointment statistics
 * @access  Private (Admin only)
 */
router.get('/appointments', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    reportController.generateAppointmentStats
);

/**
 * @route   GET /api/reports/:reportId/pdf
 * @desc    Export report to PDF
 * @access  Private
 */
router.get('/:reportId/pdf', 
    authMiddleware.verifyToken, 
    reportController.exportReportToPdf
);

/**
 * @route   GET /api/reports/:reportId/csv
 * @desc    Export report to CSV
 * @access  Private
 */
router.get('/:reportId/csv', 
    authMiddleware.verifyToken, 
    reportController.exportReportToCsv
);

/**
 * @route   POST /api/reports/schedule
 * @desc    Schedule periodic reports
 * @access  Private (Admin only)
 */
router.post('/schedule', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    validationMiddleware.validateReportSchedule, 
    reportController.scheduleReport
);

/**
 * @route   GET /api/reports/scheduled
 * @desc    Get scheduled reports
 * @access  Private (Admin only)
 */
router.get('/scheduled', 
    authMiddleware.verifyToken, 
    roleMiddleware.isAdmin, 
    reportController.getScheduledReports
);

module.exports = router;

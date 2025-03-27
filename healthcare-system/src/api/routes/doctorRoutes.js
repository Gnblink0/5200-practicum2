const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validation');

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors (public route with limited info)
 * @access  Public
 */
router.get('/', doctorController.getAllDoctors);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor by ID (public route with limited info)
 * @access  Public
 */
router.get('/:id', doctorController.getDoctorById);

/**
 * @route   GET /api/doctors/profile
 * @desc    Get doctor profile (private - own profile)
 * @access  Private (Doctor only)
 */
router.get('/profile', 
    authMiddleware.verifyToken, 
    roleMiddleware.isDoctor, 
    doctorController.getDoctorProfile
);

/**
 * @route   PUT /api/doctors/profile
 * @desc    Update doctor profile
 * @access  Private (Doctor only)
 */
router.put('/profile', 
    authMiddleware.verifyToken, 
    roleMiddleware.isDoctor, 
    validationMiddleware.validateDoctorProfile, 
    doctorController.updateDoctorProfile
);

/**
 * @route   GET /api/doctors/appointments
 * @desc    Get doctor's appointments
 * @access  Private (Doctor only)
 */
router.get('/appointments', 
    authMiddleware.verifyToken, 
    roleMiddleware.isDoctor, 
    doctorController.getDoctorAppointments
);

/**
 * @route   GET /api/doctors/schedule
 * @desc    Get doctor's schedule
 * @access  Private (Doctor only)
 */
router.get('/schedule', 
    authMiddleware.verifyToken, 
    roleMiddleware.isDoctor, 
    doctorController.getDoctorSchedule
);

/**
 * @route   PUT /api/doctors/schedule
 * @desc    Update doctor's schedule
 * @access  Private (Doctor only)
 */
router.put('/schedule', 
    authMiddleware.verifyToken, 
    roleMiddleware.isDoctor, 
    validationMiddleware.validateSchedule, 
    doctorController.updateDoctorSchedule
);

/**
 * @route   GET /api/doctors/patients
 * @desc    Get doctor's patients
 * @access  Private (Doctor only)
 */
router.get('/patients', 
    authMiddleware.verifyToken, 
    roleMiddleware.isDoctor, 
    doctorController.getDoctorPatients
);

/**
 * @route   POST /api/doctors/specializations
 * @desc    Add specialization
 * @access  Private (Doctor only)
 */
router.post('/specializations', 
    authMiddleware.verifyToken, 
    roleMiddleware.isDoctor, 
    doctorController.addSpecialization
);

/**
 * @route   GET /api/doctors/:id/reviews
 * @desc    Get doctor's reviews
 * @access  Public
 */
router.get('/:id/reviews', doctorController.getDoctorReviews);

module.exports = router;

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validation');

/**
 * @route   GET /api/patients/profile
 * @desc    Get patient profile (private - own profile)
 * @access  Private (Patient only)
 */
router.get('/profile', 
    authMiddleware.verifyToken, 
    roleMiddleware.isPatient, 
    patientController.getPatientProfile
);

/**
 * @route   PUT /api/patients/profile
 * @desc    Update patient profile
 * @access  Private (Patient only)
 */
router.put('/profile', 
    authMiddleware.verifyToken, 
    roleMiddleware.isPatient, 
    validationMiddleware.validatePatientProfile, 
    patientController.updatePatientProfile
);

/**
 * @route   GET /api/patients/appointments
 * @desc    Get patient appointments
 * @access  Private (Patient only)
 */
router.get('/appointments', 
    authMiddleware.verifyToken, 
    roleMiddleware.isPatient, 
    patientController.getPatientAppointments
);

/**
 * @route   GET /api/patients/medical-records
 * @desc    Get patient medical records
 * @access  Private (Patient only)
 */
router.get('/medical-records', 
    authMiddleware.verifyToken, 
    roleMiddleware.isPatient, 
    patientController.getPatientMedicalRecords
);

/**
 * @route   GET /api/patients/prescriptions
 * @desc    Get patient prescriptions
 * @access  Private (Patient only)
 */
router.get('/prescriptions', 
    authMiddleware.verifyToken, 
    roleMiddleware.isPatient, 
    patientController.getPatientPrescriptions
);

/**
 * @route   GET /api/patients/invoices
 * @desc    Get patient invoices
 * @access  Private (Patient only)
 */
router.get('/invoices', 
    authMiddleware.verifyToken, 
    roleMiddleware.isPatient, 
    patientController.getPatientInvoices
);

/**
 * @route   POST /api/patients/medical-history
 * @desc    Add patient medical history
 * @access  Private (Patient only)
 */
router.post('/medical-history', 
    authMiddleware.verifyToken, 
    roleMiddleware.isPatient, 
    validationMiddleware.validateMedicalHistory, 
    patientController.addMedicalHistory
);

/**
 * @route   PUT /api/patients/emergency-contact
 * @desc    Update patient emergency contact
 * @access  Private (Patient only)
 */
router.put('/emergency-contact', 
    authMiddleware.verifyToken, 
    roleMiddleware.isPatient, 
    validationMiddleware.validateEmergencyContact, 
    patientController.updateEmergencyContact
);

/**
 * @route   POST /api/patients/reviews
 * @desc    Submit a review for a doctor
 * @access  Private (Patient only)
 */
router.post('/reviews', 
    authMiddleware.verifyToken, 
    roleMiddleware.isPatient, 
    validationMiddleware.validateReview, 
    patientController.submitReview
);

module.exports = router;

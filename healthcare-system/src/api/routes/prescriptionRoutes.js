const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validation');

/**
 * @route   POST /api/prescriptions
 * @desc    Create a new prescription (doctor only)
 * @access  Private (Doctor only)
 */
router.post('/', 
    authMiddleware.verifyToken, 
    roleMiddleware.isDoctor, 
    validationMiddleware.validatePrescription, 
    prescriptionController.createPrescription
);

/**
 * @route   GET /api/prescriptions/:id
 * @desc    Get prescription by ID
 * @access  Private
 */
router.get('/:id', authMiddleware.verifyToken, prescriptionController.getPrescriptionById);

/**
 * @route   PUT /api/prescriptions/:id
 * @desc    Update prescription (doctor only)
 * @access  Private (Doctor only)
 */
router.put('/:id', 
    authMiddleware.verifyToken, 
    roleMiddleware.isDoctor, 
    validationMiddleware.validatePrescription, 
    prescriptionController.updatePrescription
);

/**
 * @route   GET /api/prescriptions/patient/:patientId
 * @desc    Get prescriptions by patient
 * @access  Private
 */
router.get('/patient/:patientId', 
    authMiddleware.verifyToken, 
    prescriptionController.getPatientPrescriptions
);

/**
 * @route   GET /api/prescriptions/doctor
 * @desc    Get prescriptions by doctor
 * @access  Private (Doctor only)
 */
router.get('/doctor', 
    authMiddleware.verifyToken, 
    roleMiddleware.isDoctor, 
    prescriptionController.getDoctorPrescriptions
);

/**
 * @route   PUT /api/prescriptions/:id/fill
 * @desc    Mark prescription as filled (pharmacy role)
 * @access  Private (Pharmacy only)
 */
router.put('/:id/fill', 
    authMiddleware.verifyToken, 
    roleMiddleware.isPharmacy, 
    prescriptionController.fillPrescription
);

/**
 * @route   GET /api/prescriptions/:id/pdf
 * @desc    Generate prescription PDF
 * @access  Private
 */
router.get('/:id/pdf', authMiddleware.verifyToken, prescriptionController.generatePrescriptionPdf);

/**
 * @route   POST /api/prescriptions/:id/send
 * @desc    Send prescription to pharmacy
 * @access  Private
 */
router.post('/:id/send', 
    authMiddleware.verifyToken, 
    validationMiddleware.validatePharmacySubmission, 
    prescriptionController.sendToPharmacy
);

/**
 * @route   PUT /api/prescriptions/:id/cancel
 * @desc    Cancel prescription
 * @access  Private (Doctor only)
 */
router.put('/:id/cancel', 
    authMiddleware.verifyToken, 
    roleMiddleware.isDoctor, 
    prescriptionController.cancelPrescription
);

module.exports = router;

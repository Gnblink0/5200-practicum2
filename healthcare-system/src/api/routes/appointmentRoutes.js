const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const validationMiddleware = require('../middleware/validation');

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments (filtered by permissions)
 * @access  Private
 */
router.get('/', authMiddleware.verifyToken, appointmentController.getAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get appointment by ID
 * @access  Private
 */
router.get('/:id', authMiddleware.verifyToken, appointmentController.getAppointmentById);

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Private
 */
router.post('/', 
    authMiddleware.verifyToken, 
    validationMiddleware.validateAppointment, 
    appointmentController.createAppointment
);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update an appointment
 * @access  Private
 */
router.put('/:id', 
    authMiddleware.verifyToken, 
    validationMiddleware.validateAppointment, 
    appointmentController.updateAppointment
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete an appointment
 * @access  Private
 */
router.delete('/:id', authMiddleware.verifyToken, appointmentController.deleteAppointment);

/**
 * @route   PUT /api/appointments/:id/confirm
 * @desc    Confirm an appointment
 * @access  Private
 */
router.put('/:id/confirm', authMiddleware.verifyToken, appointmentController.confirmAppointment);

/**
 * @route   PUT /api/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Private
 */
router.put('/:id/cancel', authMiddleware.verifyToken, appointmentController.cancelAppointment);

/**
 * @route   PUT /api/appointments/:id/reschedule
 * @desc    Reschedule an appointment
 * @access  Private
 */
router.put('/:id/reschedule', 
    authMiddleware.verifyToken, 
    validationMiddleware.validateReschedule, 
    appointmentController.rescheduleAppointment
);

/**
 * @route   GET /api/appointments/slots/:doctorId/:date
 * @desc    Get available time slots for a doctor on a specific date
 * @access  Private
 */
router.get('/slots/:doctorId/:date', authMiddleware.verifyToken, appointmentController.getAvailableSlots);

/**
 * @route   GET /api/appointments/doctor/:doctorId
 * @desc    Get appointments by doctor
 * @access  Private
 */
router.get('/doctor/:doctorId', authMiddleware.verifyToken, appointmentController.getAppointmentsByDoctor);

/**
 * @route   GET /api/appointments/patient/:patientId
 * @desc    Get appointments by patient
 * @access  Private
 */
router.get('/patient/:patientId', authMiddleware.verifyToken, appointmentController.getAppointmentsByPatient);

module.exports = router;

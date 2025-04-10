const express = require('express');
const router = express.Router();
const {
    getTopDoctorsByAppointments,
    getPatientAppointmentHistory,
    getAverageAppointmentDurationBySpecialization,
    getPrescriptionsIssuedPerMonth,
    getPendingDoctorsWithAppointments
} = require('../controllers/aggregationController');

// Import authentication middleware (assuming you have one, adjust path as needed)
// const { protect, authorize } = require('../middleware/auth'); 
// const isAdmin = authorize('Admin'); // Example: Middleware to check if user is Admin

// Apply middleware if needed, e.g., protect, isAdmin
// router.use(protect); 
// router.use(isAdmin); 

// --- Aggregation Routes --- //

// GET /api/v1/aggregate/stats/top-doctors
router.get('/stats/top-doctors', getTopDoctorsByAppointments);

// GET /api/v1/aggregate/patients/:patientId/appointment-history 
// Note: Access control might be needed here depending on who can view whose history
router.get('/patients/:patientId/appointment-history', getPatientAppointmentHistory);

// GET /api/v1/aggregate/stats/avg-appointment-duration
router.get('/stats/avg-appointment-duration', getAverageAppointmentDurationBySpecialization);

// GET /api/v1/aggregate/stats/prescriptions-by-month
router.get('/stats/prescriptions-by-month', getPrescriptionsIssuedPerMonth);

// GET /api/v1/aggregate/admin/pending-doctors-appointments
router.get('/admin/pending-doctors-appointments', getPendingDoctorsWithAppointments);

module.exports = router; 
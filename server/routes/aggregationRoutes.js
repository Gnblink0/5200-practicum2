const express = require('express');
const router = express.Router();
const {
    getTopDoctorsByAppointments,
    getPatientAppointmentHistory,
    getAverageAppointmentDurationBySpecialization,
    getPrescriptionsIssuedPerMonth,
    getAppointmentCountByStatus,
    getAppointmentStatusTimeSeries,
    getAppointmentHeatmapData
} = require('../controllers/aggregationController');

// GET /api/v1/aggregate/stats/top-doctors
router.get('/stats/top-doctors', getTopDoctorsByAppointments);

// GET /api/v1/aggregate/patients/appointment-history?username=xxx
// Note: Access control might be needed here depending on who can view whose history
router.get('/patients/appointment-history', getPatientAppointmentHistory);

// GET /api/v1/aggregate/stats/avg-appointment-duration
router.get('/stats/avg-appointment-duration', getAverageAppointmentDurationBySpecialization);

// GET /api/v1/aggregate/stats/prescriptions-by-month
router.get('/stats/prescriptions-by-month', getPrescriptionsIssuedPerMonth);

// GET /api/v1/aggregate/stats/appointment-counts
router.get('/stats/appointment-counts', getAppointmentCountByStatus);

// GET /api/v1/aggregate/stats/appointment-time-series
router.get('/stats/appointment-time-series', getAppointmentStatusTimeSeries);

// GET /api/v1/aggregate/stats/appointment-heatmap
router.get('/stats/appointment-heatmap', getAppointmentHeatmapData);

// GET /api/v1/aggregate/admin/pending-doctors-appointments - REMOVED
// router.get('/admin/pending-doctors-appointments', getPendingDoctorsWithAppointments);

module.exports = router; 
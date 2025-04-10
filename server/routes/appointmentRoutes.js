const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getAppointments,
  getDoctorAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAllAppointments,
} = require("../controllers/appointmentController");

// Get doctor's appointments (specific route for doctors)
router.get("/doctor/appointments", auth, getDoctorAppointments);
// Alternative route for doctor's appointments
router.get("/doctors/appointments", auth, getDoctorAppointments);

// Get appointments for a user (doctor or patient)
router.get("/:role/:userId", auth, getAppointments);

// Get all appointments (admin only)
router.get("/all", auth, getAllAppointments);

// Create a new appointment
router.post("/", auth, createAppointment);

// Update an appointment
router.put("/:id", auth, updateAppointment);

// Delete an appointment
router.delete("/:id", auth, deleteAppointment);

module.exports = router;

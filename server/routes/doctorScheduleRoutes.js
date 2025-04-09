const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getAvailableSlots
} = require("../controllers/doctorScheduleController");

// Get doctor's schedules (doctor only)
router.get("/", auth, getSchedules);

// Get available time slots for a specific doctor (public)
router.get("/doctor/:doctorId/available", getAvailableSlots);

// Create a new schedule (doctor only)
router.post("/", auth, createSchedule);

// Update a schedule (doctor only)
router.put("/:id", auth, updateSchedule);

// Delete a schedule (doctor only)
router.delete("/:id", auth, deleteSchedule);

module.exports = router;

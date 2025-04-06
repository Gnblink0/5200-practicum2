const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Doctor = require("../models/Doctor");
const DoctorSchedule = require("../models/DoctorSchedule");
const Appointment = require("../models/Appointment");

// Get all doctors
router.get("/", auth, async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor by ID
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select("firstName lastName email specialization");
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update doctor profile
router.put("/profile", auth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ uid: req.user.uid });
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ["firstName", "lastName", "phone", "address", "specialization"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid updates!" });
    }

    updates.forEach((update) => (doctor[update] = req.body[update]));
    await doctor.save();

    res.json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check doctor's availability
router.post("/:id/check-availability", auth, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const doctorId = req.params.id;

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Find doctor's schedule for this time period
    const schedule = await DoctorSchedule.findOne({
      doctorId,
      startTime: { $lte: new Date(startTime) },
      endTime: { $gte: new Date(endTime) },
      isAvailable: true,
    });

    if (!schedule) {
      return res.status(400).json({ error: "Selected time is not within doctor's available schedule" });
    }

    // Check for existing appointments in this time slot
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) }
        }
      ],
      status: { $in: ["pending", "confirmed"] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ error: "Doctor already has an appointment during this time" });
    }

    res.json({ available: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor schedules
router.get("/:id/schedules", auth, async (req, res) => {
  try {
    const schedules = await DoctorSchedule.find({
      doctorId: req.params.id,
      endTime: { $gte: new Date() }
    }).sort({ startTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create doctor schedule
router.post("/:id/schedules", auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Verify that the authenticated user is the doctor
    if (doctor.uid !== req.user.uid) {
      return res.status(403).json({ error: "Not authorized to create schedules for this doctor" });
    }

    const { startTime, endTime, isRecurring } = req.body;

    // Validate time range
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    // Check for overlapping schedules
    const overlappingSchedule = await DoctorSchedule.findOne({
      doctorId: req.params.id,
      $or: [
        {
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) }
        }
      ]
    });

    if (overlappingSchedule) {
      return res.status(400).json({ error: "Schedule overlaps with existing schedule" });
    }

    const schedule = new DoctorSchedule({
      doctorId: req.params.id,
      startTime,
      endTime,
      isRecurring
    });

    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete doctor schedule
router.delete("/:id/schedules/:scheduleId", auth, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Verify that the authenticated user is the doctor
    if (doctor.uid !== req.user.uid) {
      return res.status(403).json({ error: "Not authorized to delete schedules for this doctor" });
    }

    const schedule = await DoctorSchedule.findOneAndDelete({
      _id: req.params.scheduleId,
      doctorId: req.params.id
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
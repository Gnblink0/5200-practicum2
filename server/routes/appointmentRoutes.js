const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");

// Create a new appointment
router.post("/", auth, async (req, res) => {
  try {
    // Check if user is a patient
    const patient = await Patient.findOne({ uid: req.user.uid });
    if (!patient) {
      return res.status(403).json({ error: "Only patients can create appointments" });
    }

    const appointment = new Appointment({
      ...req.body,
      patientId: patient._id
    });

    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all appointments (for admin)
router.get("/", auth, async (req, res) => {
  try {
    // Check if user is admin
    const admin = await Admin.findOne({ uid: req.user.uid });
    if (!admin) {
      return res.status(403).json({ error: "Only admins can view all appointments" });
    }

    const appointments = await Appointment.find()
      .populate("patientId", "firstName lastName email")
      .populate("doctorId", "firstName lastName email specialization");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single appointment
router.get("/:id", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "firstName lastName email")
      .populate("doctorId", "firstName lastName email specialization");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check if user is authorized to view this appointment
    const patient = await Patient.findOne({ uid: req.user.uid });
    const doctor = await Doctor.findOne({ uid: req.user.uid });
    const admin = await Admin.findOne({ uid: req.user.uid });

    if (!admin && 
        (!patient || patient._id.toString() !== appointment.patientId.toString()) && 
        (!doctor || doctor._id.toString() !== appointment.doctorId.toString())) {
      return res.status(403).json({ error: "Not authorized to view this appointment" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update appointment status
router.put("/:id", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check if user is authorized to update this appointment
    const doctor = await Doctor.findOne({ uid: req.user.uid });
    const admin = await Admin.findOne({ uid: req.user.uid });

    if (!admin && (!doctor || doctor._id.toString() !== appointment.doctorId.toString())) {
      return res.status(403).json({ error: "Not authorized to update this appointment" });
    }

    // Only allow updating status and notes
    if (req.body.status) appointment.status = req.body.status;
    if (req.body.notes) appointment.notes = req.body.notes;

    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get appointments for a specific doctor
router.get("/doctor/:doctorId", auth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ uid: req.user.uid });
    if (!doctor || doctor._id.toString() !== req.params.doctorId) {
      return res.status(403).json({ error: "Not authorized to view these appointments" });
    }

    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .populate("patientId", "firstName lastName email")
      .sort({ startTime: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointments for a specific patient
router.get("/patient/:patientId", auth, async (req, res) => {
  try {
    const patient = await Patient.findOne({ uid: req.user.uid });
    if (!patient || patient._id.toString() !== req.params.patientId) {
      return res.status(403).json({ error: "Not authorized to view these appointments" });
    }

    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .populate("doctorId", "firstName lastName email specialization")
      .sort({ startTime: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
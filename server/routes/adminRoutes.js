const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Admin = require("../models/Admin");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");

// Public test route to view all data (for development only)
router.get("/public-test/all-data", async (req, res) => {
  try {
    const admins = await Admin.find({});
    const doctors = await Doctor.find({});
    const patients = await Patient.find({});
    const appointments = await Appointment.find({})
      .populate("patientId", "firstName lastName email")
      .populate("doctorId", "firstName lastName email specialization");
    const prescriptions = await Prescription.find({})
      .populate("patientId", "firstName lastName email")
      .populate("doctorId", "firstName lastName email specialization");

    res.json({
      admins: admins.map(admin => ({
        email: admin.email,
        name: `${admin.firstName} ${admin.lastName}`,
        role: "Admin"
      })),
      doctors: doctors.map(doctor => ({
        email: doctor.email,
        name: `${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization,
        role: "Doctor"
      })),
      patients: patients.map(patient => ({
        email: patient.email,
        name: `${patient.firstName} ${patient.lastName}`,
        role: "Patient"
      })),
      appointments: appointments.map(apt => ({
        patient: `${apt.patientId?.firstName} ${apt.patientId?.lastName}`,
        doctor: `${apt.doctorId?.firstName} ${apt.doctorId?.lastName}`,
        startTime: apt.startTime,
        status: apt.status
      })),
      prescriptions: prescriptions.map(pres => ({
        patient: `${pres.patientId?.firstName} ${pres.patientId?.lastName}`,
        doctor: `${pres.doctorId?.firstName} ${pres.doctorId?.lastName}`,
        medications: pres.medications,
        status: pres.status
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all admins
router.get("/", auth, async (req, res) => {
  try {
    const admins = await Admin.find({});
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single admin
router.get("/:id", auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update admin permissions
router.put("/:id/permissions", auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.permissions = req.body.permissions;
    admin.activityLog.push({
      action: "permissions_updated",
      timestamp: new Date(),
      details: { updatedBy: req.user._id },
    });

    await admin.save();
    res.json(admin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update admin status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.isActive = req.body.isActive;
    admin.activityLog.push({
      action: req.body.isActive ? "account_activated" : "account_deactivated",
      timestamp: new Date(),
      details: { updatedBy: req.user._id },
    });

    await admin.save();
    res.json(admin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;

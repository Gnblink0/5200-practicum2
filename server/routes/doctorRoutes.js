const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getDoctors, getDoctorById, getPendingDoctors, verifyDoctor } = require("../controllers/doctorController");

// Get all doctors
router.get("/", auth, getDoctors);

// Get doctor by ID
router.get("/:id", auth, getDoctorById);

// Get pending verification doctors (Admin only)
router.get("/verification/pending", auth, getPendingDoctors);

// Verify doctor (Admin only)
router.post("/verification/:doctorId", auth, verifyDoctor);

module.exports = router;

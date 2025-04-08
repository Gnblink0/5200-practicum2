const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getDoctors, getDoctorById } = require("../controllers/doctorController");

// Get all doctors
router.get("/", auth, getDoctors);

// Get doctor by ID
router.get("/:id", auth, getDoctorById);

module.exports = router;

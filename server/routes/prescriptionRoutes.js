const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription
} = require("../controllers/prescriptionController");

// Get prescriptions for a user (doctor or patient)
router.get("/:role/:userId", auth, getPrescriptions);

// Create a new prescription
router.post("/", auth, createPrescription);

// Update a prescription
router.put("/:id", auth, updatePrescription);

// Delete a prescription
router.delete("/:id", auth, deletePrescription);

module.exports = router; 
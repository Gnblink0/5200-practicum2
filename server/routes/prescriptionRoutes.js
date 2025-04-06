const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Prescription = require("../models/Prescription");

// Get prescriptions for a specific user (patient or doctor)
router.get("/:role/:userId", auth, async (req, res) => {
  try {
    const { role, userId } = req.params;
    let query;

    if (role === "patient") {
      query = { patientId: userId };
    } else if (role === "doctor") {
      query = { doctorId: userId };
    } else {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const prescriptions = await Prescription.find(query)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName")
      .sort({ issuedDate: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new prescription
router.post("/", auth, async (req, res) => {
  try {
    const prescription = new Prescription({
      ...req.body,
      status: "active",
      issuedDate: new Date(),
    });

    await prescription.save();
    
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName");

    res.status(201).json(populatedPrescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a prescription
router.put("/:id", auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ["medications", "diagnosis", "status", "expiryDate"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid updates!" });
    }

    updates.forEach((update) => (prescription[update] = req.body[update]));
    await prescription.save();

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate("patientId", "firstName lastName")
      .populate("doctorId", "firstName lastName");

    res.json(populatedPrescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 
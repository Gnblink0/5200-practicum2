const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");

// Get prescriptions for a user (doctor or patient)
const getPrescriptions = async (req, res) => {
  try {
    const { role, userId } = req.params;
    let query = {};

    if (role === "Doctor") {
      query = { doctorId: userId };
    } else if (role === "Patient") {
      query = { patientId: userId };
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    const prescriptions = await Prescription.find(query)
      .populate("doctorId", "firstName lastName specialization")
      .populate("patientId", "firstName lastName")
      .populate("appointmentId")
      .sort({ issuedDate: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new prescription
const createPrescription = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res.status(403).json({ error: "Only doctors can create prescriptions" });
    }

    const { appointmentId, medications, instructions } = req.body;

    // Verify the appointment exists and belongs to the doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found or unauthorized" });
    }

    const prescription = new Prescription({
      doctorId: req.user._id,
      patientId: appointment.patientId,
      appointmentId: appointment._id,
      medications,
      instructions,
      issuedDate: new Date(),
      status: "active"
    });

    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a prescription
const updatePrescription = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res.status(403).json({ error: "Only doctors can update prescriptions" });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    if (prescription.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this prescription" });
    }

    Object.assign(prescription, req.body);
    await prescription.save();
    res.json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a prescription
const deletePrescription = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res.status(403).json({ error: "Only doctors can delete prescriptions" });
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    if (prescription.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this prescription" });
    }

    await prescription.remove();
    res.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription
}; 
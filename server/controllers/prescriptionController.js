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
      .populate({
        path: "patientId",
        select: "firstName lastName email"
      })
      .populate({
        path: "doctorId",
        select: "firstName lastName specialization"
      })
      .populate({
        path: "appointmentId",
        select: "startTime endTime reason mode status"
      })
      .sort({ issuedDate: -1 });

    // Transform the data to include patient and doctor names
    const transformedPrescriptions = prescriptions.map(prescription => ({
      ...prescription.toObject(),
      patient: prescription.patientId,
      doctor: prescription.doctorId
    }));

    res.json(transformedPrescriptions);
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

    const { appointmentId, medications, diagnosis, expiryDate } = req.body;

    if (!appointmentId || !medications || !diagnosis || !expiryDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify the appointment exists and belongs to the doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: req.user._id,
      status: 'confirmed'
    }).populate('patientId');

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found or unauthorized" });
    }

    // Validate expiry date
    const expiry = new Date(expiryDate);
    if (expiry <= new Date()) {
      return res.status(400).json({ error: "Expiry date must be in the future" });
    }

    const prescription = new Prescription({
      doctorId: req.user._id,
      patientId: appointment.patientId._id,
      appointmentId: appointment._id,
      medications,
      diagnosis,
      issuedDate: new Date(),
      expiryDate: expiry,
      status: "active"
    });

    await prescription.save();

    // Populate the prescription with patient and doctor info before sending response
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate({
        path: "patientId",
        select: "firstName lastName email"
      })
      .populate({
        path: "doctorId",
        select: "firstName lastName specialization"
      })
      .populate({
        path: "appointmentId",
        select: "startTime endTime reason mode status"
      });

    // Transform the data to include patient and doctor names
    const transformedPrescription = {
      ...populatedPrescription.toObject(),
      patient: populatedPrescription.patientId,
      doctor: populatedPrescription.doctorId
    };

    res.status(201).json(transformedPrescription);
  } catch (error) {
    console.error("Error in createPrescription:", error);
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

    // Populate the prescription with patient and doctor info before sending response
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate({
        path: "patientId",
        select: "firstName lastName email"
      })
      .populate({
        path: "doctorId",
        select: "firstName lastName specialization"
      })
      .populate({
        path: "appointmentId",
        select: "startTime endTime reason mode status"
      });

    // Transform the data to include patient and doctor names
    const transformedPrescription = {
      ...populatedPrescription.toObject(),
      patient: populatedPrescription.patientId,
      doctor: populatedPrescription.doctorId
    };

    res.json(transformedPrescription);
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
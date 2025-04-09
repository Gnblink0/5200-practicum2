const mongoose = require("mongoose");
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
        select: "firstName lastName email",
      })
      .populate({
        path: "doctorId",
        select: "firstName lastName specialization",
      })
      .populate({
        path: "appointmentId",
        select: "startTime endTime reason mode status",
      })
      .sort({ issuedDate: -1 });

    // Transform the data to include patient and doctor names
    const transformedPrescriptions = prescriptions.map((prescription) => ({
      ...prescription.toObject(),
      patient: prescription.patientId,
      doctor: prescription.doctorId,
    }));

    res.json(transformedPrescriptions);
  } catch (error) {
    console.error("Error in getPrescriptions:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new prescription with transaction
const createPrescription = async (req, res) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Starting prescription creation transaction");

    // Authorization check
    if (req.user.role !== "Doctor") {
      throw new Error("Only doctors can create prescriptions");
    }

    const { appointmentId, medications, diagnosis, expiryDate } = req.body;

    // Validation checks
    if (!appointmentId || !medications || !diagnosis || !expiryDate) {
      throw new Error("Missing required fields");
    }

    // Verify the appointment exists and belongs to the doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: req.user._id,
      status: "confirmed",
    })
      .populate("patientId")
      .session(session);

    if (!appointment) {
      throw new Error("Appointment not found or unauthorized");
    }

    console.log("Found valid appointment:", {
      appointmentId: appointment._id,
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId,
    });

    // Validate expiry date
    const expiry = new Date(expiryDate);
    if (expiry <= new Date()) {
      throw new Error("Expiry date must be in the future");
    }

    // Check if a prescription already exists for this appointment
    const existingPrescription = await Prescription.findOne({
      appointmentId: appointment._id,
    }).session(session);

    if (existingPrescription) {
      throw new Error("A prescription already exists for this appointment");
    }

    // Create and save the prescription
    const prescription = new Prescription({
      doctorId: req.user._id,
      patientId: appointment.patientId._id,
      appointmentId: appointment._id,
      medications,
      diagnosis,
      issuedDate: new Date(),
      expiryDate: expiry,
      status: "active",
    });

    await prescription.save({ session });

    // Update appointment hasPrescription flag without triggering validation
    await Appointment.findByIdAndUpdate(
      appointment._id,
      { hasPrescription: true },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    console.log("Prescription creation transaction committed successfully");

    // Populate the prescription with patient and doctor info before sending response
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate({
        path: "patientId",
        select: "firstName lastName email",
      })
      .populate({
        path: "doctorId",
        select: "firstName lastName specialization",
      })
      .populate({
        path: "appointmentId",
        select: "startTime endTime reason mode status",
      });

    // Transform the data to include patient and doctor names
    const transformedPrescription = {
      ...populatedPrescription.toObject(),
      patient: populatedPrescription.patientId,
      doctor: populatedPrescription.doctorId,
    };

    res.status(201).json(transformedPrescription);
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error("Error in createPrescription transaction:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(400).json({ error: error.message });
  } finally {
    // End session
    session.endSession();
  }
};

// Update a prescription with transaction
const updatePrescription = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Starting prescription update transaction");

    if (req.user.role !== "Doctor") {
      throw new Error("Only doctors can update prescriptions");
    }

    const prescription = await Prescription.findById(req.params.id).session(
      session
    );
    if (!prescription) {
      throw new Error("Prescription not found");
    }

    if (prescription.doctorId.toString() !== req.user._id.toString()) {
      throw new Error("Not authorized to update this prescription");
    }

    // Update prescription
    Object.assign(prescription, req.body);
    await prescription.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    console.log("Prescription update transaction committed successfully");

    // Populate the prescription with patient and doctor info before sending response
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate({
        path: "patientId",
        select: "firstName lastName email",
      })
      .populate({
        path: "doctorId",
        select: "firstName lastName specialization",
      })
      .populate({
        path: "appointmentId",
        select: "startTime endTime reason mode status",
      });

    // Transform the data to include patient and doctor names
    const transformedPrescription = {
      ...populatedPrescription.toObject(),
      patient: populatedPrescription.patientId,
      doctor: populatedPrescription.doctorId,
    };

    res.json(transformedPrescription);
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error("Error in updatePrescription transaction:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(400).json({ error: error.message });
  } finally {
    // End session
    session.endSession();
  }
};

// Delete a prescription with transaction
const deletePrescription = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("Starting prescription deletion transaction");

    if (req.user.role !== "Doctor") {
      throw new Error("Only doctors can delete prescriptions");
    }

    const prescription = await Prescription.findById(req.params.id).session(
      session
    );
    if (!prescription) {
      throw new Error("Prescription not found");
    }

    if (prescription.doctorId.toString() !== req.user._id.toString()) {
      throw new Error("Not authorized to delete this prescription");
    }

    // Update associated appointment
    await Appointment.findByIdAndUpdate(
      prescription.appointmentId,
      { hasPrescription: false },
      { session }
    );

    // Delete prescription using deleteOne instead of remove
    await Prescription.deleteOne({ _id: prescription._id }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    console.log("Prescription deletion transaction committed successfully");

    res.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error("Error in deletePrescription transaction:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(400).json({ error: error.message });
  } finally {
    // End session
    session.endSession();
  }
};

module.exports = {
  getPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
};

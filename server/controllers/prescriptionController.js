const mongoose = require("mongoose");
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const { ValidationError, TransactionError, AuthorizationError, ERROR_CODES } = require("../utils/errors");
const { validateMedication, validateDates } = require("../utils/validation");
const transactionLogger = require("../utils/transactionLogger");

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
  let transactionId;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Start transaction logging
    transactionId = transactionLogger.start('createPrescription', {
      doctorId: req.user._id,
      role: req.user.role
    });

    // Authorization check
    if (req.user.role !== "Doctor") {
      throw new AuthorizationError(
        "Only doctors can create prescriptions",
        { userId: req.user._id, role: req.user.role }
      );
    }

    const { appointmentId, medications, diagnosis, expiryDate } = req.body;

    // Validate required fields
    if (!appointmentId || !medications || !diagnosis || !expiryDate) {
      throw new ValidationError(
        "Missing required fields",
        { fields: { appointmentId, medications, diagnosis, expiryDate } }
      );
    }

    // Validate medications
    medications.forEach(validateMedication);

    // Verify the appointment exists and belongs to the doctor
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: req.user._id,
      status: "completed",
    })
      .populate("patientId")
      .session(session);

    if (!appointment) {
      throw new ValidationError(
        "Appointment not found, unauthorized, or not completed yet",
        { appointmentId, doctorId: req.user._id }
      );
    }

    // Validate dates
    validateDates(appointment.startTime, expiryDate);

    // Create and save the prescription with retry logic for concurrent transactions
    let retryCount = 0;
    const maxRetries = 3;
    let prescription;

    while (retryCount < maxRetries) {
      try {
        // Check if prescription already exists for this appointment
        const existingPrescription = await Prescription.findOne({
          appointmentId: appointment._id
        }).session(session);

        if (existingPrescription) {
          throw new ValidationError(
            "A prescription already exists for this appointment",
            { code: 'DUPLICATE_PRESCRIPTION' }
          );
        }

        prescription = new Prescription({
          doctorId: req.user._id,
          patientId: appointment.patientId._id,
          appointmentId: appointment._id,
          medications,
          diagnosis,
          issuedDate: appointment.startTime,
          expiryDate: new Date(expiryDate),
          status: "active",
        });

        await prescription.save({ session });

        // Update appointment hasPrescription flag
        await Appointment.findByIdAndUpdate(
          appointment._id,
          { hasPrescription: true },
          { session }
        );

        // If we get here, the transaction was successful
        break;
      } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
          throw new ValidationError(
            "A prescription already exists for this appointment",
            { code: 'DUPLICATE_PRESCRIPTION' }
          );
        }
        if (error.code === 112 && retryCount < maxRetries - 1) {
          // Write conflict, retry
          retryCount++;
          await session.abortTransaction();
          session.startTransaction();
          continue;
        }
        throw error;
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    
    // Log successful transaction
    transactionLogger.success(transactionId, {
      prescriptionId: prescription._id,
      appointmentId: appointment._id
    });

    // Populate and transform the prescription
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate("patientId", "firstName lastName email")
      .populate("doctorId", "firstName lastName email")
      .populate("appointmentId", "startTime endTime reason");

    res.status(201).json({
      success: true,
      data: populatedPrescription,
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    
    // Log error
    transactionLogger.error(transactionId, error);

    // Handle specific error types
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: error.message,
        code: error.context?.code || 'VALIDATION_ERROR'
      });
    } else if (error instanceof AuthorizationError) {
      res.status(403).json({
        success: false,
        error: error.message,
        code: 'AUTHORIZATION_ERROR'
      });
    } else if (error instanceof TransactionError) {
      res.status(409).json({
        success: false,
        error: error.message,
        code: 'TRANSACTION_ERROR'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'INTERNAL_ERROR'
      });
    }
  } finally {
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

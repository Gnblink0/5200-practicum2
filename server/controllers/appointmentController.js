const Appointment = require("../models/Appointment");
const DoctorSchedule = require("../models/DoctorSchedule");
const User = require("../models/User");
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

// Get doctor's appointments
const getDoctorAppointments = async (req, res) => {
  try {
    // Validate user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Validate user is a doctor
    if (req.user.role !== "Doctor") {
      return res
        .status(403)
        .json({ error: "Only doctors can access this endpoint" });
    }

    // Get appointments with proper error handling
    const appointments = await Appointment.find({ doctorId: req.user._id })
      .populate("doctorId", "firstName lastName specialization")
      .populate("patientId", "firstName lastName")
      .sort({ startTime: 1 })
      .catch((err) => {
        console.error("Database error:", err);
        throw new Error("Failed to fetch appointments");
      });

    if (!appointments) {
      return res.status(404).json({ error: "No appointments found" });
    }

    res.json(appointments);
  } catch (error) {
    console.error("Error in getDoctorAppointments:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get appointments for a user (doctor or patient)
const getAppointments = async (req, res) => {
  try {
    let query = {};

    // If role and userId are provided in params
    if (req.params.role && req.params.userId) {
      const { role, userId } = req.params;

      // Case-insensitive role comparison
      if (role.toLowerCase() === "doctor") {
        query = { doctorId: userId };
      } else if (role.toLowerCase() === "patient") {
        query = { patientId: userId };
      } else {
        return res.status(400).json({ error: "Invalid role" });
      }
    }
    // If no params provided, use the authenticated user's info
    else {
      if (req.user.role === "Doctor") {
        query = { doctorId: req.user._id };
      } else if (req.user.role === "Patient") {
        query = { patientId: req.user._id };
      } else {
        return res.status(403).json({ error: "Unauthorized access" });
      }
    }

    const appointments = await Appointment.find(query)
      .populate("doctorId", "firstName lastName specialization")
      .populate("patientId", "firstName lastName")
      .sort({ startTime: 1 });

    res.json(appointments);
  } catch (error) {
    console.error("Error in getAppointments:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new appointment
const createAppointment = async (req, res) => {
  const maxRetries = 3;
  let retryCount = 0;
  let lastError;

  while (retryCount < maxRetries) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (req.user.role !== "Patient") {
        await session.abortTransaction();
        return res
          .status(403)
          .json({ error: "Only patients can create appointments" });
      }

      const { doctorId, scheduleId, reason, mode } = req.body;

      if (!doctorId || !scheduleId || !reason) {
        await session.abortTransaction();
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if the doctor exists and is active
      const doctor = await User.findOne({
        _id: doctorId,
        role: "Doctor",
        isActive: true,
        isVerified: true,
      }).session(session);

      if (!doctor) {
        await session.abortTransaction();
        return res.status(404).json({
          error: "Doctor not found, inactive, or not verified",
          details: {
            doctorId,
            isActive: doctor?.isActive,
            isVerified: doctor?.isVerified,
          },
        });
      }

      // Check if the schedule exists and is available
      const schedule = await DoctorSchedule.findOneAndUpdate(
        {
          _id: scheduleId,
          doctorId,
          isAvailable: true,
        },
        { isAvailable: false },
        { new: true, session }
      );

      if (!schedule) {
        await session.abortTransaction();
        return res.status(400).json({
          error: "Time slot not available or has expired",
          details: {
            scheduleId,
            doctorId,
            isAvailable: false,
          },
        });
      }

      // Check if the time slot is in the future
      const now = new Date();
      const startTime = new Date(schedule.startTime);
      const endTime = new Date(schedule.endTime);

      if (startTime <= now) {
        await session.abortTransaction();
        return res.status(400).json({
          error: "Cannot book appointments in the past",
          details: {
            now: now.toISOString(),
            startTime: startTime.toISOString(),
          },
        });
      }

      if (startTime >= endTime) {
        await session.abortTransaction();
        return res.status(400).json({
          error: "Appointment time is not within doctor's available schedule",
        });
      }

      // Check if patient already has an appointment at this time
      const existingAppointment = await Appointment.findOne({
        patientId: req.user._id,
        status: { $ne: "cancelled" },
        $or: [
          {
            startTime: { $lt: schedule.endTime },
            endTime: { $gt: schedule.startTime },
          },
        ],
      }).session(session);

      if (existingAppointment) {
        await session.abortTransaction();
        return res
          .status(400)
          .json({ error: "You already have an appointment during this time" });
      }

      // Create the appointment
      const appointment = new Appointment({
        doctorId,
        patientId: req.user._id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        reason,
        mode: mode || "in-person",
        status: "pending",
      });

      await appointment.save({ session });
      await session.commitTransaction();

      return res.status(201).json(appointment);
    } catch (error) {
      await session.abortTransaction();

      // Handle write conflict
      if (error.code === 112) {
        retryCount++;
        lastError = error;
        continue;
      }

      // Handle other errors
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }

      console.error("Error in createAppointment:", error);
      return res.status(500).json({ error: error.message });
    } finally {
      session.endSession();
    }
  }

  // If we get here, all retries failed
  console.error("Max retries reached in createAppointment:", lastError);
  return res.status(500).json({
    error: "Failed to create appointment after multiple attempts",
    details: lastError?.message,
  });
};

// Update an appointment
const updateAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.findById(req.params.id).session(
      session
    );

    if (!appointment) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check authorization
    if (
      req.user.role === "Patient" &&
      appointment.patientId.toString() !== req.user._id.toString()
    ) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ error: "Not authorized to update this appointment" });
    }

    if (
      req.user.role === "Doctor" &&
      appointment.doctorId.toString() !== req.user._id.toString()
    ) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ error: "Not authorized to update this appointment" });
    }

    // Handle status updates
    if (req.body.status) {
      if (req.body.status === "completed") {
        if (appointment.status !== "confirmed") {
          await session.abortTransaction();
          return res
            .status(400)
            .json({ error: "Can only complete confirmed appointments" });
        }
        appointment.status = "completed";
      } else if (["confirmed", "cancelled"].includes(req.body.status)) {
        if (appointment.status !== "pending") {
          await session.abortTransaction();
          return res
            .status(400)
            .json({ error: "Can only approve/reject pending appointments" });
        }
        appointment.status = req.body.status;
        // Ensure reason is included when updating status
        if (req.body.reason) {
          appointment.reason = req.body.reason;
        }

        // If appointment is cancelled, mark the schedule as available again
        if (req.body.status === "cancelled") {
          const schedule = await DoctorSchedule.findOneAndUpdate(
            {
              doctorId: appointment.doctorId,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              isAvailable: false,
            },
            { isAvailable: true },
            { new: true, session }
          );

          console.log("Schedule updated after cancellation:", {
            appointmentId: appointment._id,
            scheduleFound: !!schedule,
            isAvailable: schedule?.isAvailable,
          });
        }
      } else {
        await session.abortTransaction();
        return res.status(400).json({ error: "Invalid status update" });
      }
    }

    // Save the changes
    await appointment.save({ session });
    await session.commitTransaction();

    // Send success response
    res.status(200).json(appointment);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in updateAppointment:", error);
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Delete an appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Only the patient who created the appointment can delete it
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this appointment" });
    }

    // Free up the time slot
    const schedule = await DoctorSchedule.findOne({
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
    });
    if (schedule) {
      schedule.isBooked = false;
      await schedule.save();
    }

    await appointment.remove();
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all appointments (admin only)
const getAllAppointments = async (req, res) => {
  try {
    // Validate user is authenticated and is an admin
    if (!req.user || req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ error: "Only administrators can access this endpoint" });
    }

    // Check if user has the required permission
    if (!req.user.permissions.includes("VIEW_ALL_APPOINTMENTS")) {
      return res
        .status(403)
        .json({ error: "You don't have permission to view all appointments" });
    }

    // Build query based on filters
    const query = {};

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Date range filter
    if (req.query.startDate) {
      query.startTime = { $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      query.endTime = { $lte: new Date(req.query.endDate) };
    }

    // Get appointments with proper error handling
    const appointments = await Appointment.find(query)
      .populate("doctorId", "firstName lastName specialization email")
      .populate("patientId", "firstName lastName email")
      .sort({ startTime: -1 }) // Sort by start time, newest first
      .catch((err) => {
        console.error("Database error:", err);
        throw new Error("Failed to fetch appointments");
      });

    res.json(appointments);
  } catch (error) {
    console.error("Error in getAllAppointments:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

module.exports = {
  getAppointments,
  getDoctorAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAllAppointments,
};

const Appointment = require("../models/Appointment");
const DoctorSchedule = require("../models/DoctorSchedule");
const User = require("../models/User");
const mongoose = require("mongoose");

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
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (req.user.role !== "Patient") {
      return res
        .status(403)
        .json({ error: "Only patients can create appointments" });
    }

    const { doctorId, scheduleId, reason, mode } = req.body;

    if (!doctorId || !scheduleId || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Creating appointment with data:", {
      doctorId,
      scheduleId,
      reason,
      mode,
    });

    // Check if the doctor exists and is active
    const doctor = await User.findOne({
      _id: doctorId,
      role: "Doctor",
      isActive: true,
      isVerified: true, // Add verification check
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

    // Check if the schedule exists and is available - using findOneAndUpdate for atomic operation
    const schedule = await DoctorSchedule.findOneAndUpdate(
      {
        _id: scheduleId,
        doctorId,
        isAvailable: true,
      },
      { isAvailable: false },
      { new: true, session }
    );

    console.log("Found schedule:", {
      scheduleId,
      doctorId,
      schedule: schedule
        ? {
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isAvailable: schedule.isAvailable,
            startTimeISO: new Date(schedule.startTime).toISOString(),
            endTimeISO: new Date(schedule.endTime).toISOString(),
            startTimeLocal: new Date(schedule.startTime).toString(),
            endTimeLocal: new Date(schedule.endTime).toString(),
          }
        : null,
    });

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

    console.log("Time check:", {
      now: now.toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      nowLocal: now.toString(),
      startTimeLocal: startTime.toString(),
      endTimeLocal: endTime.toString(),
      isFuture: startTime > now,
      isValidTimeSlot: startTime < endTime,
      timeDiff: endTime - startTime,
    });

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
      console.error("❌ Invalid time range", {
        startTime,
        endTime,
        diffMinutes: (endTime - startTime) / 60000,
      });
      await session.abortTransaction();
      return res.status(400).json({
        error: "Appointment time is not within doctor's available schedule",
      });
    }

    // Check if patient already has an appointment at this time
    const existingAppointment = await Appointment.findOne({
      patientId: req.user._id,
      status: { $ne: "cancelled" }, // Exclude cancelled appointments
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

    res.status(201).json(appointment);
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in createAppointment:", error);
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
  }
};

// Update an appointment
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check if the user is either the patient or the doctor
    const isPatient =
      appointment.patientId.toString() === req.user._id.toString();
    const isDoctor =
      appointment.doctorId.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this appointment" });
    }

    // Special handling for status updates
    if (req.body.status) {
      // Doctor can approve/reject pending appointments and complete confirmed appointments
      if (isDoctor) {
        if (req.body.status === "completed") {
          if (appointment.status !== "confirmed") {
            return res
              .status(400)
              .json({ error: "Can only complete confirmed appointments" });
          }
          appointment.status = "completed";
        } else if (["confirmed", "cancelled"].includes(req.body.status)) {
          if (appointment.status !== "pending") {
            return res
              .status(400)
              .json({ error: "Can only approve/reject pending appointments" });
          }
          appointment.status = req.body.status;

          // If doctor cancels the appointment, mark the schedule as available again
          if (req.body.status === "cancelled") {
            const schedule = await DoctorSchedule.findOneAndUpdate(
              {
                doctorId: appointment.doctorId,
                startTime: appointment.startTime,
                endTime: appointment.endTime,
                isAvailable: false,
              },
              { isAvailable: true },
              { new: true }
            );

            console.log("Schedule updated after doctor cancellation:", {
              appointmentId: appointment._id,
              scheduleFound: !!schedule,
              isAvailable: schedule?.isAvailable,
            });
          }
        } else {
          return res.status(400).json({ error: "Invalid status update" });
        }
      }
      // Patient can only cancel pending appointments
      else if (isPatient) {
        if (appointment.status !== "pending") {
          return res
            .status(400)
            .json({ error: "Can only cancel pending appointments" });
        }
        if (req.body.status === "cancelled") {
          appointment.status = "cancelled";

          // If there's an associated schedule, mark it as available again
          const schedule = await DoctorSchedule.findOneAndUpdate(
            {
              doctorId: appointment.doctorId,
              startTime: appointment.startTime,
              endTime: appointment.endTime,
              isAvailable: false,
            },
            { isAvailable: true },
            { new: true }
          );
        } else {
          return res
            .status(400)
            .json({ error: "Patients can only cancel appointments" });
        }
      }
    }

    // Update other fields if provided (only for patients)
    if (isPatient) {
      if (req.body.reason) appointment.reason = req.body.reason;
      if (req.body.mode) appointment.mode = req.body.mode;
    }

    await appointment.save();
    res.json(appointment);
  } catch (error) {
    console.error("Error in updateAppointment:", error);
    res.status(400).json({ error: error.message });
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

module.exports = {
  getAppointments,
  getDoctorAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};

const Appointment = require("../models/Appointment");
const DoctorSchedule = require("../models/DoctorSchedule");
const User = require("../models/User");

// Get doctor's appointments
const getDoctorAppointments = async (req, res) => {
  try {
    // Validate user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Validate user is a doctor
    if (req.user.role !== "Doctor") {
      return res.status(403).json({ error: "Only doctors can access this endpoint" });
    }

    // Get appointments with proper error handling
    const appointments = await Appointment.find({ doctorId: req.user._id })
      .populate("doctorId", "firstName lastName specialization")
      .populate("patientId", "firstName lastName")
      .sort({ startTime: 1 })
      .catch(err => {
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
      message: error.message 
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
      
      if (role === "Doctor") {
        query = { doctorId: userId };
      } else if (role === "Patient") {
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
  try {
    if (req.user.role !== "Patient") {
      return res.status(403).json({ error: "Only patients can create appointments" });
    }

    const { doctorId, scheduleId, reason, mode } = req.body;

    if (!doctorId || !scheduleId || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the doctor exists and is active
    const doctor = await User.findOne({ 
      _id: doctorId, 
      role: "Doctor", 
      isActive: true 
    });
    
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found or inactive" });
    }

    // Check if the schedule exists and is available
    const schedule = await DoctorSchedule.findOne({
      _id: scheduleId,
      doctorId,
      isAvailable: true,
      startTime: { $gt: new Date() } // Ensure the time slot is in the future
    });

    if (!schedule) {
      return res.status(400).json({ error: "Time slot not available or has expired" });
    }

    // Check if patient already has an appointment at this time
    const existingAppointment = await Appointment.findOne({
      patientId: req.user._id,
      $or: [
        {
          startTime: { $lt: schedule.endTime },
          endTime: { $gt: schedule.startTime }
        }
      ]
    });

    if (existingAppointment) {
      return res.status(400).json({ error: "You already have an appointment during this time" });
    }

    // Create the appointment
    const appointment = new Appointment({
      doctorId,
      patientId: req.user._id,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      reason,
      mode: mode || 'in-person',
      status: "confirmed"
    });

    // Mark the schedule as unavailable
    schedule.isAvailable = false;
    await schedule.save();

    await appointment.save();

    // Populate the response with doctor and patient details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("doctorId", "firstName lastName specialization")
      .populate("patientId", "firstName lastName");

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(400).json({ error: error.message });
  }
};

// Update an appointment
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Only the patient who created the appointment can update it
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this appointment" });
    }

    // If changing time, check availability
    if (req.body.time && req.body.time !== appointment.time) {
      const schedule = await DoctorSchedule.findOne({
        doctorId: appointment.doctorId,
        date: appointment.date,
        time: req.body.time,
        isBooked: false
      });

      if (!schedule) {
        return res.status(400).json({ error: "New time slot not available" });
      }

      // Free up the old time slot
      const oldSchedule = await DoctorSchedule.findOne({
        doctorId: appointment.doctorId,
        date: appointment.date,
        time: appointment.time
      });
      if (oldSchedule) {
        oldSchedule.isBooked = false;
        await oldSchedule.save();
      }

      // Mark new time slot as booked
      schedule.isBooked = true;
      await schedule.save();
    }

    Object.assign(appointment, req.body);
    await appointment.save();
    res.json(appointment);
  } catch (error) {
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
      return res.status(403).json({ error: "Not authorized to delete this appointment" });
    }

    // Free up the time slot
    const schedule = await DoctorSchedule.findOne({
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time
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
  deleteAppointment
}; 
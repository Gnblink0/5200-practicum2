const mongoose = require("mongoose");
const DoctorSchedule = require("./DoctorSchedule");

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient ID is required"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    notes: {
      type: String,
      trim: true,
    },
    mode: {
      type: String,
      enum: ["in-person", "telehealth"],
      default: "in-person",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
AppointmentSchema.index({ patientId: 1, doctorId: 1 });
AppointmentSchema.index({ startTime: 1, status: 1 });

// Add validation to ensure appointment is within doctor's schedule
AppointmentSchema.pre("validate", async function (next) {
  if (!this.startTime || !this.endTime || !this.doctorId) {
    return next();
  }

  // First check if start time is before end time
  if (this.startTime >= this.endTime) {
    return next(new Error("End time must be after start time"));
  }

  // Find doctor's schedule for this time period
  const schedule = await DoctorSchedule.findOne({
    doctorId: this.doctorId,
    startTime: { $lte: this.startTime },
    endTime: { $gte: this.endTime },
    isAvailable: true,
  });

  if (!schedule) {
    return next(
      new Error("Appointment time is not within doctor's available schedule")
    );
  }

  next();
});

// Static method to find appointments by patient
AppointmentSchema.statics.findByPatient = function (patientId) {
  return this.find({ patientId }).populate("doctorId");
};

// Static method to find appointments by doctor
AppointmentSchema.statics.findByDoctor = function (doctorId) {
  return this.find({ doctorId }).populate("patientId");
};

AppointmentSchema.methods.duration = function () {
  return this.endTime - this.startTime;
};

const Appointment = mongoose.model("Appointment", AppointmentSchema);

module.exports = Appointment;

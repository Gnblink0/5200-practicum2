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
      required: [true, "Reason is required"],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    mode: {
      type: String,
      enum: ["in-person", "video", "phone"],
      default: "in-person",
    },
    hasPrescription: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
AppointmentSchema.index({ patientId: 1, status: 1 });
AppointmentSchema.index({ doctorId: 1, startTime: 1 });

// Validation middleware
AppointmentSchema.pre("save", async function (next) {
  try {
    // Skip validation if the appointment status is being updated to confirmed or cancelled
    if (
      this.isModified("status") &&
      (this.status === "cancelled" || this.status === "confirmed")
    ) {
      return next();
    }

    // Time range validation
    if (this.startTime >= this.endTime) {
      throw new Error(
        "Invalid time range: appointment end time must be after start time"
      );
    }

    // Check if time is in the future for new appointments
    if (this.startTime < new Date() && this.isNew) {
      throw new Error(
        "Invalid appointment time: cannot create appointments in the past"
      );
    }

    // Only check schedule availability for new appointments
    if (this.isNew) {
      // Find doctor's schedule
      const scheduleQuery = {
        doctorId: this.doctorId,
        startTime: { $lte: this.startTime },
        endTime: { $gte: this.endTime },
        isAvailable: true,
      };

      console.log("Searching for doctor schedule with query:", scheduleQuery);

      const schedule = await mongoose
        .model("DoctorSchedule")
        .findOne(scheduleQuery);

      console.log("Found schedule:", {
        appointmentId: this._id,
        scheduleFound: !!schedule,
        scheduleId: schedule?._id,
        isAvailable: schedule?.isAvailable,
        startTime: schedule?.startTime,
        endTime: schedule?.endTime,
      });

      if (!schedule) {
        throw new Error(
          "No available schedule found for the selected time slot"
        );
      }
    }

    next();
  } catch (error) {
    // Log validation failure
    console.error("Appointment validation failed:", {
      appointmentId: this._id,
      doctorId: this.doctorId,
      startTime: this.startTime,
      endTime: this.endTime,
      error: error.message,
    });
    next(error);
  }
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

// Instance method to check if appointment can be modified
AppointmentSchema.methods.canModify = function () {
  return ["pending", "confirmed"].includes(this.status);
};

const Appointment = mongoose.model("Appointment", AppointmentSchema);

module.exports = Appointment;

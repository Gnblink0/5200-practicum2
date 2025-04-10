const mongoose = require("mongoose");

const PrescriptionSchema = new mongoose.Schema(
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment ID is required"],
      unique: true,
    },
    medications: [
      {
        name: {
          type: String,
          required: [true, "Medication name is required"],
        },
        dosage: {
          type: String,
          required: [true, "Medication dosage is required"],
        },
        frequency: {
          type: String,
          required: [true, "Medication frequency is required"],
        },
        duration: {
          type: String,
          required: [true, "Medication duration is required"],
        },
      },
    ],
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
PrescriptionSchema.index({ patientId: 1, status: 1 });
PrescriptionSchema.index({ doctorId: 1, issuedDate: -1 });

// Validation to ensure expiry date is after issued date
PrescriptionSchema.pre("validate", function (next) {
  if (
    this.issuedDate &&
    this.expiryDate &&
    this.issuedDate >= this.expiryDate
  ) {
    next(new Error("Expiry date must be after issued date"));
  }
  next();
});

// Static method to find active prescriptions
PrescriptionSchema.statics.findActivePrescriptions = function (patientId) {
  return this.find({
    patientId,
    status: "active",
    expiryDate: { $gte: new Date() },
  });
};

PrescriptionSchema.pre(["find", "findOne"], function () {
  if (!this.getQuery().bypassAccessControl) {
    const user = this.getQuery().user;
    if (user && user.role === "Patient") {
      this.where({ patientId: user._id });
    } else if (user && user.role === "Doctor") {
      this.where({ doctorId: user._id });
    }
  }
});

const Prescription = mongoose.model("Prescription", PrescriptionSchema);

module.exports = Prescription;

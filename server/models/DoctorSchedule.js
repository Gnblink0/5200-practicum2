const mongoose = require("mongoose");

const DoctorScheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    unavailableReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate startTime and endTime are on the same day
DoctorScheduleSchema.pre("validate", function (next) {
  if (this.startTime && this.endTime) {
    const startDate = new Date(this.startTime).setHours(0, 0, 0, 0);
    const endDate = new Date(this.endTime).setHours(0, 0, 0, 0);

    if (startDate !== endDate) {
      this.invalidate(
        "endTime",
        "Start time and end time must be on the same day"
      );
    }
  }
  next();
});

// Index for faster queries - using startTime instead of date
DoctorScheduleSchema.index({ doctorId: 1, startTime: 1 });

module.exports = mongoose.model("DoctorSchedule", DoctorScheduleSchema);

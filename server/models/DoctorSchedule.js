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
    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Increment version on each update
DoctorScheduleSchema.pre("save", function (next) {
  if (this.isModified("isAvailable")) {
    this.version += 1;
  }
  next();
});

// Validate startTime and endTime
DoctorScheduleSchema.pre("validate", function (next) {
  if (this.startTime && this.endTime) {
    console.log("Validating schedule times:", {
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      isValid: this.startTime < this.endTime,
    });

    if (this.startTime >= this.endTime) {
      this.invalidate("endTime", "End time must be after start time");
    }

    // Ensure times are on the same day
    const startDate = new Date(this.startTime).setHours(0, 0, 0, 0);
    const endDate = new Date(this.endTime).setHours(0, 0, 0, 0);

    console.log("Checking same day:", {
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      isSameDay: startDate === endDate,
    });

    if (startDate !== endDate) {
      this.invalidate(
        "endTime",
        "Start time and end time must be on the same day"
      );
    }
  }
  next();
});

// Index for faster queries
DoctorScheduleSchema.index({ doctorId: 1, startTime: 1 });

module.exports = mongoose.model("DoctorSchedule", DoctorScheduleSchema);

const mongoose = require("mongoose");
const User = require("./User");

const DoctorSchema = User.discriminator(
  "Doctor",
  new mongoose.Schema(
    {
      specialization: {
        type: String,
        required: [true, "Specialization is required"],
        trim: true,
      },
      licenseNumber: {
        type: String,
        required: [true, "Medical license number is required"],
        unique: true,
      },
      qualifications: [String],
    },
    {
      timestamps: true,
    }
  )
);

module.exports = DoctorSchema;

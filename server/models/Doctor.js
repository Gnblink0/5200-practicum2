const mongoose = require("mongoose");
const User = require("./User");

const DoctorSchema = User.discriminator(
  "Doctor",
  new mongoose.Schema(
    {
      specialization: {
        type: String,
        trim: true,
        default: "",
      },
      licenseNumber: {
        type: String,
        unique: true,
        sparse: true,
      },
    },
    {
      timestamps: true,
    }
  )
);

module.exports = DoctorSchema;

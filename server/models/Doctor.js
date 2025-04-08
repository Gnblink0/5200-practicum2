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
        sparse: true,
        default: null
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
      },
      verifiedAt: {
        type: Date,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
      }
    },
    {
      timestamps: true,
    }
  )
);

module.exports = DoctorSchema;

const mongoose = require("mongoose");
const User = require("./User");

const PatientSchema = User.discriminator(
  "Patient",
  new mongoose.Schema(
    {
      dateOfBirth: {
        type: Date,
        required: [true, "Date of birth is required"],
      },
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer not to say"],
        required: [true, "Gender is required"],
      },
      insuranceInfo: {
        provider: String,
        policyNumber: {
          type: String,
          trim: true,
        },
        coverageDetails: String,
      },
      emergencyContacts: 
        {
          name: {
            type: String,
          },
          relationship: {
            type: String,
          },
          phone: {
            type: String,
          },
        },
      medicalHistory: 
        {
          disease: String,
          medications: String,
          allergies: String,
          familyHistory: String,
        },
    },
    {
      timestamps: true,
    }
  )
);

module.exports = PatientSchema;

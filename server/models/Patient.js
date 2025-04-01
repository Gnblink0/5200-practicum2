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
      emergencyContacts: [
        {
          name: {
            type: String,
            required: [true, "Emergency contact name is required"],
          },
          relationship: {
            type: String,
            required: [true, "Relationship is required"],
          },
          phone: {
            type: String,
            required: [true, "Emergency contact phone is required"],
            match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"],
          },
        },
      ],
      medicalHistory: [
        {
          disease: [String],
          medications: [String],
          allergies: [String],
          familyHistory: String,
        },
      ],
    },
    {
      timestamps: true,
    }
  )
);

module.exports = PatientSchema;

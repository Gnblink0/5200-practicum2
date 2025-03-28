const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true, // from Firebase
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
    },
    contactInfo: {
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

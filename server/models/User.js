const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
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
    passwordHash: {
      type: String,
      required: true,
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
    timestamps: true, // Add createdAt and updatedAt fields
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;

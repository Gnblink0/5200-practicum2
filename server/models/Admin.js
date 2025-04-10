const mongoose = require("mongoose");
const User = require("./User");

const AdminSchema = User.discriminator(
  "Admin",
  new mongoose.Schema(
    {
      permissions: {
        type: [String],
        enum: [
          "READ_ALL_USERS",
          "MANAGE_USER_STATUS",
          "VERIFY_DOCTORS",
          "VIEW_ALL_APPOINTMENTS",
        ],
        default: [
          "READ_ALL_USERS",
          "MANAGE_USER_STATUS",
          "VERIFY_DOCTORS",
          "VIEW_ALL_APPOINTMENTS",
        ],
      },
      activityLog: [
        {
          action: {
            type: String,
            required: [true, "Action is required"],
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
          details: mongoose.Schema.Types.Mixed,
          performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  )
);

module.exports = AdminSchema;

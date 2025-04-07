const { auth } = require("../middleware/auth");
const User = require("../models/User");
const Admin = require("../models/Admin");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// User Registration
const registerUser = async (req, res) => {
  try {
    const { email, firstName, lastName, phone, address, uid, username, role } =
      req.body;

    // Check if user already exists in any collection
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { username }],
    });
    const existingPatient = await Patient.findOne({
      $or: [{ email }, { username }],
    });
    const existingDoctor = await Doctor.findOne({
      $or: [{ email }, { username }],
    });

    if (existingAdmin || existingPatient || existingDoctor) {
      return res
        .status(400)
        .json({ error: "User already exists with this email or username" });
    }

    let savedUser;

    // Create user based on selected role
    switch (role) {
      case "Admin":
        const admin = new Admin({
          email,
          firstName,
          lastName,
          phone,
          address,
          uid,
          username,
          isActive: true,
          permissions: ["user_management"], // Default permission
          activityLog: [
            {
              action: "account_created",
              timestamp: new Date(),
              details: { method: "registration" },
            },
          ],
        });
        savedUser = await admin.save();
        console.log("Admin saved successfully:", savedUser);
        break;

      case "Patient":
        const patient = new Patient({
          email,
          firstName,
          lastName,
          phone,
          address,
          uid,
          username,
          isActive: true,
          dateOfBirth: new Date(),
          gender: "prefer not to say",
          insuranceInfo: {
            provider: "",
            policyNumber: "",
            coverageDetails: "",
          },
          emergencyContacts: {
            name:"",
            relationship:"",
            phone:""
          },
          medicalHistory: {
            disease:"",
            medications:"",
            allergies:"",
            familyHistory:""
          },
          appointments: [],
        });

        savedUser = await patient.save();
        console.log("Patient saved successfully:", savedUser);
        break;

      case "Doctor":
        const doctor = new Doctor({
          email,
          firstName,
          lastName,
          phone,
          address,
          uid,
          username,
          isActive: true,
          specialization: "",
          licenseNumber: "",
          availability: [],
          patients: [],
          appointments: [],
        });
        savedUser = await doctor.save();
        console.log("Doctor saved successfully:", savedUser);
        break;

      default:
        return res.status(400).json({ error: "Invalid role specified" });
    }

    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get current user profile
const getUserProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);

    // base fields
    const baseUpdates = ["firstName", "lastName", "phone", "address"];

    // based on user role, add allowed updates
    let allowedUpdates = [...baseUpdates];

    // if user is doctor, add doctor specific fields
    if (req.user.role === "Doctor") {
      allowedUpdates.push("specialization", "licenseNumber");
    }

    if (req.user.role === "Patient") {
      allowedUpdates.push("dateOfBirth", "gender", "insuranceInfo", "emergencyContacts", "medicalHistory");
    }

    console.log("Allowed updates:", allowedUpdates);
    console.log("Received updates:", updates);

    // check if update fields are valid
    const isValidOperation = updates.every(
      (update) =>
        allowedUpdates.includes(update) ||
        update === "role" || // allow role field to exist but not update
        update === "email" // allow email field to exist but not update
    );

    if (!isValidOperation) {
      return res.status(400).json({
        error: "Invalid updates!",
        allowedUpdates: allowedUpdates,
        receivedUpdates: updates,
      });
    }

    // update fields
    updates.forEach((update) => {
      // skip role and email fields
      if (update !== "role" && update !== "email") {
        req.user[update] = req.body[update];
      }
    });

    // save updates
    await req.user.save();

    // return updated user data
    res.json(req.user);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(400).json({
      error: error.message,
      details: error.errors, // Mongoose validation errors
    });
  }
};

// Delete current user's profile
const deleteUserProfile = async (req, res) => {
  try {
    const { email, uid } = req.user;
    const deletedUser = await User.findOneAndDelete({ email, uid });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User profile deleted successfully" });
  } catch (error) {
    console.error("Delete profile error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    // check if the user has user_management permission
    if (!req.user.permissions.includes("user_management")) {
      return res.status(403).json({ error: "Permission denied" });
    }

    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsers,
};

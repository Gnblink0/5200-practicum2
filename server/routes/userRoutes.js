const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Admin = require('../models/Admin');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

router.post("/register", async (req, res) => {
  try {
    const { 
      email, 
      firstName, 
      lastName, 
      phone, 
      address, 
      uid, 
      username,
      role 
    } = req.body;

    // Check if user already exists in any collection
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    const existingPatient = await Patient.findOne({ $or: [{ email }, { username }] });
    const existingDoctor = await Doctor.findOne({ $or: [{ email }, { username }] });

    if (existingAdmin || existingPatient || existingDoctor) {
      return res
        .status(400)
        .json({ error: "User already exists with this email or username" });
    }

    let savedUser;

    // Create user based on selected role
    switch (role) {
      case 'Admin':
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

      case 'Patient':
        const patient = new Patient({
          email,
          firstName,
          lastName,
          phone,
          address,
          uid,
          username,
          isActive: true,
          medicalHistory: [],
          appointments: [],
          insuranceInfo: {
            provider: "",
            policyNumber: "",
            groupNumber: ""
          }
        });
        savedUser = await patient.save();
        console.log("Patient saved successfully:", savedUser);
        break;

      case 'Doctor':
        const doctor = new Doctor({
          email,
          firstName,
          lastName,
          phone,
          address,
          uid,
          username,
          isActive: true,
          specialization: "123",
          licenseNumber: "123",
          availability: [],
          patients: [],
          appointments: []
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
});


// Get current user profile
router.get("/profile", auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["firstName", "lastName", "phone", "address"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid updates!" });
    }

    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.json(req.user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user
router.delete("/:id", auth, async (req, res) => {
  try {
    const user = await Admin.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.remove();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get("/", auth, async (req, res) => {
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
});

// Delete current user's profile
router.delete("/profile", auth, async (req, res) => {
  try {
    const user = req.user;
    await user.remove();
    res.json({ message: "User profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

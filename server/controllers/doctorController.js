const Doctor = require("../models/Doctor");

// Get all active doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .select("firstName lastName specialization licenseNumber verificationStatus")
      .sort({ lastName: 1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select("firstName lastName specialization licenseNumber availability verificationStatus");
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending verification doctors
const getPendingDoctors = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Only administrators can view pending doctors" });
    }

    const doctors = await Doctor.find({ 
      verificationStatus: 'pending',
      isActive: true 
    })
    .select("firstName lastName email specialization licenseNumber createdAt")
    .sort({ createdAt: 1 });

    res.json(doctors);
  } catch (error) {
    console.error("Error in getPendingDoctors:", error);
    res.status(500).json({ error: error.message });
  }
};

// Generate a license number in the format MD-[TIMESTAMP]-[RANDOM_ID]
const generateLicenseNumber = () => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `MD-${timestamp}-${randomId}`;
};

// Verify doctor
const verifyDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { licenseNumber } = req.body;

    // Validate license number format
    const licenseNumberRegex = /^MD-\d{13}-[A-Z0-9]{8}$/;
    if (!licenseNumberRegex.test(licenseNumber)) {
      return res.status(400).json({
        error: "Invalid license number format",
        message: "License number must be in format: MD-[TIMESTAMP]-[RANDOM_ID] (e.g., MD-1743978088805-83J17YQMN)"
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // Update doctor's verification status and license number
    doctor.isVerified = true;
    doctor.licenseNumber = licenseNumber;
    doctor.verificationStatus = "verified";
    await doctor.save();

    res.json({
      message: "Doctor verified successfully",
      doctor: {
        id: doctor._id,
        isVerified: doctor.isVerified,
        licenseNumber: doctor.licenseNumber
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getPendingDoctors,
  verifyDoctor
}; 
const Doctor = require("../models/Doctor");

// Get all active doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .select("firstName lastName specialization licenseNumber")
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
      .select("firstName lastName specialization licenseNumber availability");
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorById
}; 
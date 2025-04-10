const Doctor = require("../models/Doctor");
const Admin = require("../models/Admin");

// Get all active doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true })
      .select(
        "firstName lastName specialization licenseNumber verificationStatus"
      )
      .sort({ lastName: 1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select(
      "firstName lastName specialization licenseNumber availability verificationStatus"
    );
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
      return res
        .status(403)
        .json({ error: "Only administrators can view pending doctors" });
    }

    const doctors = await Doctor.find({
      verificationStatus: "pending",
      isActive: true,
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
    // 1. check user role and permission
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        error: "Only administrators can verify doctors",
      });
    }

    if (!req.user.permissions.includes("VERIFY_DOCTORS")) {
      return res.status(403).json({
        error: "You don't have permission to verify doctors",
      });
    }

    const { doctorId } = req.params;
    const { licenseNumber, status } = req.body;

    // 2. validate license number format (if verified)
    if (status === "verified") {
      const licenseNumberRegex = /^MD-\d{13}-[A-Z0-9]{8}$/;
      if (!licenseNumberRegex.test(licenseNumber)) {
        return res.status(400).json({
          error: "Invalid license number format",
          message:
            "License number must be in format: MD-[TIMESTAMP]-[RANDOM_ID]",
        });
      }
    }

    // 3. find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    // 4. update doctor status
    doctor.verificationStatus = status;
    doctor.isVerified = status === "verified";
    if (status === "verified") {
      doctor.licenseNumber = licenseNumber;
      doctor.verifiedAt = new Date();
      doctor.verifiedBy = req.user._id;
    }

    // 5. save changes
    await doctor.save();

    // 6. record admin action
    const admin = await Admin.findById(req.user._id);
    admin.activityLog.push({
      action: `doctor_${status}`,
      timestamp: new Date(),
      details: {
        doctorId: doctor._id,
        doctorEmail: doctor.email,
        licenseNumber: status === "verified" ? licenseNumber : null,
        previousStatus: doctor.verificationStatus,
      },
    });
    await admin.save();

    // 7. return response
    res.json({
      message: `Doctor ${status} successfully`,
      doctor: {
        id: doctor._id,
        email: doctor.email,
        isVerified: doctor.isVerified,
        verificationStatus: doctor.verificationStatus,
        licenseNumber: doctor.licenseNumber,
        verifiedAt: doctor.verifiedAt,
        verifiedBy: doctor.verifiedBy,
      },
    });
  } catch (error) {
    console.error("Error in verifyDoctor:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getPendingDoctors,
  verifyDoctor,
};

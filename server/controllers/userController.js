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
      role, 
      // Patient-specific fields
      dateOfBirth,
      gender,
      insuranceInfo,
      emergencyContacts,
      // Doctor-specific fields
      specialization,
      licenseNumber,
      qualifications
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
          dateOfBirth,
          gender,
          insuranceInfo: insuranceInfo || {
            provider: "",
            policyNumber: "",
            coverageDetails: ""
          },
          emergencyContacts: emergencyContacts || [],
          medicalHistory: []
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
          specialization,
          licenseNumber,
          qualifications: qualifications || [],
          availability: [],
          patients: []
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

const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    res.json(req.user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await Admin.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.remove();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  getProfile,
  updateProfile,
  deleteUser
}; 
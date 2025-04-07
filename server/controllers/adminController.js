const Admin = require("../models/Admin");

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({});
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single admin
const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update admin permissions
const updateAdminPermissions = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.permissions = req.body.permissions;
    admin.activityLog.push({
      action: "permissions_updated",
      timestamp: new Date(),
      details: { updatedBy: req.user._id },
    });

    await admin.save();
    res.json(admin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update admin status
const updateAdminStatus = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.isActive = req.body.isActive;
    admin.activityLog.push({
      action: req.body.isActive ? "account_activated" : "account_deactivated",
      timestamp: new Date(),
      details: { updatedBy: req.user._id },
    });

    await admin.save();
    res.json(admin);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  updateAdminPermissions,
  updateAdminStatus,
};

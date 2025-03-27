// src/api/controllers/adminController.js
const { AdminCrud, UserCrud } = require('../../models/crud-operations');
const adminService = require('../../services/adminService');
const logger = require('../../utils/logger');
const User = require('../../models/User');
const Appointment = require('../../models/Appointment');
const Prescription = require('../../models/Prescription');
const Payment = require('../../models/Payment');
const Report = require('../../models/Report');
const AuditLog = require('../../models/AuditLog');
const Setting = require('../../models/Setting');
const { createError } = require('../../utils/errorHandler');

/**
 * Admin controller for handling admin-related operations
 */
class AdminController {
  /**
   * Create a new admin
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createAdmin(req, res, next) {
    try {
      const { userId, personalInfo, permissions } = req.body;

      // Check if the user exists and has 'admin' role
      const user = await UserCrud.getById(userId);
      
      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User not found'
          }
        });
      }

      if (user.role !== 'admin') {
        return res.status(400).json({
          error: {
            message: 'User is not an admin'
          }
        });
      }

      // Check if admin profile already exists for this user
      const existingAdmin = await AdminCrud.getAdminByUserId(userId);
      
      if (existingAdmin) {
        return res.status(409).json({
          error: {
            message: 'Admin profile already exists for this user'
          }
        });
      }

      // Create admin profile
      const adminId = await AdminCrud.createAdmin({
        userId,
        personalInfo,
        permissions: permissions || [],
        activityLog: []
      });

      res.status(201).json({
        message: 'Admin profile created successfully',
        adminId
      });
    } catch (error) {
      logger.error('Error in createAdmin controller:', error);
      next(error);
    }
  }

  /**
   * Get admin by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAdminById(req, res, next) {
    try {
      const { id } = req.params;

      // Only admins can access admin profiles
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access admin profiles'
          }
        });
      }

      // Get admin by ID
      const admin = await AdminCrud.getById(id);
      
      if (!admin) {
        return res.status(404).json({
          error: {
            message: 'Admin not found'
          }
        });
      }

      res.status(200).json(admin);
    } catch (error) {
      logger.error('Error in getAdminById controller:', error);
      next(error);
    }
  }

  /**
   * Update admin
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Only admins can update admin profiles
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to update admin profiles'
          }
        });
      }

      // Update admin
      const updated = await AdminCrud.update(id, updateData);

      if (!updated) {
        return res.status(404).json({
          error: {
            message: 'Admin not found'
          }
        });
      }

      res.status(200).json({
        message: 'Admin updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateAdmin controller:', error);
      next(error);
    }
  }

  /**
   * Delete admin
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteAdmin(req, res, next) {
    try {
      const { id } = req.params;

      // Only admins can delete admin profiles
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to delete admin profiles'
          }
        });
      }

      // Delete admin
      const deleted = await AdminCrud.delete(id);

      if (!deleted) {
        return res.status(404).json({
          error: {
            message: 'Admin not found'
          }
        });
      }

      res.status(200).json({
        message: 'Admin deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteAdmin controller:', error);
      next(error);
    }
  }

  /**
   * Get all admins
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllAdmins(req, res, next) {
    try {
      // Only admins can access all admin profiles
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access all admin profiles'
          }
        });
      }

      // Get all admins
      const admins = await AdminCrud.find();

      res.status(200).json(admins);
    } catch (error) {
      logger.error('Error in getAllAdmins controller:', error);
      next(error);
    }
  }

  /**
   * Add activity log entry
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addActivityLog(req, res, next) {
    try {
      const { id } = req.params;
      const { action, details } = req.body;

      // Check if the admin exists
      const admin = await AdminCrud.getById(id);
      
      if (!admin) {
        return res.status(404).json({
          error: {
            message: 'Admin not found'
          }
        });
      }

      // Only admins can add activity logs
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to add activity logs'
          }
        });
      }

      // Add activity log entry
      const added = await AdminCrud.addActivityLogEntry(id, action, details, req.user.id);

      if (!added) {
        return res.status(500).json({
          error: {
            message: 'Failed to add activity log entry'
          }
        });
      }

      res.status(200).json({
        message: 'Activity log entry added successfully'
      });
    } catch (error) {
      logger.error('Error in addActivityLog controller:', error);
      next(error);
    }
  }

  /**
   * Update admin permissions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updatePermissions(req, res, next) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;

      // Validate permissions
      if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
          error: {
            message: 'Permissions must be a non-empty array'
          }
        });
      }

      // Check valid permissions
      const validPermissions = [
        'user_management',
        'system_configuration',
        'reporting',
        'billing_management',
        'audit_logs',
        'medical_record_review'
      ];

      for (const permission of permissions) {
        if (!validPermissions.includes(permission)) {
          return res.status(400).json({
            error: {
              message: `Invalid permission: ${permission}`
            }
          });
        }
      }

      // Only admins can update permissions
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to update admin permissions'
          }
        });
      }

      // Update permissions
      const updated = await AdminCrud.updatePermissions(id, permissions);

      if (!updated) {
        return res.status(404).json({
          error: {
            message: 'Admin not found'
          }
        });
      }

      res.status(200).json({
        message: 'Admin permissions updated successfully'
      });
    } catch (error) {
      logger.error('Error in updatePermissions controller:', error);
      next(error);
    }
  }

  /**
   * Get system audit logs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSystemAuditLogs(req, res, next) {
    try {
      const { startDate, endDate, page = 1, limit = 20 } = req.query;

      // Only admins with audit_logs permission can access audit logs
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access system audit logs'
          }
        });
      }

      // Check if admin has audit_logs permission
      const admin = await AdminCrud.getAdminByUserId(req.user.id);
      
      if (!admin || !admin.permissions.includes('audit_logs')) {
        return res.status(403).json({
          error: {
            message: 'Insufficient permissions to access audit logs'
          }
        });
      }

      // Get audit logs
      const auditLogs = await adminService.getSystemAuditLogs(startDate, endDate, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.status(200).json(auditLogs);
    } catch (error) {
      logger.error('Error in getSystemAuditLogs controller:', error);
      next(error);
    }
  }

  /**
   * Get system configuration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSystemConfiguration(req, res, next) {
    try {
      // Only admins with system_configuration permission can access configuration
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access system configuration'
          }
        });
      }

      // Check if admin has system_configuration permission
      const admin = await AdminCrud.getAdminByUserId(req.user.id);
      
      if (!admin || !admin.permissions.includes('system_configuration')) {
        return res.status(403).json({
          error: {
            message: 'Insufficient permissions to access system configuration'
          }
        });
      }

      // Get system configuration
      const configuration = await adminService.getSystemConfiguration();

      res.status(200).json(configuration);
    } catch (error) {
      logger.error('Error in getSystemConfiguration controller:', error);
      next(error);
    }
  }

  /**
   * Update system configuration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateSystemConfiguration(req, res, next) {
    try {
      const configData = req.body;

      // Only admins with system_configuration permission can update configuration
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to update system configuration'
          }
        });
      }

      // Check if admin has system_configuration permission
      const admin = await AdminCrud.getAdminByUserId(req.user.id);
      
      if (!admin || !admin.permissions.includes('system_configuration')) {
        return res.status(403).json({
          error: {
            message: 'Insufficient permissions to update system configuration'
          }
        });
      }

      // Update system configuration
      const updated = await adminService.updateSystemConfiguration(configData);

      if (!updated) {
        return res.status(500).json({
          error: {
            message: 'Failed to update system configuration'
          }
        });
      }

      // Log this admin action
      await AdminCrud.addActivityLogEntry(
        admin._id,
        'System configuration updated',
        { changes: Object.keys(configData) },
        req.user.id
      );

      res.status(200).json({
        message: 'System configuration updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateSystemConfiguration controller:', error);
      next(error);
    }
  }

  /**
   * Get system statistics
   */
  async getStatistics(req, res, next) {
    try {
      const [
        userStats,
        appointmentStats,
        paymentStats,
        prescriptionStats
      ] = await Promise.all([
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ]),
        Appointment.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Payment.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Prescription.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      ]);

      res.json({
        success: true,
        data: {
          userStats,
          appointmentStats,
          paymentStats,
          prescriptionStats
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching statistics'));
    }
  }

  /**
   * Get daily statistics
   */
  async getDailyStatistics(req, res, next) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        appointments,
        payments,
        prescriptions
      ] = await Promise.all([
        Appointment.countDocuments({
          createdAt: { $gte: today }
        }),
        Payment.countDocuments({
          createdAt: { $gte: today }
        }),
        Prescription.countDocuments({
          createdAt: { $gte: today }
        })
      ]);

      res.json({
        success: true,
        data: {
          appointments,
          payments,
          prescriptions
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching daily statistics'));
    }
  }

  /**
   * Get monthly statistics
   */
  async getMonthlyStatistics(req, res, next) {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [
        appointments,
        payments,
        prescriptions
      ] = await Promise.all([
        Appointment.countDocuments({
          createdAt: { $gte: startOfMonth }
        }),
        Payment.countDocuments({
          createdAt: { $gte: startOfMonth }
        }),
        Prescription.countDocuments({
          createdAt: { $gte: startOfMonth }
        })
      ]);

      res.json({
        success: true,
        data: {
          appointments,
          payments,
          prescriptions
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching monthly statistics'));
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, role } = req.query;
      const query = role ? { role } : {};

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching users'));
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req, res, next) {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return next(createError(404, 'User not found'));
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(createError(500, 'Error fetching user'));
    }
  }

  /**
   * Create new user
   */
  async createUser(req, res, next) {
    try {
      const user = new User(req.body);
      await user.save();

      // Log the action
      await AuditLog.logUserAction(
        req.user._id,
        'create',
        'user',
        user._id,
        { role: user.role }
      );

      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(createError(500, 'Error creating user'));
    }
  }

  /**
   * Update user
   */
  async updateUser(req, res, next) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return next(createError(404, 'User not found'));
      }

      // Log the action
      await AuditLog.logUserAction(
        req.user._id,
        'update',
        'user',
        user._id,
        { changes: req.body }
      );

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(createError(500, 'Error updating user'));
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res, next) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return next(createError(404, 'User not found'));
      }

      // Log the action
      await AuditLog.logUserAction(
        req.user._id,
        'delete',
        'user',
        user._id
      );

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(createError(500, 'Error deleting user'));
    }
  }

  /**
   * Get all doctors
   */
  async getAllDoctors(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const doctors = await User.find({ role: 'doctor' })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await User.countDocuments({ role: 'doctor' });

      res.json({
        success: true,
        data: {
          doctors,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching doctors'));
    }
  }

  /**
   * Get all patients
   */
  async getAllPatients(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const patients = await User.find({ role: 'patient' })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await User.countDocuments({ role: 'patient' });

      res.json({
        success: true,
        data: {
          patients,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching patients'));
    }
  }

  /**
   * Get system settings
   */
  async getSettings(req, res, next) {
    try {
      const settings = await Setting.find({ status: 'active' });
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(createError(500, 'Error fetching settings'));
    }
  }

  /**
   * Update system settings
   */
  async updateSettings(req, res, next) {
    try {
      const { settings } = req.body;
      const errors = await Setting.validateSettings(settings);
      
      if (errors.length > 0) {
        return next(createError(400, 'Invalid settings', errors));
      }

      const updatedSettings = await Promise.all(
        Object.entries(settings).map(async ([key, value]) => {
          return await Setting.updateSetting(key, value, req.user._id);
        })
      );

      res.json({
        success: true,
        data: updatedSettings
      });
    } catch (error) {
      next(createError(500, 'Error updating settings'));
    }
  }

  /**
   * Get system logs
   */
  async getLogs(req, res, next) {
    try {
      const { page = 1, limit = 50 } = req.query;
      const logs = await AuditLog.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'firstName lastName email');

      const total = await AuditLog.countDocuments();

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching logs'));
    }
  }

  /**
   * Get logs by type
   */
  async getLogsByType(req, res, next) {
    try {
      const { type } = req.params;
      const { page = 1, limit = 50 } = req.query;
      
      const logs = await AuditLog.find({ action: type })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'firstName lastName email');

      const total = await AuditLog.countDocuments({ action: type });

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching logs by type'));
    }
  }

  /**
   * Clear logs
   */
  async clearLogs(req, res, next) {
    try {
      await AuditLog.deleteMany({});
      
      // Log the action
      await AuditLog.logUserAction(
        req.user._id,
        'delete',
        'system',
        null,
        { action: 'clear_logs' }
      );

      res.json({
        success: true,
        message: 'Logs cleared successfully'
      });
    } catch (error) {
      next(createError(500, 'Error clearing logs'));
    }
  }

  /**
   * Get all appointments
   */
  async getAllAppointments(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const appointments = await Appointment.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'firstName lastName');

      const total = await Appointment.countDocuments();

      res.json({
        success: true,
        data: {
          appointments,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching appointments'));
    }
  }

  /**
   * Get all prescriptions
   */
  async getAllPrescriptions(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const prescriptions = await Prescription.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('patientId', 'firstName lastName')
        .populate('doctorId', 'firstName lastName');

      const total = await Prescription.countDocuments();

      res.json({
        success: true,
        data: {
          prescriptions,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching prescriptions'));
    }
  }

  /**
   * Get all payments
   */
  async getAllPayments(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const payments = await Payment.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('patientId', 'firstName lastName');

      const total = await Payment.countDocuments();

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching payments'));
    }
  }

  /**
   * Create system backup
   */
  async createBackup(req, res, next) {
    try {
      // Here you would implement the actual backup logic
      // For now, we'll just log the action
      await AuditLog.logUserAction(
        req.user._id,
        'create',
        'system',
        null,
        { action: 'create_backup' }
      );

      res.json({
        success: true,
        message: 'Backup created successfully'
      });
    } catch (error) {
      next(createError(500, 'Error creating backup'));
    }
  }

  /**
   * Get system backups
   */
  async getBackups(req, res, next) {
    try {
      // Here you would implement the actual backup listing logic
      // For now, we'll return a mock response
      res.json({
        success: true,
        data: {
          backups: []
        }
      });
    } catch (error) {
      next(createError(500, 'Error fetching backups'));
    }
  }

  /**
   * Restore system from backup
   */
  async restoreBackup(req, res, next) {
    try {
      const { backupId } = req.params;
      
      // Here you would implement the actual restore logic
      // For now, we'll just log the action
      await AuditLog.logUserAction(
        req.user._id,
        'update',
        'system',
        null,
        { action: 'restore_backup', backupId }
      );

      res.json({
        success: true,
        message: 'System restored successfully'
      });
    } catch (error) {
      next(createError(500, 'Error restoring backup'));
    }
  }
}

module.exports = new AdminController();
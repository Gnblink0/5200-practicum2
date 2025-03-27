// src/api/middleware/roleMiddleware.js
const { AdminCrud } = require('../../models/crud-operations');
const logger = require('../../utils/logger');
const { createError } = require('../../utils/errorHandler');

/**
 * Middleware to check if user has required role(s)
 * @param {string|Array} roles - Required role(s) to access the route
 * @returns {Function} Express middleware function
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      // Check if user info exists (added by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Authentication required'
          }
        });
      }

      // Convert single role to array
      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      // Check if user has one of the required roles
      if (!requiredRoles.includes(req.user.role)) {
        return res.status(403).json({
          error: {
            message: 'Forbidden. Insufficient permissions'
          }
        });
      }

      // User has required role, continue to next middleware/route handler
      next();
    } catch (error) {
      logger.error('Error in role middleware:', error);
      return res.status(500).json({
        error: {
          message: 'Internal server error.'
        }
      });
    }
  };
};

/**
 * Middleware to check if admin has required permission(s)
 * @param {string|Array} permissions - Required admin permission(s) to access the route
 * @returns {Function} Express middleware function
 */
const requirePermission = (permissions) => {
  return async (req, res, next) => {
    try {
      // Check if user info exists (added by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Authentication required'
          }
        });
      }

      // Check if user is an admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Forbidden. Admin access required'
          }
        });
      }

      // Convert single permission to array
      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];

      // Get admin profile
      const admin = await AdminCrud.getAdminByUserId(req.user.id);
      
      if (!admin) {
        return res.status(403).json({
          error: {
            message: 'Forbidden. Admin profile not found'
          }
        });
      }

      // Check if admin has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission => 
        admin.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          error: {
            message: 'Forbidden. Insufficient admin permissions'
          }
        });
      }

      // Admin has required permissions, continue to next middleware/route handler
      next();
    } catch (error) {
      logger.error('Error in permission middleware:', error);
      return res.status(500).json({
        error: {
          message: 'Internal server error.'
        }
      });
    }
  };
};

/**
 * Middleware to check if user is self or admin
 * Used for routes where users can only access their own resources
 * @param {Function} getResourceUserId - Function to get the user ID associated with the resource
 * @returns {Function} Express middleware function
 */
const requireSelfOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      // Check if user info exists (added by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Authentication required'
          }
        });
      }

      // If user is admin, allow access
      if (req.user.role === 'admin') {
        return next();
      }

      // Get the user ID associated with the resource
      const resourceUserId = await getResourceUserId(req);

      // If no resource user ID found, deny access
      if (!resourceUserId) {
        return res.status(403).json({
          error: {
            message: 'Forbidden. Resource not found or access denied'
          }
        });
      }

      // Check if user is accessing their own resource
      if (req.user.id !== resourceUserId.toString()) {
        return res.status(403).json({
          error: {
            message: 'Forbidden. You can only access your own resources'
          }
        });
      }

      // User is accessing their own resource, continue to next middleware/route handler
      next();
    } catch (error) {
      logger.error('Error in self or admin middleware:', error);
      return res.status(500).json({
        error: {
          message: 'Internal server error.'
        }
      });
    }
  };
};

/**
 * Middleware to check if user is associated with a patient
 * Used for routes where patients can only access their own resources
 * @param {Function} getPatientId - Function to get the patient ID from the request
 * @returns {Function} Express middleware function
 */
const requirePatientAccessOrAdmin = (getPatientId) => {
  return async (req, res, next) => {
    try {
      // Check if user info exists (added by auth middleware)
      if (!req.user) {
        return res.status(401).json({
          error: {
            message: 'Authentication required'
          }
        });
      }

      // If user is admin, allow access
      if (req.user.role === 'admin') {
        return next();
      }

      // If user is doctor, allow access (doctors need to access patient data)
      if (req.user.role === 'doctor') {
        return next();
      }

      // Get the patient ID from the request
      const patientId = await getPatientId(req);

      // If no patient ID found, deny access
      if (!patientId) {
        return res.status(403).json({
          error: {
            message: 'Forbidden. Resource not found or access denied'
          }
        });
      }

      // Check if user is a patient and accessing their own data
      if (req.user.role === 'patient') {
        // Get patient by user ID
        const { PatientCrud } = require('../../models/crud-operations');
        const patient = await PatientCrud.getPatientByUserId(req.user.id);
        
        if (!patient) {
          return res.status(403).json({
            error: {
              message: 'Forbidden. Patient profile not found'
            }
          });
        }

        // Check if patient is accessing their own data
        if (patient._id.toString() !== patientId.toString()) {
          return res.status(403).json({
            error: {
              message: 'Forbidden. You can only access your own data'
            }
          });
        }
      }

      // Access allowed, continue to next middleware/route handler
      next();
    } catch (error) {
      logger.error('Error in patient access middleware:', error);
      return res.status(500).json({
        error: {
          message: 'Internal server error.'
        }
      });
    }
  };
};

/**
 * Check if user has admin role
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return next(createError(401, 'User not authenticated'));
    }
    if (req.user.role !== 'admin') {
        return next(createError(403, 'Access denied. Admin role required.'));
    }
    next();
};

/**
 * Check if user has doctor role
 */
const isDoctor = (req, res, next) => {
    if (!req.user) {
        return next(createError(401, 'User not authenticated'));
    }
    if (req.user.role !== 'doctor') {
        return next(createError(403, 'Access denied. Doctor role required.'));
    }
    next();
};

/**
 * Check if user has patient role
 */
const isPatient = (req, res, next) => {
    if (!req.user) {
        return next(createError(401, 'User not authenticated'));
    }
    if (req.user.role !== 'patient') {
        return next(createError(403, 'Access denied. Patient role required.'));
    }
    next();
};

/**
 * Check if user has staff role
 */
const isStaff = (req, res, next) => {
    if (!req.user) {
        return next(createError(401, 'User not authenticated'));
    }
    if (req.user.role !== 'staff') {
        return next(createError(403, 'Access denied. Staff role required.'));
    }
    next();
};

/**
 * Check if user has any of the specified roles
 * @param {Array<string>} roles - Array of allowed roles
 */
const hasAnyRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(createError(401, 'User not authenticated'));
        }
        if (!roles.includes(req.user.role)) {
            return next(createError(403, 'Access denied. Insufficient role permissions.'));
        }
        next();
    };
};

/**
 * Check if user has all of the specified roles
 * @param {Array<string>} roles - Array of required roles
 */
const hasAllRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(createError(401, 'User not authenticated'));
        }
        if (!roles.every(role => req.user.roles.includes(role))) {
            return next(createError(403, 'Access denied. Insufficient role permissions.'));
        }
        next();
    };
};

/**
 * Check if user is accessing their own data
 */
const isOwnData = (req, res, next) => {
    if (!req.user) {
        return next(createError(401, 'User not authenticated'));
    }
    if (req.user.role === 'admin') {
        return next();
    }
    if (req.params.id !== req.user._id.toString()) {
        return next(createError(403, 'Access denied. Can only access own data.'));
    }
    next();
};

/**
 * Check if user is accessing their doctor's data
 */
const isOwnDoctor = (req, res, next) => {
    if (!req.user) {
        return next(createError(401, 'User not authenticated'));
    }
    if (req.user.role !== 'patient') {
        return next(createError(403, 'Access denied. Patient role required.'));
    }
    if (req.params.id !== req.user.doctorId?.toString()) {
        return next(createError(403, 'Access denied. Can only access own doctor data.'));
    }
    next();
};

/**
 * Check if user is accessing their patient's data
 */
const isOwnPatient = (req, res, next) => {
    if (!req.user) {
        return next(createError(401, 'User not authenticated'));
    }
    if (req.user.role !== 'doctor') {
        return next(createError(403, 'Access denied. Doctor role required.'));
    }
    if (!req.user.patients.includes(req.params.id)) {
        return next(createError(403, 'Access denied. Can only access own patient data.'));
    }
    next();
};

/**
 * Check if user has permission to access medical records
 */
const canAccessMedicalRecords = (req, res, next) => {
    if (!req.user) {
        return next(createError(401, 'User not authenticated'));
    }
    const allowedRoles = ['admin', 'doctor', 'staff'];
    if (!allowedRoles.includes(req.user.role)) {
        return next(createError(403, 'Access denied. Insufficient permissions to access medical records.'));
    }
    next();
};

/**
 * Check if user has permission to modify medical records
 */
const canModifyMedicalRecords = (req, res, next) => {
    if (!req.user) {
        return next(createError(401, 'User not authenticated'));
    }
    const allowedRoles = ['admin', 'doctor'];
    if (!allowedRoles.includes(req.user.role)) {
        return next(createError(403, 'Access denied. Insufficient permissions to modify medical records.'));
    }
    next();
};

module.exports = {
  requireRole,
  requirePermission,
  requireSelfOrAdmin,
  requirePatientAccessOrAdmin,
  isAdmin,
  isDoctor,
  isPatient,
  isStaff,
  hasAnyRole,
  hasAllRoles,
  isOwnData,
  isOwnDoctor,
  isOwnPatient,
  canAccessMedicalRecords,
  canModifyMedicalRecords
};
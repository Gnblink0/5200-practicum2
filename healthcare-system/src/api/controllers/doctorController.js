// src/api/controllers/doctorController.js
const { DoctorCrud, UserCrud } = require('../../models/crud-operations');
const doctorService = require('../../services/doctorService');
const logger = require('../../utils/logger');

/**
 * Doctor controller for handling doctor-related operations
 */
class DoctorController {
  /**
   * Create a doctor profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createDoctor(req, res, next) {
    try {
      const { userId, personalInfo, specialization, licenseNumber, qualifications, consultationFee } = req.body;

      // Check if the user exists and has 'doctor' role
      const user = await UserCrud.getById(userId);
      
      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User not found'
          }
        });
      }

      if (user.role !== 'doctor') {
        return res.status(400).json({
          error: {
            message: 'User is not a doctor'
          }
        });
      }

      // Check if doctor profile already exists for this user
      const existingDoctor = await DoctorCrud.getDoctorByUserId(userId);
      
      if (existingDoctor) {
        return res.status(409).json({
          error: {
            message: 'Doctor profile already exists for this user'
          }
        });
      }

      // Check if license number is already in use
      const doctorWithLicense = await DoctorCrud.findOne({ licenseNumber });
      
      if (doctorWithLicense) {
        return res.status(409).json({
          error: {
            message: 'License number is already in use'
          }
        });
      }

      // Create doctor profile
      const doctorId = await DoctorCrud.createDoctor({
        userId,
        personalInfo,
        specialization,
        licenseNumber,
        qualifications: qualifications || [],
        availableSlots: [],
        consultationFee: consultationFee || 0
      });

      res.status(201).json({
        message: 'Doctor profile created successfully',
        doctorId
      });
    } catch (error) {
      logger.error('Error in createDoctor controller:', error);
      next(error);
    }
  }

  /**
   * Get current doctor's profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getCurrentDoctor(req, res, next) {
    try {
      const userId = req.user.id;

      // Get doctor by user ID
      const doctor = await DoctorCrud.getDoctorByUserId(userId);
      
      if (!doctor) {
        return res.status(404).json({
          error: {
            message: 'Doctor profile not found'
          }
        });
      }

      res.status(200).json(doctor);
    } catch (error) {
      logger.error('Error in getCurrentDoctor controller:', error);
      next(error);
    }
  }

  /**
   * Update current doctor's profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateCurrentDoctor(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Get doctor by user ID
      const doctor = await DoctorCrud.getDoctorByUserId(userId);
      
      if (!doctor) {
        return res.status(404).json({
          error: {
            message: 'Doctor profile not found'
          }
        });
      }

      // If updating license number, check if it's already in use
      if (updateData.licenseNumber && updateData.licenseNumber !== doctor.licenseNumber) {
        const doctorWithLicense = await DoctorCrud.findOne({ licenseNumber: updateData.licenseNumber });
        
        if (doctorWithLicense) {
          return res.status(409).json({
            error: {
              message: 'License number is already in use'
            }
          });
        }
      }

      // Update doctor
      const updated = await DoctorCrud.update(doctor._id, updateData);

      if (!updated) {
        return res.status(500).json({
          error: {
            message: 'Failed to update doctor profile'
          }
        });
      }

      res.status(200).json({
        message: 'Doctor profile updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateCurrentDoctor controller:', error);
      next(error);
    }
  }

  /**
   * Get doctor by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getDoctorById(req, res, next) {
    try {
      const { id } = req.params;

      // Get doctor by ID
      const doctor = await DoctorCrud.getById(id);
      
      if (!doctor) {
        return res.status(404).json({
          error: {
            message: 'Doctor not found'
          }
        });
      }

      res.status(200).json(doctor);
    } catch (error) {
      logger.error('Error in getDoctorById controller:', error);
      next(error);
    }
  }

  /**
   * Update doctor by ID (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Get the current doctor
      const doctor = await DoctorCrud.getById(id);
      
      if (!doctor) {
        return res.status(404).json({
          error: {
            message: 'Doctor not found'
          }
        });
      }

      // If updating license number, check if it's already in use
      if (updateData.licenseNumber && updateData.licenseNumber !== doctor.licenseNumber) {
        const doctorWithLicense = await DoctorCrud.findOne({ licenseNumber: updateData.licenseNumber });
        
        if (doctorWithLicense) {
          return res.status(409).json({
            error: {
              message: 'License number is already in use'
            }
          });
        }
      }

      // Update doctor
      const updated = await DoctorCrud.update(id, updateData);

      if (!updated) {
        return res.status(500).json({
          error: {
            message: 'Failed to update doctor profile'
          }
        });
      }

      res.status(200).json({
        message: 'Doctor profile updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateDoctor controller:', error);
      next(error);
    }
  }

  /**
   * Delete doctor (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteDoctor(req, res, next) {
    try {
      const { id } = req.params;

      // Use service to delete doctor and related data
      const deleted = await doctorService.deleteDoctorAndRelatedData(id);

      if (!deleted) {
        return res.status(404).json({
          error: {
            message: 'Doctor not found'
          }
        });
      }

      res.status(200).json({
        message: 'Doctor and related data deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteDoctor controller:', error);
      next(error);
    }
  }

  /**
   * Get all doctors with filtering and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllDoctors(req, res, next) {
    try {
      const { name, specialization, page = 1, limit = 10 } = req.query;

      // Build filter
      let filter = {};
      
      if (name) {
        filter = {
          $or: [
            { 'personalInfo.firstName': { $regex: name, $options: 'i' } },
            { 'personalInfo.lastName': { $regex: name, $options: 'i' } }
          ]
        };
      }
      
      if (specialization) {
        filter.specialization = specialization;
      }

      // Calculate skip for pagination
      const skip = (page - 1) * parseInt(limit);

      // Get doctors
      const doctors = await DoctorCrud.find(filter, {
        skip,
        limit: parseInt(limit),
        sort: { specialization: 1, 'personalInfo.lastName': 1 }
      });

      // Count total doctors for pagination
      const total = await DoctorCrud.count(filter);

      res.status(200).json({
        doctors,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Error in getAllDoctors controller:', error);
      next(error);
    }
  }

  /**
   * Get doctors by specialization
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getDoctorsBySpecialization(req, res, next) {
    try {
      const { specialization } = req.params;
      
      // Get doctors by specialization
      const doctors = await DoctorCrud.getDoctorsBySpecialization(specialization);
      
      res.status(200).json(doctors);
    } catch (error) {
      logger.error('Error in getDoctorsBySpecialization controller:', error);
      next(error);
    }
  }

  /**
   * Update doctor's availability
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const { date, timeSlots } = req.body;

      // Validate date
      if (!date || isNaN(new Date(date).getTime())) {
        return res.status(400).json({
          error: {
            message: 'Valid date is required'
          }
        });
      }

      // Validate time slots
      if (!Array.isArray(timeSlots) || timeSlots.length === 0) {
        return res.status(400).json({
          error: {
            message: 'Time slots must be a non-empty array'
          }
        });
      }

      for (const slot of timeSlots) {
        if (!slot.startTime || !slot.endTime || isNaN(new Date(slot.startTime).getTime()) || isNaN(new Date(slot.endTime).getTime())) {
          return res.status(400).json({
            error: {
              message: 'Each time slot must have valid startTime and endTime'
            }
          });
        }

        // Ensure endTime is after startTime
        if (new Date(slot.endTime) <= new Date(slot.startTime)) {
          return res.status(400).json({
            error: {
              message: 'End time must be after start time'
            }
          });
        }

        // Set isBooked to false if not provided
        if (slot.isBooked === undefined) {
          slot.isBooked = false;
        }
      }

      // Update availability
      const updated = await DoctorCrud.updateAvailability(id, date, timeSlots);

      if (!updated) {
        return res.status(404).json({
          error: {
            message: 'Doctor not found'
          }
        });
      }

      res.status(200).json({
        message: 'Doctor availability updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateAvailability controller:', error);
      next(error);
    }
  }

  /**
   * Get doctor's availability
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const { date } = req.query;

      // Get doctor
      const doctor = await DoctorCrud.getById(id);
      
      if (!doctor) {
        return res.status(404).json({
          error: {
            message: 'Doctor not found'
          }
        });
      }

      // If date is provided, filter by date
      let availability = doctor.availableSlots;
      
      if (date) {
        const targetDate = new Date(date);
        
        if (isNaN(targetDate.getTime())) {
          return res.status(400).json({
            error: {
              message: 'Invalid date format'
            }
          });
        }
        
        // Set hours to 0 for date comparison
        targetDate.setHours(0, 0, 0, 0);
        
        availability = doctor.availableSlots.filter(slot => {
          const slotDate = new Date(slot.day);
          slotDate.setHours(0, 0, 0, 0);
          return slotDate.getTime() === targetDate.getTime();
        });
      }

      res.status(200).json(availability);
    } catch (error) {
      logger.error('Error in getAvailability controller:', error);
      next(error);
    }
  }

  /**
   * Get doctor's schedule (includes appointments)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSchedule(req, res, next) {
    try {
      const { id } = req.params;
      const { date } = req.query;

      // Validate date
      if (!date || isNaN(new Date(date).getTime())) {
        return res.status(400).json({
          error: {
            message: 'Valid date parameter is required'
          }
        });
      }

      // Get doctor's schedule
      const schedule = await doctorService.getDoctorScheduleForDate(id, date);

      if (!schedule) {
        return res.status(404).json({
          error: {
            message: 'Doctor not found'
          }
        });
      }

      res.status(200).json(schedule);
    } catch (error) {
      logger.error('Error in getSchedule controller:', error);
      next(error);
    }
  }
}

module.exports = new DoctorController();
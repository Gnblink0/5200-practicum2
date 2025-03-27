// src/api/controllers/appointmentController.js
const { AppointmentCrud, PatientCrud, DoctorCrud } = require('../../models/crud-operations');
const appointmentService = require('../../models/services/appointmentService');
const logger = require('../../utils/logger');

/**
 * Appointment controller for handling appointment-related operations
 */
class AppointmentController {
  /**
   * Create a new appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createAppointment(req, res, next) {
    try {
      const {
        patientId,
        doctorId,
        appointmentDate,
        startTime,
        endTime,
        reason,
        notes,
        mode
      } = req.body;

      // Validate required fields
      if (!patientId || !doctorId || !appointmentDate || !startTime || !endTime) {
        return res.status(400).json({
          error: {
            message: 'Patient ID, doctor ID, appointment date, start time, and end time are required'
          }
        });
      }

      // Check if patient exists
      const patient = await PatientCrud.getById(patientId);
      if (!patient) {
        return res.status(404).json({
          error: {
            message: 'Patient not found'
          }
        });
      }

      // Check if doctor exists
      const doctor = await DoctorCrud.getById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          error: {
            message: 'Doctor not found'
          }
        });
      }

      // Create appointment
      const appointmentData = {
        patientId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'pending',
        reason: reason || '',
        notes: notes || '',
        mode: mode || 'in-person',
        createdBy: req.user.id
      };

      // Use service to create the appointment (handles availability checking)
      const appointmentId = await appointmentService.createAppointment(appointmentData);

      res.status(201).json({
        message: 'Appointment created successfully',
        appointmentId
      });
    } catch (error) {
      logger.error('Error in createAppointment controller:', error);
      
      // Handle specific errors
      if (error.message === 'The selected time slot is not available') {
        return res.status(409).json({
          error: {
            message: error.message
          }
        });
      }
      
      next(error);
    }
  }

  /**
   * Get appointment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAppointmentById(req, res, next) {
    try {
      const { id } = req.params;

      // Get appointment with patient and doctor details
      const appointment = await appointmentService.getAppointmentWithDetails(id);
      
      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found'
          }
        });
      }

      // If user is not an admin, check if they are the patient or doctor
      if (req.user.role !== 'admin') {
        const isPatient = appointment.patientId.toString() === req.user.id || 
                          (appointment.patient && appointment.patient.userId.toString() === req.user.id);
        const isDoctor = appointment.doctorId.toString() === req.user.id || 
                         (appointment.doctor && appointment.doctor.userId.toString() === req.user.id);
        
        if (!isPatient && !isDoctor) {
          return res.status(403).json({
            error: {
              message: 'Unauthorized to access this appointment'
            }
          });
        }
      }

      res.status(200).json(appointment);
    } catch (error) {
      logger.error('Error in getAppointmentById controller:', error);
      next(error);
    }
  }

  /**
   * Update appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Get the current appointment
      const appointment = await AppointmentCrud.getById(id);
      
      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found'
          }
        });
      }

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isPatient = appointment.patientId.toString() === req.user.id;
      const isDoctor = appointment.doctorId.toString() === req.user.id;
      
      // Only allow updating if user is involved with the appointment or is an admin
      if (!isAdmin && !isPatient && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to update this appointment'
          }
        });
      }

      // Restrict what patients can update
      if (isPatient && !isAdmin) {
        // Patients can only update reason, notes, and cancel appointments
        const allowedFields = ['reason', 'notes', 'status'];
        
        // If status is being changed, only allow to 'cancelled'
        if (updateData.status && updateData.status !== 'cancelled') {
          return res.status(403).json({
            error: {
              message: 'Patients can only cancel appointments'
            }
          });
        }
        
        // Filter out fields that aren't allowed
        Object.keys(updateData).forEach(key => {
          if (!allowedFields.includes(key)) {
            delete updateData[key];
          }
        });
      }

      // If time/date is being updated, check availability
      if (updateData.appointmentDate || updateData.startTime || updateData.endTime || updateData.doctorId) {
        try {
          // Use service to update appointment (handles availability checking)
          await appointmentService.updateAppointment(id, updateData);
        } catch (error) {
          if (error.message === 'The selected time slot is not available') {
            return res.status(409).json({
              error: {
                message: error.message
              }
            });
          }
          throw error;
        }
      } else {
        // Just update the appointment
        await AppointmentCrud.update(id, updateData);
      }

      res.status(200).json({
        message: 'Appointment updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateAppointment controller:', error);
      next(error);
    }
  }

  /**
   * Cancel appointment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async cancelAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Get the current appointment
      const appointment = await AppointmentCrud.getById(id);
      
      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found'
          }
        });
      }

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isPatient = appointment.patientId.toString() === req.user.id;
      const isDoctor = appointment.doctorId.toString() === req.user.id;
      
      // Only allow cancellation if user is involved with the appointment or is an admin
      if (!isAdmin && !isPatient && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to cancel this appointment'
          }
        });
      }

      // Can't cancel completed appointments
      if (appointment.status === 'completed') {
        return res.status(400).json({
          error: {
            message: 'Cannot cancel a completed appointment'
          }
        });
      }

      // Update appointment status and notes
      const updateData = {
        status: 'cancelled',
        notes: appointment.notes ? `${appointment.notes}\nCancellation reason: ${reason || 'Not provided'}` : `Cancellation reason: ${reason || 'Not provided'}`
      };

      // Use appointment service to cancel (handles freeing up doctor's schedule)
      await appointmentService.cancelAppointment(id, updateData);

      res.status(200).json({
        message: 'Appointment cancelled successfully'
      });
    } catch (error) {
      logger.error('Error in cancelAppointment controller:', error);
      next(error);
    }
  }

  /**
   * Confirm appointment (doctor or admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async confirmAppointment(req, res, next) {
    try {
      const { id } = req.params;

      // Get the current appointment
      const appointment = await AppointmentCrud.getById(id);
      
      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found'
          }
        });
      }

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isDoctor = appointment.doctorId.toString() === req.user.id;
      
      // Only allow confirmation if user is the doctor or an admin
      if (!isAdmin && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Only doctors or admins can confirm appointments'
          }
        });
      }

      // Can't confirm cancelled appointments
      if (appointment.status === 'cancelled') {
        return res.status(400).json({
          error: {
            message: 'Cannot confirm a cancelled appointment'
          }
        });
      }

      // Update appointment status
      await AppointmentCrud.update(id, { status: 'confirmed' });

      res.status(200).json({
        message: 'Appointment confirmed successfully'
      });
    } catch (error) {
      logger.error('Error in confirmAppointment controller:', error);
      next(error);
    }
  }

  /**
   * Complete appointment (doctor or admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async completeAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      // Get the current appointment
      const appointment = await AppointmentCrud.getById(id);
      
      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found'
          }
        });
      }

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isDoctor = appointment.doctorId.toString() === req.user.id;
      
      // Only allow completion if user is the doctor or an admin
      if (!isAdmin && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Only doctors or admins can complete appointments'
          }
        });
      }

      // Can't complete cancelled appointments
      if (appointment.status === 'cancelled') {
        return res.status(400).json({
          error: {
            message: 'Cannot complete a cancelled appointment'
          }
        });
      }

      // Update appointment status and notes
      const updateData = {
        status: 'completed',
        notes: notes ? (appointment.notes ? `${appointment.notes}\n${notes}` : notes) : appointment.notes
      };

      await AppointmentCrud.update(id, updateData);

      res.status(200).json({
        message: 'Appointment completed successfully'
      });
    } catch (error) {
      logger.error('Error in completeAppointment controller:', error);
      next(error);
    }
  }

  /**
   * Delete appointment (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteAppointment(req, res, next) {
    try {
      const { id } = req.params;

      // Only admins can permanently delete appointments
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Only administrators can delete appointments'
          }
        });
      }

      // Use service to delete the appointment and free up doctor's schedule
      const deleted = await appointmentService.deleteAppointment(id);

      if (!deleted) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found'
          }
        });
      }

      res.status(200).json({
        message: 'Appointment deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteAppointment controller:', error);
      next(error);
    }
  }

  /**
   * Get appointments by patient
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAppointmentsByPatient(req, res, next) {
    try {
      const { patientId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isDoctor = req.user.role === 'doctor';
      const isOwner = req.user.id === patientId;
      
      if (!isAdmin && !isDoctor && !isOwner) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access these appointments'
          }
        });
      }

      // Build filter
      const filter = { patientId };
      if (status) {
        filter.status = status;
      }

      // Calculate skip for pagination
      const skip = (page - 1) * parseInt(limit);

      // Get appointments
      const appointments = await AppointmentCrud.find(filter, {
        skip,
        limit: parseInt(limit),
        sort: { appointmentDate: -1, startTime: -1 }
      });

      // Count total appointments for pagination
      const total = await AppointmentCrud.count(filter);

      // If user is doctor or admin, include patient names
      if (isDoctor || isAdmin) {
        // Use service to get appointments with patient details
        const appointmentsWithDetails = await appointmentService.getAppointmentsWithPatientDetails(appointments);
        
        return res.status(200).json({
          appointments: appointmentsWithDetails,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        });
      }

      res.status(200).json({
        appointments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Error in getAppointmentsByPatient controller:', error);
      next(error);
    }
  }

  /**
   * Get appointments by doctor
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAppointmentsByDoctor(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { status, date, page = 1, limit = 10 } = req.query;

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isOwner = req.user.id === doctorId;
      
      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access these appointments'
          }
        });
      }

      // Build filter
      const filter = { doctorId };
      if (status) {
        filter.status = status;
      }
      
      if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        
        filter.appointmentDate = {
          $gte: startDate,
          $lte: endDate
        };
      }

      // Calculate skip for pagination
      const skip = (page - 1) * parseInt(limit);

      // Get appointments
      const appointments = await AppointmentCrud.find(filter, {
        skip,
        limit: parseInt(limit),
        sort: { appointmentDate: 1, startTime: 1 }
      });

      // Count total appointments for pagination
      const total = await AppointmentCrud.count(filter);

      // Use service to get appointments with patient details
      const appointmentsWithDetails = await appointmentService.getAppointmentsWithPatientDetails(appointments);

      res.status(200).json({
        appointments: appointmentsWithDetails,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Error in getAppointmentsByDoctor controller:', error);
      next(error);
    }
  }
}

module.exports = new AppointmentController();
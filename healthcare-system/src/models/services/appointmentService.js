const Appointment = require('../Appointment');
const User = require('../User');
const logger = require('../../utils/logger');

class AppointmentService {
    /**
     * Create a new appointment
     * @param {Object} appointmentData - Appointment data
     * @returns {Promise<Object>} Created appointment
     */
    async createAppointment(appointmentData) {
        try {
            // Check if doctor exists and is available
            const doctor = await User.findOne({
                _id: appointmentData.doctor,
                role: 'doctor',
                isActive: true
            });

            if (!doctor) {
                throw new Error('Doctor not found or not available');
            }

            // Check if patient exists
            const patient = await User.findOne({
                _id: appointmentData.patient,
                role: 'patient',
                isActive: true
            });

            if (!patient) {
                throw new Error('Patient not found or not active');
            }

            // Check for scheduling conflicts
            const existingAppointment = await Appointment.findOne({
                doctor: appointmentData.doctor,
                date: appointmentData.date,
                time: appointmentData.time,
                status: { $in: ['scheduled', 'confirmed'] }
            });

            if (existingAppointment) {
                throw new Error('Time slot is already booked');
            }

            const appointment = await Appointment.create(appointmentData);
            return appointment;
        } catch (error) {
            logger.logError('Error creating appointment:', error);
            throw error;
        }
    }

    /**
     * Get appointment by ID
     * @param {string} appointmentId - Appointment ID
     * @returns {Promise<Object>} Appointment object
     */
    async getAppointmentById(appointmentId) {
        try {
            const appointment = await Appointment.findById(appointmentId)
                .populate('doctor', 'firstName lastName email phone')
                .populate('patient', 'firstName lastName email phone');

            if (!appointment) {
                throw new Error('Appointment not found');
            }
            return appointment;
        } catch (error) {
            logger.logError('Error getting appointment by ID:', error);
            throw error;
        }
    }

    /**
     * Get appointments with pagination
     * @param {Object} query - Query parameters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated appointments
     */
    async getAppointments(query = {}, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [appointments, total] = await Promise.all([
                Appointment.find(query)
                    .populate('doctor', 'firstName lastName email phone')
                    .populate('patient', 'firstName lastName email phone')
                    .skip(skip)
                    .limit(limit)
                    .sort({ date: -1, time: -1 }),
                Appointment.countDocuments(query)
            ]);

            return {
                appointments,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.logError('Error getting appointments:', error);
            throw error;
        }
    }

    /**
     * Update appointment
     * @param {string} appointmentId - Appointment ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated appointment
     */
    async updateAppointment(appointmentId, updateData) {
        try {
            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                throw new Error('Appointment not found');
            }

            // Check for scheduling conflicts if date or time is being updated
            if (updateData.date || updateData.time) {
                const existingAppointment = await Appointment.findOne({
                    _id: { $ne: appointmentId },
                    doctor: appointment.doctor,
                    date: updateData.date || appointment.date,
                    time: updateData.time || appointment.time,
                    status: { $in: ['scheduled', 'confirmed'] }
                });

                if (existingAppointment) {
                    throw new Error('Time slot is already booked');
                }
            }

            const updatedAppointment = await Appointment.findByIdAndUpdate(
                appointmentId,
                { $set: updateData },
                { new: true, runValidators: true }
            )
            .populate('doctor', 'firstName lastName email phone')
            .populate('patient', 'firstName lastName email phone');

            return updatedAppointment;
        } catch (error) {
            logger.logError('Error updating appointment:', error);
            throw error;
        }
    }

    /**
     * Cancel appointment
     * @param {string} appointmentId - Appointment ID
     * @param {string} reason - Cancellation reason
     * @returns {Promise<Object>} Updated appointment
     */
    async cancelAppointment(appointmentId, reason) {
        try {
            return this.updateAppointment(appointmentId, {
                status: 'cancelled',
                cancellationReason: reason,
                cancelledAt: new Date()
            });
        } catch (error) {
            logger.logError('Error cancelling appointment:', error);
            throw error;
        }
    }

    /**
     * Complete appointment
     * @param {string} appointmentId - Appointment ID
     * @param {Object} completionData - Completion data
     * @returns {Promise<Object>} Updated appointment
     */
    async completeAppointment(appointmentId, completionData) {
        try {
            return this.updateAppointment(appointmentId, {
                status: 'completed',
                completedAt: new Date(),
                ...completionData
            });
        } catch (error) {
            logger.logError('Error completing appointment:', error);
            throw error;
        }
    }

    /**
     * Get available time slots
     * @param {string} doctorId - Doctor ID
     * @param {Date} date - Date to check
     * @returns {Promise<Array>} Available time slots
     */
    async getAvailableTimeSlots(doctorId, date) {
        try {
            const doctor = await User.findOne({
                _id: doctorId,
                role: 'doctor',
                isActive: true
            });

            if (!doctor) {
                throw new Error('Doctor not found or not available');
            }

            const bookedSlots = await Appointment.find({
                doctor: doctorId,
                date: date,
                status: { $in: ['scheduled', 'confirmed'] }
            }).select('time');

            const bookedTimes = bookedSlots.map(slot => slot.time);
            const availableSlots = doctor.workingHours
                .filter(slot => !bookedTimes.includes(slot.time))
                .map(slot => slot.time);

            return availableSlots;
        } catch (error) {
            logger.logError('Error getting available time slots:', error);
            throw error;
        }
    }

    /**
     * Get appointment statistics
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} Appointment statistics
     */
    async getAppointmentStats(filters = {}) {
        try {
            const [
                total,
                completed,
                cancelled,
                noShow,
                upcoming
            ] = await Promise.all([
                Appointment.countDocuments(filters),
                Appointment.countDocuments({ ...filters, status: 'completed' }),
                Appointment.countDocuments({ ...filters, status: 'cancelled' }),
                Appointment.countDocuments({ ...filters, status: 'no-show' }),
                Appointment.countDocuments({
                    ...filters,
                    date: { $gte: new Date() },
                    status: { $in: ['scheduled', 'confirmed'] }
                })
            ]);

            return {
                total,
                completed,
                cancelled,
                noShow,
                upcoming,
                completionRate: total ? (completed / total) * 100 : 0,
                cancellationRate: total ? (cancelled / total) * 100 : 0,
                noShowRate: total ? (noShow / total) * 100 : 0
            };
        } catch (error) {
            logger.logError('Error getting appointment statistics:', error);
            throw error;
        }
    }

    /**
     * Get appointments by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Appointments in date range
     */
    async getAppointmentsByDateRange(startDate, endDate, filters = {}) {
        try {
            return await Appointment.find({
                date: { $gte: startDate, $lte: endDate },
                ...filters
            })
            .populate('doctor', 'firstName lastName email phone')
            .populate('patient', 'firstName lastName email phone')
            .sort({ date: 1, time: 1 });
        } catch (error) {
            logger.logError('Error getting appointments by date range:', error);
            throw error;
        }
    }
}

module.exports = new AppointmentService();

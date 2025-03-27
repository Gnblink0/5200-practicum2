const User = require('../User');
const Appointment = require('../Appointment');
const MedicalRecord = require('../MedicalRecord');
const Prescription = require('../Prescription');
const logger = require('../../utils/logger');

class DoctorService {
    /**
     * Get all doctors with pagination
     * @param {Object} query - Query parameters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated doctors
     */
    async getDoctors(query = {}, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [doctors, total] = await Promise.all([
                User.find({ role: 'doctor', ...query })
                    .select('-password')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                User.countDocuments({ role: 'doctor', ...query })
            ]);

            return {
                doctors,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.logError('Error getting doctors:', error);
            throw error;
        }
    }

    /**
     * Get doctor by ID
     * @param {string} doctorId - Doctor ID
     * @returns {Promise<Object>} Doctor object
     */
    async getDoctorById(doctorId) {
        try {
            const doctor = await User.findOne({ _id: doctorId, role: 'doctor' })
                .select('-password');
            
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            return doctor;
        } catch (error) {
            logger.logError('Error getting doctor by ID:', error);
            throw error;
        }
    }

    /**
     * Get doctor's appointments
     * @param {string} doctorId - Doctor ID
     * @param {Object} filters - Appointment filters
     * @returns {Promise<Array>} Doctor's appointments
     */
    async getDoctorAppointments(doctorId, filters = {}) {
        try {
            return await Appointment.find({
                doctor: doctorId,
                ...filters
            })
            .populate('patient', 'firstName lastName email phone')
            .sort({ date: -1, time: -1 });
        } catch (error) {
            logger.logError('Error getting doctor appointments:', error);
            throw error;
        }
    }

    /**
     * Get doctor's upcoming appointments
     * @param {string} doctorId - Doctor ID
     * @returns {Promise<Array>} Doctor's upcoming appointments
     */
    async getDoctorUpcomingAppointments(doctorId) {
        try {
            return await Appointment.find({
                doctor: doctorId,
                date: { $gte: new Date() },
                status: { $in: ['scheduled', 'confirmed'] }
            })
            .populate('patient', 'firstName lastName email phone')
            .sort({ date: 1, time: 1 });
        } catch (error) {
            logger.logError('Error getting doctor upcoming appointments:', error);
            throw error;
        }
    }

    /**
     * Get doctor's past appointments
     * @param {string} doctorId - Doctor ID
     * @returns {Promise<Array>} Doctor's past appointments
     */
    async getDoctorPastAppointments(doctorId) {
        try {
            return await Appointment.find({
                doctor: doctorId,
                date: { $lt: new Date() }
            })
            .populate('patient', 'firstName lastName email phone')
            .sort({ date: -1, time: -1 });
        } catch (error) {
            logger.logError('Error getting doctor past appointments:', error);
            throw error;
        }
    }

    /**
     * Get doctor's patients
     * @param {string} doctorId - Doctor ID
     * @returns {Promise<Array>} Doctor's patients
     */
    async getDoctorPatients(doctorId) {
        try {
            const appointments = await Appointment.find({ doctor: doctorId })
                .distinct('patient');
            
            return await User.find({
                _id: { $in: appointments },
                role: 'patient'
            }).select('-password');
        } catch (error) {
            logger.logError('Error getting doctor patients:', error);
            throw error;
        }
    }

    /**
     * Get doctor's schedule
     * @param {string} doctorId - Doctor ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<Array>} Doctor's schedule
     */
    async getDoctorSchedule(doctorId, startDate, endDate) {
        try {
            return await Appointment.find({
                doctor: doctorId,
                date: { $gte: startDate, $lte: endDate }
            })
            .populate('patient', 'firstName lastName email phone')
            .sort({ date: 1, time: 1 });
        } catch (error) {
            logger.logError('Error getting doctor schedule:', error);
            throw error;
        }
    }

    /**
     * Update doctor's availability
     * @param {string} doctorId - Doctor ID
     * @param {Object} availability - Availability settings
     * @returns {Promise<Object>} Updated doctor
     */
    async updateDoctorAvailability(doctorId, availability) {
        try {
            const allowedFields = [
                'workingHours',
                'daysOff',
                'specialties',
                'consultationFee',
                'availability'
            ];

            const updateData = Object.keys(availability)
                .filter(key => allowedFields.includes(key))
                .reduce((obj, key) => {
                    obj[key] = availability[key];
                    return obj;
                }, {});

            return await User.findByIdAndUpdate(
                doctorId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select('-password');
        } catch (error) {
            logger.logError('Error updating doctor availability:', error);
            throw error;
        }
    }

    /**
     * Get doctor's statistics
     * @param {string} doctorId - Doctor ID
     * @returns {Promise<Object>} Doctor's statistics
     */
    async getDoctorStats(doctorId) {
        try {
            const [
                totalAppointments,
                completedAppointments,
                totalPatients,
                totalPrescriptions,
                totalMedicalRecords
            ] = await Promise.all([
                Appointment.countDocuments({ doctor: doctorId }),
                Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
                Appointment.distinct('patient', { doctor: doctorId }).then(ids => ids.length),
                Prescription.countDocuments({ doctor: doctorId }),
                MedicalRecord.countDocuments({ doctor: doctorId })
            ]);

            return {
                totalAppointments,
                completedAppointments,
                totalPatients,
                totalPrescriptions,
                totalMedicalRecords,
                completionRate: totalAppointments ? (completedAppointments / totalAppointments) * 100 : 0
            };
        } catch (error) {
            logger.logError('Error getting doctor statistics:', error);
            throw error;
        }
    }

    /**
     * Get doctor's performance metrics
     * @param {string} doctorId - Doctor ID
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Promise<Object>} Doctor's performance metrics
     */
    async getDoctorPerformance(doctorId, startDate, endDate) {
        try {
            const [
                appointments,
                prescriptions,
                medicalRecords
            ] = await Promise.all([
                Appointment.find({
                    doctor: doctorId,
                    date: { $gte: startDate, $lte: endDate }
                }),
                Prescription.find({
                    doctor: doctorId,
                    createdAt: { $gte: startDate, $lte: endDate }
                }),
                MedicalRecord.find({
                    doctor: doctorId,
                    createdAt: { $gte: startDate, $lte: endDate }
                })
            ]);

            return {
                appointmentCount: appointments.length,
                completedAppointments: appointments.filter(a => a.status === 'completed').length,
                prescriptionCount: prescriptions.length,
                medicalRecordCount: medicalRecords.length,
                averageAppointmentDuration: appointments.reduce((acc, curr) => acc + curr.duration, 0) / appointments.length || 0
            };
        } catch (error) {
            logger.logError('Error getting doctor performance:', error);
            throw error;
        }
    }
}

module.exports = new DoctorService();

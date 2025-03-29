const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient ID is required']
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor ID is required']
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment date is required']
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    notes: {
        type: String,
        trim: true
    },
    mode: {
        type: String,
        enum: ['in-person', 'telehealth'],
        default: 'in-person'
    }
}, {
    timestamps: true
});

// Index for faster queries
AppointmentSchema.index({ patientId: 1, doctorId: 1 });
AppointmentSchema.index({ appointmentDate: 1, status: 1 });

// Validation to ensure end time is after start time
AppointmentSchema.pre('validate', function(next) {
    if (this.startTime && this.endTime && this.startTime >= this.endTime) {
        next(new Error('End time must be after start time'));
    }
    next();
});

// Static method to find appointments by patient
AppointmentSchema.statics.findByPatient = function(patientId) {
    return this.find({ patientId }).populate('doctorId');
};

// Static method to find appointments by doctor
AppointmentSchema.statics.findByDoctor = function(doctorId) {
    return this.find({ doctorId }).populate('patientId');
};

const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
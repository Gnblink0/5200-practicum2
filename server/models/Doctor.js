const mongoose = require('mongoose');
const User = require('./User');

const DoctorSchema = User.discriminator('Doctor', new mongoose.Schema({
    personalInfo: {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true
        }
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        trim: true
    },
    licenseNumber: {
        type: String,
        required: [true, 'Medical license number is required'],
        unique: true
    },
    qualifications: [String],
    availableSlots: [{
        day: {
            type: Date,
            required: [true, 'Available day is required']
        },
        timeSlots: [{
            startTime: {
                type: Date,
                required: [true, 'Start time is required']
            },
            endTime: {
                type: Date,
                required: [true, 'End time is required']
            },
            isBooked: {
                type: Boolean,
                default: false
            }
        }]
    }],
    consultationFee: {
        type: Number,
        required: [true, 'Consultation fee is required'],
        min: [0, 'Consultation fee cannot be negative']
    }
}, {
    timestamps: true
}));

// Virtual for full name
DoctorSchema.virtual('fullName').get(function() {
    return `Dr. ${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Static method to find by specialization
DoctorSchema.statics.findBySpecialization = function(specialization) {
    return this.find({ specialization: new RegExp(specialization, 'i') });
};

// Method to check slot availability
DoctorSchema.methods.checkSlotAvailability = function(requestedStart, requestedEnd) {
    return this.availableSlots.some(slot => 
        slot.timeSlots.some(timeSlot => 
            !timeSlot.isBooked && 
            requestedStart >= timeSlot.startTime && 
            requestedEnd <= timeSlot.endTime
        )
    );
};

module.exports = mongoose.model('Doctor', DoctorSchema);
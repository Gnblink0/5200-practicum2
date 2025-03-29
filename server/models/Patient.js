const mongoose = require('mongoose');
const User = require('./User');

const PatientSchema = User.discriminator('Patient', new mongoose.Schema({
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
        },
        dateOfBirth: {
            type: Date,
            required: [true, 'Date of birth is required']
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer not to say'],
            required: [true, 'Gender is required']
        }
    },
    medicalHistory: [{
        condition: {
            type: String,
            required: [true, 'Condition is required']
        },
        diagnosisDate: Date,
        notes: String,
        attachments: [String]
    }],
    insuranceInfo: {
        provider: String,
        policyNumber: {
            type: String,
            trim: true
        },
        coverageDetails: String
    },
    emergencyContacts: [{
        name: {
            type: String,
            required: [true, 'Emergency contact name is required']
        },
        relationship: {
            type: String,
            required: [true, 'Relationship is required']
        },
        phone: {
            type: String,
            required: [true, 'Emergency contact phone is required'],
            match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
        }
    }]
}, {
    timestamps: true
}));

// Virtuals
PatientSchema.virtual('fullName').get(function() {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Static method to find by name
PatientSchema.statics.findByName = function(firstName, lastName) {
    return this.findOne({
        'personalInfo.firstName': firstName,
        'personalInfo.lastName': lastName
    });
};

module.exports = mongoose.model('Patient', PatientSchema);
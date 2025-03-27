const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visitDate: {
        type: Date,
        required: true
    },
    diagnosis: {
        type: String,
        required: true,
        trim: true
    },
    symptoms: [{
        type: String,
        trim: true
    }],
    treatment: {
        type: String,
        trim: true
    },
    medications: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String
    }],
    labResults: [{
        testName: String,
        result: String,
        date: Date,
        referenceRange: String
    }],
    vitalSigns: {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        oxygenSaturation: Number,
        respiratoryRate: Number
    },
    allergies: [{
        allergen: String,
        severity: String,
        reaction: String
    }],
    chronicConditions: [{
        condition: String,
        diagnosisDate: Date,
        status: String
    }],
    immunizations: [{
        vaccine: String,
        date: Date,
        nextDueDate: Date,
        provider: String
    }],
    familyHistory: [{
        condition: String,
        relation: String
    }],
    lifestyle: {
        smoking: Boolean,
        alcohol: Boolean,
        exercise: String,
        diet: String
    },
    notes: {
        type: String,
        trim: true
    },
    attachments: [{
        filename: String,
        path: String,
        type: String,
        uploadDate: Date
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
medicalHistorySchema.index({ patientId: 1, visitDate: -1 });
medicalHistorySchema.index({ doctorId: 1, visitDate: -1 });

// Pre-save middleware to update lastUpdatedBy
medicalHistorySchema.pre('save', function(next) {
    if (this.isModified()) {
        this.lastUpdatedBy = this._doc.lastUpdatedBy;
    }
    next();
});

// Method to get recent visits
medicalHistorySchema.methods.getRecentVisits = async function(limit = 5) {
    const MedicalHistory = mongoose.model('MedicalHistory');
    return await MedicalHistory.find({ patientId: this.patientId })
        .sort({ visitDate: -1 })
        .limit(limit);
};

// Method to get chronic conditions
medicalHistorySchema.methods.getChronicConditions = async function() {
    return this.chronicConditions.filter(condition => condition.status === 'active');
};

// Method to get upcoming immunizations
medicalHistorySchema.methods.getUpcomingImmunizations = async function() {
    const today = new Date();
    return this.immunizations.filter(immunization => 
        immunization.nextDueDate && immunization.nextDueDate > today
    );
};

// Method to add lab result
medicalHistorySchema.methods.addLabResult = async function(labResult) {
    this.labResults.push(labResult);
    await this.save();
};

// Method to add medication
medicalHistorySchema.methods.addMedication = async function(medication) {
    this.medications.push(medication);
    await this.save();
};

// Method to update vital signs
medicalHistorySchema.methods.updateVitalSigns = async function(vitalSigns) {
    this.vitalSigns = { ...this.vitalSigns, ...vitalSigns };
    await this.save();
};

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);

module.exports = MedicalHistory; 
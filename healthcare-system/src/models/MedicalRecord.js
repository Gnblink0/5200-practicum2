const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    diagnosis: { type: String, required: true },
    treatment: { type: String },
    medications: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    symptoms: [String],
    vitalSigns: {
        bloodPressure: String,
        heartRate: Number,
        temperature: Number,
        oxygenLevel: Number,
        weight: Number,
        height: Number
    },
    labResults: [{
        testName: String,
        result: String,
        referenceRange: String,
        date: Date
    }],
    imagingResults: [{
        type: String,
        date: Date,
        findings: String,
        imageUrl: String
    }],
    notes: { type: String },
    attachments: [{
        filename: String,
        path: String,
        type: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    allergies: [String],
    chronicConditions: [String],
    familyHistory: [String],
    lifestyle: {
        smoking: Boolean,
        alcohol: Boolean,
        exercise: String,
        diet: String
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted'],
        default: 'active'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ doctor: 1, createdAt: -1 });
medicalRecordSchema.index({ diagnosis: 1 });
medicalRecordSchema.index({ 'medications.name': 1 });

// Middleware
medicalRecordSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Methods
medicalRecordSchema.methods.addMedication = async function(medication) {
    this.medications.push(medication);
    await this.save();
};

medicalRecordSchema.methods.updateVitalSigns = async function(vitalSigns) {
    this.vitalSigns = { ...this.vitalSigns, ...vitalSigns };
    await this.save();
};

medicalRecordSchema.methods.addLabResult = async function(labResult) {
    this.labResults.push(labResult);
    await this.save();
};

medicalRecordSchema.methods.addImagingResult = async function(imagingResult) {
    this.imagingResults.push(imagingResult);
    await this.save();
};

medicalRecordSchema.methods.addAttachment = async function(attachment) {
    this.attachments.push(attachment);
    await this.save();
};

medicalRecordSchema.methods.updateAllergies = async function(allergies) {
    this.allergies = allergies;
    await this.save();
};

medicalRecordSchema.methods.updateChronicConditions = async function(conditions) {
    this.chronicConditions = conditions;
    await this.save();
};

medicalRecordSchema.methods.updateFamilyHistory = async function(history) {
    this.familyHistory = history;
    await this.save();
};

medicalRecordSchema.methods.updateLifestyle = async function(lifestyle) {
    this.lifestyle = { ...this.lifestyle, ...lifestyle };
    await this.save();
};

// Static methods
medicalRecordSchema.statics.findByPatient = function(patientId) {
    return this.find({ patient: patientId, status: 'active' }).sort({ createdAt: -1 });
};

medicalRecordSchema.statics.findByDoctor = function(doctorId) {
    return this.find({ doctor: doctorId, status: 'active' }).sort({ createdAt: -1 });
};

medicalRecordSchema.statics.findByDiagnosis = function(diagnosis) {
    return this.find({ diagnosis, status: 'active' }).sort({ createdAt: -1 });
};

medicalRecordSchema.statics.findByMedication = function(medicationName) {
    return this.find({
        'medications.name': medicationName,
        status: 'active'
    }).sort({ createdAt: -1 });
};

// Virtual properties
medicalRecordSchema.virtual('age').get(function() {
    return this.createdAt ? Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24)) : null;
});

// Instance methods for record management
medicalRecordSchema.methods.archive = async function() {
    this.status = 'archived';
    await this.save();
};

medicalRecordSchema.methods.restore = async function() {
    this.status = 'active';
    await this.save();
};

medicalRecordSchema.methods.delete = async function() {
    this.status = 'deleted';
    await this.save();
};

// Static methods for record queries
medicalRecordSchema.statics.findByDateRange = function(startDate, endDate) {
    return this.find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'active'
    }).sort({ createdAt: -1 });
};

medicalRecordSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

medicalRecordSchema.statics.findWithLabResults = function() {
    return this.find({
        'labResults.0': { $exists: true },
        status: 'active'
    }).sort({ createdAt: -1 });
};

medicalRecordSchema.statics.findWithImagingResults = function() {
    return this.find({
        'imagingResults.0': { $exists: true },
        status: 'active'
    }).sort({ createdAt: -1 });
};

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord; 
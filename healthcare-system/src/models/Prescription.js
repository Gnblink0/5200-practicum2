const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medications: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: String,
        startDate: { type: Date },
        endDate: { type: Date },
        refills: { type: Number, default: 0 },
        refillRemaining: { type: Number, default: 0 }
    }],
    notes: { type: String },
    diagnosis: { type: String },
    status: { 
        type: String, 
        enum: ['active', 'completed', 'cancelled', 'expired'],
        default: 'active'
    },
    priority: {
        type: String,
        enum: ['normal', 'urgent', 'emergency'],
        default: 'normal'
    },
    pharmacy: {
        name: String,
        address: String,
        phone: String
    },
    refillHistory: [{
        date: { type: Date, default: Date.now },
        medication: String,
        quantity: String,
        refilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    sideEffects: [{
        medication: String,
        effect: String,
        severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
        reportedAt: { type: Date, default: Date.now }
    }],
    attachments: [{
        filename: String,
        path: String,
        type: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
prescriptionSchema.index({ patient: 1, status: 1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
prescriptionSchema.index({ 'medications.name': 1 });
prescriptionSchema.index({ priority: 1 });

// Middleware
prescriptionSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Methods
prescriptionSchema.methods.addMedication = async function(medication) {
    this.medications.push(medication);
    await this.save();
};

prescriptionSchema.methods.updateMedication = async function(medicationId, updates) {
    const medication = this.medications.id(medicationId);
    if (medication) {
        Object.assign(medication, updates);
        await this.save();
    }
};

prescriptionSchema.methods.removeMedication = async function(medicationId) {
    this.medications.pull(medicationId);
    await this.save();
};

prescriptionSchema.methods.complete = async function() {
    this.status = 'completed';
    await this.save();
};

prescriptionSchema.methods.cancel = async function() {
    this.status = 'cancelled';
    await this.save();
};

prescriptionSchema.methods.expire = async function() {
    this.status = 'expired';
    await this.save();
};

prescriptionSchema.methods.addRefill = async function(medicationId, quantity, refilledBy) {
    const medication = this.medications.id(medicationId);
    if (medication) {
        medication.refillRemaining--;
        this.refillHistory.push({
            medication: medication.name,
            quantity,
            refilledBy
        });
        await this.save();
    }
};

prescriptionSchema.methods.reportSideEffect = async function(medicationName, effect, severity) {
    this.sideEffects.push({
        medication: medicationName,
        effect,
        severity
    });
    await this.save();
};

// Static methods
prescriptionSchema.statics.findByPatient = function(patientId) {
    return this.find({ patient: patientId }).sort({ createdAt: -1 });
};

prescriptionSchema.statics.findByDoctor = function(doctorId) {
    return this.find({ doctor: doctorId }).sort({ createdAt: -1 });
};

prescriptionSchema.statics.findActive = function() {
    return this.find({ status: 'active' }).sort({ createdAt: -1 });
};

prescriptionSchema.statics.findUrgent = function() {
    return this.find({
        priority: 'urgent',
        status: 'active'
    }).sort({ createdAt: -1 });
};

// Virtual properties
prescriptionSchema.virtual('isActive').get(function() {
    return this.status === 'active';
});

prescriptionSchema.virtual('hasRefills').get(function() {
    return this.medications.some(med => med.refillRemaining > 0);
});

// Instance methods for prescription management
prescriptionSchema.methods.updateNotes = async function(notes) {
    this.notes = notes;
    await this.save();
};

prescriptionSchema.methods.updateDiagnosis = async function(diagnosis) {
    this.diagnosis = diagnosis;
    await this.save();
};

prescriptionSchema.methods.updatePharmacy = async function(pharmacy) {
    this.pharmacy = pharmacy;
    await this.save();
};

prescriptionSchema.methods.addAttachment = async function(attachment) {
    this.attachments.push(attachment);
    await this.save();
};

// Static methods for prescription queries
prescriptionSchema.statics.findByDateRange = function(startDate, endDate) {
    return this.find({
        createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
};

prescriptionSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

prescriptionSchema.statics.findByMedication = function(medicationName) {
    return this.find({
        'medications.name': medicationName
    }).sort({ createdAt: -1 });
};

prescriptionSchema.statics.findWithSideEffects = function() {
    return this.find({
        'sideEffects.0': { $exists: true }
    }).sort({ createdAt: -1 });
};

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription; 
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    type: { type: String, required: true },
    notes: { type: String },
    symptoms: { type: String },
    duration: { type: Number, default: 30 }, // Duration in minutes
    location: { type: String },
    isUrgent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    cancellationReason: { type: String },
    followUp: { type: Boolean, default: false },
    followUpDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });
appointmentSchema.index({ isUrgent: 1, date: 1 });

// Middleware
appointmentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Methods
appointmentSchema.methods.confirm = async function() {
    this.status = 'confirmed';
    await this.save();
};

appointmentSchema.methods.complete = async function() {
    this.status = 'completed';
    await this.save();
};

appointmentSchema.methods.cancel = async function(reason) {
    this.status = 'cancelled';
    this.cancellationReason = reason;
    await this.save();
};

appointmentSchema.methods.markNoShow = async function() {
    this.status = 'no-show';
    await this.save();
};

appointmentSchema.methods.scheduleFollowUp = async function(followUpDate) {
    this.followUp = true;
    this.followUpDate = followUpDate;
    await this.save();
};

// Static methods
appointmentSchema.statics.findByPatient = function(patientId) {
    return this.find({ patient: patientId }).sort({ date: 1 });
};

appointmentSchema.statics.findByDoctor = function(doctorId) {
    return this.find({ doctor: doctorId }).sort({ date: 1 });
};

appointmentSchema.statics.findUpcoming = function() {
    return this.find({
        date: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
    }).sort({ date: 1 });
};

appointmentSchema.statics.findUrgent = function() {
    return this.find({
        isUrgent: true,
        status: { $in: ['scheduled', 'confirmed'] }
    }).sort({ date: 1 });
};

// Virtual properties
appointmentSchema.virtual('isPast').get(function() {
    return this.date < new Date();
});

appointmentSchema.virtual('isUpcoming').get(function() {
    return this.date > new Date();
});

appointmentSchema.virtual('isToday').get(function() {
    const today = new Date();
    return this.date.toDateString() === today.toDateString();
});

// Instance methods for appointment management
appointmentSchema.methods.updateNotes = async function(notes) {
    this.notes = notes;
    await this.save();
};

appointmentSchema.methods.updateSymptoms = async function(symptoms) {
    this.symptoms = symptoms;
    await this.save();
};

appointmentSchema.methods.markReminderSent = async function() {
    this.reminderSent = true;
    await this.save();
};

appointmentSchema.methods.setUrgent = async function(isUrgent) {
    this.isUrgent = isUrgent;
    await this.save();
};

// Static methods for appointment queries
appointmentSchema.statics.findByDateRange = function(startDate, endDate) {
    return this.find({
        date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
};

appointmentSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ date: 1 });
};

appointmentSchema.statics.findConflicts = function(doctorId, date, time, duration) {
    const startTime = new Date(date);
    const [hours, minutes] = time.split(':');
    startTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    return this.find({
        doctor: doctorId,
        date: date,
        status: { $in: ['scheduled', 'confirmed'] },
        $or: [
            {
                time: {
                    $gte: time,
                    $lt: endTime.toTimeString().slice(0, 5)
                }
            },
            {
                time: {
                    $gt: startTime.toTimeString().slice(0, 5),
                    $lte: time
                }
            }
        ]
    });
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 
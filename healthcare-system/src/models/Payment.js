const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
        default: 'pending'
    },
    method: { type: String, required: true },
    transactionId: { type: String },
    description: { type: String },
    items: [{
        name: String,
        quantity: Number,
        price: Number,
        total: Number
    }],
    discount: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    paymentDetails: {
        cardLast4: String,
        cardBrand: String,
        paymentMethodId: String
    },
    refundHistory: [{
        amount: Number,
        reason: String,
        status: String,
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        processedAt: { type: Date, default: Date.now }
    }],
    billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    receipt: {
        url: String,
        number: String,
        date: Date
    },
    notes: String,
    metadata: {
        appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
        prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
        insuranceClaimId: String
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
paymentSchema.index({ patient: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ 'metadata.appointmentId': 1 });
paymentSchema.index({ 'metadata.prescriptionId': 1 });

// Middleware
paymentSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Methods
paymentSchema.methods.complete = async function(transactionId) {
    this.status = 'completed';
    this.transactionId = transactionId;
    await this.save();
};

paymentSchema.methods.fail = async function() {
    this.status = 'failed';
    await this.save();
};

paymentSchema.methods.refund = async function(amount, reason, processedBy) {
    const refundAmount = amount || this.total;
    this.refundHistory.push({
        amount: refundAmount,
        reason,
        status: 'completed',
        processedBy
    });

    if (refundAmount === this.total) {
        this.status = 'refunded';
    } else {
        this.status = 'partially_refunded';
    }

    await this.save();
};

paymentSchema.methods.updatePaymentDetails = async function(details) {
    this.paymentDetails = { ...this.paymentDetails, ...details };
    await this.save();
};

paymentSchema.methods.updateBillingAddress = async function(address) {
    this.billingAddress = address;
    await this.save();
};

paymentSchema.methods.addReceipt = async function(receipt) {
    this.receipt = receipt;
    await this.save();
};

// Static methods
paymentSchema.statics.findByPatient = function(patientId) {
    return this.find({ patient: patientId }).sort({ createdAt: -1 });
};

paymentSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

paymentSchema.statics.findByTransactionId = function(transactionId) {
    return this.findOne({ transactionId });
};

paymentSchema.statics.findByDateRange = function(startDate, endDate) {
    return this.find({
        createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });
};

// Virtual properties
paymentSchema.virtual('refundedAmount').get(function() {
    return this.refundHistory.reduce((sum, refund) => sum + refund.amount, 0);
});

paymentSchema.virtual('remainingAmount').get(function() {
    return this.total - this.refundedAmount;
});

// Instance methods for payment management
paymentSchema.methods.updateNotes = async function(notes) {
    this.notes = notes;
    await this.save();
};

paymentSchema.methods.updateMetadata = async function(metadata) {
    this.metadata = { ...this.metadata, ...metadata };
    await this.save();
};

paymentSchema.methods.addItem = async function(item) {
    this.items.push(item);
    this.calculateTotal();
    await this.save();
};

paymentSchema.methods.removeItem = async function(itemId) {
    this.items.pull(itemId);
    this.calculateTotal();
    await this.save();
};

// Static methods for payment queries
paymentSchema.statics.findByAppointment = function(appointmentId) {
    return this.find({ 'metadata.appointmentId': appointmentId }).sort({ createdAt: -1 });
};

paymentSchema.statics.findByPrescription = function(prescriptionId) {
    return this.find({ 'metadata.prescriptionId': prescriptionId }).sort({ createdAt: -1 });
};

paymentSchema.statics.findRefunded = function() {
    return this.find({
        status: { $in: ['refunded', 'partially_refunded'] }
    }).sort({ createdAt: -1 });
};

paymentSchema.statics.findPending = function() {
    return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

// Helper method to calculate total
paymentSchema.methods.calculateTotal = function() {
    const itemsTotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.total = itemsTotal - this.discount + this.tax;
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 
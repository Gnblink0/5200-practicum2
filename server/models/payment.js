const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, 'Appointment ID is required']
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: [true, 'Patient ID is required']
    },
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0, 'Payment amount cannot be negative']
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'insurance', 'cash'],
        required: [true, 'Payment method is required']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    paymentDetails: {
        cardLastFour: {
            type: String,
            validate: {
                validator: function(v) {
                    return /^\d{4}$/.test(v);
                },
                message: 'Card last four digits must be a 4-digit number'
            }
        },
        transactionId: {
            type: String,
            unique: true
        }
    }
}, {
    timestamps: true
});

// Index for faster queries
PaymentSchema.index({ patientId: 1, status: 1 });
PaymentSchema.index({ appointmentId: 1 });

// Static method to find payments by patient
PaymentSchema.statics.findByPatient = function(patientId, status) {
    const query = { patientId };
    if (status) query.status = status;
    return this.find(query).populate('appointmentId');
};

// Method to generate a unique transaction ID
PaymentSchema.methods.generateTransactionId = function() {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment;
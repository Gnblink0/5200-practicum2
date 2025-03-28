// Healthcare Appointment System MongoDB Schema

// User Collection (Base for all user types)
const UserSchema = {
    _id: ObjectId,
    username: String,
    email: String,
    passwordHash: String,
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        required: true
    },
    contactInfo: {
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String
        }
    },
}

// Patient Collection (Extends User)
const PatientSchema = {
    _id: ObjectId,
    userId: ObjectId, // Reference to User collection
    personalInfo: {
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        gender: String
    },
    medicalHistory: [{
        condition: String,
        diagnosisDate: Date,
        notes: String,
        attachments: [String] // URLs to medical documents
    }],
    insuranceInfo: {
        provider: String,
        policyNumber: String,
        coverageDetails: String
    },
    emergencyContacts: [{
        name: String,
        relationship: String,
        phone: String
    }]
}

// Doctor Collection (Extends User)
const DoctorSchema = {
    _id: ObjectId,
    userId: ObjectId, // Reference to User collection
    personalInfo: {
        firstName: String,
        lastName: String
    },
    specialization: String,
    licenseNumber: String,
    qualifications: [String],
    availableSlots: [{
        day: Date,
        timeSlots: [{
            startTime: Date,
            endTime: Date,
            isBooked: Boolean
        }]
    }],
    consultationFee: Number
}

// Admin Collection
const AdminSchema = {
    _id: ObjectId,
    userId: ObjectId, // Reference to User collection
    personalInfo: {
        firstName: String,
        lastName: String
    },
    permissions: {
        type: [String],
        enum: [
            'user_management',     // Create/modify/delete user accounts
            'system_configuration', // Manage system-wide settings
            'reporting',            // Access and generate system reports
            'billing_management',   // Oversee financial transactions
            'audit_logs',           // View system access and activity logs
            'medical_record_review' // Review and manage medical records
        ]
    },
    // Audit trail for admin actions
    activityLog: [{
        action: String,
        timestamp: Date,
        details: Object,
        performedBy: ObjectId // Reference to the admin who performed the action
    }]
}

// Appointment Collection
const AppointmentSchema = {
    _id: ObjectId,
    patientId: ObjectId, // Reference to Patient collection
    doctorId: ObjectId, // Reference to Doctor collection
    appointmentDate: Date,
    startTime: Date,
    endTime: Date,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    reason: String,
    notes: String,
    mode: {
        type: String,
        enum: ['in-person', 'telehealth'],
        default: 'in-person'
    }
}

// Prescription Collection
const PrescriptionSchema = {
    _id: ObjectId,
    patientId: ObjectId, // Reference to Patient collection
    doctorId: ObjectId, // Reference to Doctor collection
    appointmentId: ObjectId, // Reference to Appointment collection
    medications: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String
    }],
    diagnosis: String,
    issuedDate: Date,
    expiryDate: Date,
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    }
}

// Payment Collection
const PaymentSchema = {
    _id: ObjectId,
    appointmentId: ObjectId, // Reference to Appointment collection
    patientId: ObjectId, // Reference to Patient collection
    amount: Number,
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'insurance', 'cash']
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    transactionDate: Date,
    paymentDetails: {
        cardLastFour: String,
        transactionId: String
    }
}

// Patient Permissions


// Personal Profile

// Create:

// Create own personal profile
// Add emergency contacts
// Add medical history records


// Read:

// View own personal profile
// View own medical history
// View own emergency contacts
// View own appointment records
// View own prescription records
// View own payment records


// Update:

// Update contact information
// Update emergency contact information
// Update insurance information


// Delete:

// Delete emergency contacts
// Delete some medical history records (non-critical information)



// Appointment-related

// Create:

// Create new appointments
// Book doctor's available time slots


// Read:

// View available doctors and time slots
// View own appointment details


// Update:

// Modify unconfirmed appointments
// Update appointment reason and notes


// Delete:

// Cancel unconfirmed appointments



// Doctor Permissions
// Personal Profile

// Create:

// Create own available time slots


// Read:

// View own personal profile
// View own appointment list
// View patient information (only for booked patients)


// Update:

// Update personal profile
// Update available time slots
// Update professional qualifications
// Update consultation fees


// Delete:

// Delete specific available time slots



// Patient and Appointment-related

// Create:

// Create prescriptions
// Add patient medical notes


// Read:

// View patient detailed medical history (booked patients)
// View appointment details
// View own prescription records


// Update:

// Update appointment status
// Update prescription information
// Modify patient medical notes


// Delete:

// Cancel appointments
// Invalidate prescriptions



// Admin Permissions
// User Management

// Create:

// Create user accounts of any type
// Create system configurations
// Create system audit logs


// Read:

// View all user information
// View all appointment records
// View system audit logs
// View financial reports
// View medical records (with restrictions)


// Update:

// Update any user account information
// Modify user permissions
// Update system configurations
// Update medical records (with restrictions)


// Delete:

// Delete user accounts
// Delete invalid system configurations
// Delete expired audit logs



// System Management

// Create:

// Create system-wide settings
// Generate system reports


// Read:

// Access all system reports
// View financial transaction records
// Monitor system activity


// Update:

// Modify system global settings
// Update billing management configurations


// Delete:

// Delete expired or invalid system records
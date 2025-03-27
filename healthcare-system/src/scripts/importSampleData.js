const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

// Load environment variables
require('dotenv').config();

// Sample data with environment variables
const sampleUsers = [
    {
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: process.env.ADMIN_PASSWORD || 'defaultAdminPass123!',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        phone: '123-456-7890',
        isActive: true,
        emailVerified: true
    },
    {
        username: process.env.DOCTOR_USERNAME || 'doctor1',
        email: process.env.DOCTOR_EMAIL || 'doctor@example.com',
        password: process.env.DOCTOR_PASSWORD || 'defaultDoctorPass123!',
        role: 'doctor',
        firstName: 'John',
        lastName: 'Smith',
        phone: '123-456-7891',
        isActive: true,
        emailVerified: true
    },
    {
        username: process.env.PATIENT_USERNAME || 'patient1',
        email: process.env.PATIENT_EMAIL || 'patient@example.com',
        password: process.env.PATIENT_PASSWORD || 'defaultPatientPass123!',
        role: 'patient',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '123-456-7892',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female',
        isActive: true,
        emailVerified: true
    }
];

const sampleAppointments = [
    {
        date: new Date(),
        time: '09:00',
        type: 'General Checkup',
        status: 'scheduled',
        notes: 'Regular health checkup',
        duration: 30,
        isUrgent: false
    },
    {
        date: new Date(Date.now() + 86400000), // Tomorrow
        time: '14:00',
        type: 'Follow-up',
        status: 'confirmed',
        notes: 'Follow-up appointment',
        duration: 30,
        isUrgent: false
    }
];

const sampleMedicalRecords = [
    {
        diagnosis: 'Common Cold',
        treatment: 'Rest and fluids',
        medications: [{
            name: 'Acetaminophen',
            dosage: '500mg',
            frequency: 'Every 6 hours',
            duration: '3 days',
            startDate: new Date()
        }],
        symptoms: ['Fever', 'Cough', 'Sore Throat'],
        vitalSigns: {
            bloodPressure: '120/80',
            heartRate: 72,
            temperature: 37.5,
            oxygenLevel: 98,
            weight: 70,
            height: 170
        }
    }
];

const samplePrescriptions = [
    {
        medications: [{
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '7 days',
            instructions: 'Take with food',
            startDate: new Date(),
            refills: 1,
            refillRemaining: 1
        }],
        notes: 'For bacterial infection',
        diagnosis: 'Bacterial Infection',
        status: 'active',
        priority: 'normal'
    }
];

const samplePayments = [
    {
        amount: 100,
        type: 'Consultation',
        status: 'completed',
        method: 'Credit Card',
        transactionId: 'TRX123456',
        description: 'Initial consultation fee',
        items: [{
            name: 'Consultation',
            quantity: 1,
            price: 100,
            total: 100
        }],
        total: 100
    }
];

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
        await mongoose.connect(config.database.url, config.database.options);
        logger.logInfo('Connected to MongoDB');
    } catch (error) {
        logger.logError('MongoDB connection error:', error);
        process.exit(1);
    }
};

/**
 * Clear existing data
 */
const clearData = async () => {
    try {
        await Promise.all([
            User.deleteMany({}),
            Appointment.deleteMany({}),
            MedicalRecord.deleteMany({}),
            Prescription.deleteMany({}),
            Payment.deleteMany({})
        ]);
        logger.logInfo('Cleared existing data');
    } catch (error) {
        logger.logError('Error clearing data:', error);
        throw error;
    }
};

/**
 * Create sample users
 */
const createUsers = async () => {
    try {
        const users = await Promise.all(
            sampleUsers.map(async (user) => {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                return User.create({
                    ...user,
                    password: hashedPassword
                });
            })
        );
        logger.logInfo('Created sample users');
        return users;
    } catch (error) {
        logger.logError('Error creating users:', error);
        throw error;
    }
};

/**
 * Create sample appointments
 */
const createAppointments = async (users) => {
    try {
        const doctor = users.find(user => user.role === 'doctor');
        const patient = users.find(user => user.role === 'patient');

        const appointments = await Promise.all(
            sampleAppointments.map(appointment =>
                Appointment.create({
                    ...appointment,
                    doctor: doctor._id,
                    patient: patient._id
                })
            )
        );
        logger.logInfo('Created sample appointments');
        return appointments;
    } catch (error) {
        logger.logError('Error creating appointments:', error);
        throw error;
    }
};

/**
 * Create sample medical records
 */
const createMedicalRecords = async (users) => {
    try {
        const doctor = users.find(user => user.role === 'doctor');
        const patient = users.find(user => user.role === 'patient');

        const medicalRecords = await Promise.all(
            sampleMedicalRecords.map(record =>
                MedicalRecord.create({
                    ...record,
                    doctor: doctor._id,
                    patient: patient._id
                })
            )
        );
        logger.logInfo('Created sample medical records');
        return medicalRecords;
    } catch (error) {
        logger.logError('Error creating medical records:', error);
        throw error;
    }
};

/**
 * Create sample prescriptions
 */
const createPrescriptions = async (users) => {
    try {
        const doctor = users.find(user => user.role === 'doctor');
        const patient = users.find(user => user.role === 'patient');

        const prescriptions = await Promise.all(
            samplePrescriptions.map(prescription =>
                Prescription.create({
                    ...prescription,
                    doctor: doctor._id,
                    patient: patient._id
                })
            )
        );
        logger.logInfo('Created sample prescriptions');
        return prescriptions;
    } catch (error) {
        logger.logError('Error creating prescriptions:', error);
        throw error;
    }
};

/**
 * Create sample payments
 */
const createPayments = async (users) => {
    try {
        const patient = users.find(user => user.role === 'patient');
        const appointments = await Appointment.find({ patient: patient._id });

        const payments = await Promise.all(
            samplePayments.map(payment =>
                Payment.create({
                    ...payment,
                    patient: patient._id,
                    metadata: {
                        appointmentId: appointments[0]._id
                    }
                })
            )
        );
        logger.logInfo('Created sample payments');
        return payments;
    } catch (error) {
        logger.logError('Error creating payments:', error);
        throw error;
    }
};

/**
 * Main function to import sample data
 */
const importSampleData = async () => {
    try {
        await connectDB();
        await clearData();
        
        const users = await createUsers();
        const appointments = await createAppointments(users);
        const medicalRecords = await createMedicalRecords(users);
        const prescriptions = await createPrescriptions(users);
        const payments = await createPayments(users);

        logger.logInfo('Sample data import completed successfully', {
            users: users.length,
            appointments: appointments.length,
            medicalRecords: medicalRecords.length,
            prescriptions: prescriptions.length,
            payments: payments.length
        });

        process.exit(0);
    } catch (error) {
        logger.logError('Error importing sample data:', error);
        process.exit(1);
    }
};

// Run the import
importSampleData();

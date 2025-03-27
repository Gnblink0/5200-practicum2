const config = require('./config');
const logger = require('../utils/logger');

/**
 * Database connection options
 */
const dbOptions = {
    ...config.database.options,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    autoIndex: true,
    autoCreate: true
};

/**
 * Database collections
 */
const collections = {
    USERS: 'users',
    ADMINS: 'admins',
    DOCTORS: 'doctors',
    PATIENTS: 'patients',
    APPOINTMENTS: 'appointments',
    PRESCRIPTIONS: 'prescriptions',
    PAYMENTS: 'payments',
    MEDICAL_RECORDS: 'medical_records',
    AUDIT_LOGS: 'audit_logs',
    FILES: 'files',
    SETTINGS: 'settings',
    MESSAGES: 'messages',
    INSURANCE: 'insurance',
    CACHE: 'cache'
};

/**
 * Database indexes
 */
const indexes = {
    [collections.USERS]: [
        { key: { email: 1 }, unique: true },
        { key: { role: 1 } },
        { key: { createdAt: 1 } }
    ],
    [collections.APPOINTMENTS]: [
        { key: { doctorId: 1, date: 1 } },
        { key: { patientId: 1, date: 1 } },
        { key: { status: 1 } }
    ],
    [collections.PRESCRIPTIONS]: [
        { key: { patientId: 1, date: 1 } },
        { key: { doctorId: 1 } },
        { key: { status: 1 } }
    ],
    [collections.PAYMENTS]: [
        { key: { patientId: 1, date: 1 } },
        { key: { status: 1 } },
        { key: { transactionId: 1 }, unique: true }
    ],
    [collections.MEDICAL_RECORDS]: [
        { key: { patientId: 1, date: 1 } },
        { key: { type: 1 } }
    ],
    [collections.AUDIT_LOGS]: [
        { key: { userId: 1, createdAt: 1 } },
        { key: { action: 1 } },
        { key: { resource: 1 } }
    ],
    [collections.FILES]: [
        { key: { owner: 1 } },
        { key: { type: 1 } },
        { key: { status: 1 } }
    ],
    [collections.CACHE]: [
        { key: { key: 1 }, unique: true },
        { key: { expiresAt: 1 } }
    ]
};

/**
 * Database aggregation pipelines
 */
const pipelines = {
    getUserStats: [
        { $group: {
            _id: '$role',
            count: { $sum: 1 }
        }},
        { $project: {
            role: '$_id',
            count: 1,
            _id: 0
        }}
    ],
    getAppointmentStats: [
        { $group: {
            _id: '$status',
            count: { $sum: 1 }
        }},
        { $project: {
            status: '$_id',
            count: 1,
            _id: 0
        }}
    ],
    getPaymentStats: [
        { $group: {
            _id: '$status',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
        }},
        { $project: {
            status: '$_id',
            total: 1,
            count: 1,
            _id: 0
        }}
    ]
};

/**
 * Database validation rules
 */
const validationRules = {
    [collections.USERS]: {
        email: {
            required: true,
            unique: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        password: {
            required: true,
            minLength: 8
        },
        role: {
            required: true,
            enum: ['admin', 'doctor', 'patient', 'staff']
        }
    },
    [collections.APPOINTMENTS]: {
        doctorId: { required: true },
        patientId: { required: true },
        date: { required: true },
        time: { required: true },
        status: {
            required: true,
            enum: ['scheduled', 'confirmed', 'completed', 'cancelled']
        }
    }
};

/**
 * Database backup options
 */
const backupOptions = {
    enabled: config.backup.enabled,
    schedule: config.backup.schedule,
    retention: config.backup.retention,
    directory: config.backup.directory,
    collections: Object.values(collections),
    compression: true,
    metadata: true
};

/**
 * Database monitoring options
 */
const monitoringOptions = {
    enabled: true,
    interval: 60000, // 1 minute
    metrics: [
        'connections',
        'operations',
        'memory',
        'replication',
        'indexes'
    ],
    alerts: {
        connections: { threshold: 1000 },
        operations: { threshold: 10000 },
        memory: { threshold: 0.8 } // 80%
    }
};

module.exports = {
    dbOptions,
    collections,
    indexes,
    pipelines,
    validationRules,
    backupOptions,
    monitoringOptions
};

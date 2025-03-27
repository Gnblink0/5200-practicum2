const Joi = require('joi');
const { createError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

/**
 * Validate request data against schema
 * @param {Object} schema - Joi schema
 * @param {string} property - Request property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], {
            abortEarly: false,
            allowUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            logger.logError('Validation error', { errors, property });
            return next(createError(400, 'Validation Error', errors));
        }

        next();
    };
};

/**
 * User validation schemas
 */
const userSchemas = {
    create: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        role: Joi.string().valid('admin', 'doctor', 'patient', 'staff').required(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
        dateOfBirth: Joi.date().iso(),
        gender: Joi.string().valid('male', 'female', 'other'),
        address: Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            zipCode: Joi.string(),
            country: Joi.string()
        })
    }),

    update: Joi.object({
        email: Joi.string().email(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
        dateOfBirth: Joi.date().iso(),
        gender: Joi.string().valid('male', 'female', 'other'),
        address: Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            zipCode: Joi.string(),
            country: Joi.string()
        })
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(8).required()
    }),

    resetPassword: Joi.object({
        email: Joi.string().email().required()
    }),

    verifyEmail: Joi.object({
        token: Joi.string().required()
    })
};

/**
 * Appointment validation schemas
 */
const appointmentSchemas = {
    create: Joi.object({
        doctorId: Joi.string().required(),
        date: Joi.date().iso().required(),
        time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        type: Joi.string().valid('checkup', 'consultation', 'emergency', 'follow-up').required(),
        notes: Joi.string().max(500),
        symptoms: Joi.array().items(Joi.string()),
        duration: Joi.number().integer().min(15).max(120)
    }),

    update: Joi.object({
        date: Joi.date().iso(),
        time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        type: Joi.string().valid('checkup', 'consultation', 'emergency', 'follow-up'),
        status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled'),
        notes: Joi.string().max(500),
        symptoms: Joi.array().items(Joi.string()),
        duration: Joi.number().integer().min(15).max(120)
    })
};

/**
 * Prescription validation schemas
 */
const prescriptionSchemas = {
    create: Joi.object({
        patientId: Joi.string().required(),
        medications: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                dosage: Joi.string().required(),
                frequency: Joi.string().required(),
                duration: Joi.string().required(),
                instructions: Joi.string()
            })
        ).required(),
        notes: Joi.string().max(500),
        diagnosis: Joi.string().required()
    }),

    update: Joi.object({
        medications: Joi.array().items(
            Joi.object({
                name: Joi.string().required(),
                dosage: Joi.string().required(),
                frequency: Joi.string().required(),
                duration: Joi.string().required(),
                instructions: Joi.string()
            })
        ),
        notes: Joi.string().max(500),
        diagnosis: Joi.string(),
        status: Joi.string().valid('active', 'completed', 'cancelled')
    })
};

/**
 * Payment validation schemas
 */
const paymentSchemas = {
    create: Joi.object({
        patientId: Joi.string().required(),
        amount: Joi.number().positive().required(),
        method: Joi.string().valid('credit_card', 'debit_card', 'insurance').required(),
        description: Joi.string().required(),
        insuranceDetails: Joi.object({
            provider: Joi.string(),
            policyNumber: Joi.string(),
            groupNumber: Joi.string()
        })
    }),

    update: Joi.object({
        amount: Joi.number().positive(),
        method: Joi.string().valid('credit_card', 'debit_card', 'insurance'),
        description: Joi.string(),
        status: Joi.string().valid('pending', 'completed', 'failed', 'refunded'),
        insuranceDetails: Joi.object({
            provider: Joi.string(),
            policyNumber: Joi.string(),
            groupNumber: Joi.string()
        })
    })
};

/**
 * Medical record validation schemas
 */
const medicalRecordSchemas = {
    create: Joi.object({
        patientId: Joi.string().required(),
        type: Joi.string().valid('diagnosis', 'lab_result', 'imaging', 'vaccination', 'procedure').required(),
        date: Joi.date().iso().required(),
        description: Joi.string().required(),
        attachments: Joi.array().items(
            Joi.object({
                filename: Joi.string().required(),
                path: Joi.string().required(),
                type: Joi.string().required()
            })
        )
    }),

    update: Joi.object({
        type: Joi.string().valid('diagnosis', 'lab_result', 'imaging', 'vaccination', 'procedure'),
        date: Joi.date().iso(),
        description: Joi.string(),
        attachments: Joi.array().items(
            Joi.object({
                filename: Joi.string().required(),
                path: Joi.string().required(),
                type: Joi.string().required()
            })
        )
    })
};

/**
 * Settings validation schemas
 */
const settingsSchemas = {
    update: Joi.object({
        settings: Joi.object().pattern(
            Joi.string(),
            Joi.alternatives().try(
                Joi.string(),
                Joi.number(),
                Joi.boolean(),
                Joi.object(),
                Joi.array()
            )
        ).required()
    })
};

module.exports = {
    validate,
    userSchemas,
    appointmentSchemas,
    prescriptionSchemas,
    paymentSchemas,
    medicalRecordSchemas,
    settingsSchemas
};

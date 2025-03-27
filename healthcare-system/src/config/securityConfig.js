const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

const securityConfig = {
    // Rate limiting configuration
    rateLimiter: rateLimit({
        windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
        max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs
        message: {
            status: 'error',
            message: 'Too many requests from this IP, please try again later.'
        }
    }),

    // Helmet configuration for security headers
    helmetConfig: helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"]
            }
        },
        xssFilter: true,
        noSniff: true,
        hidePoweredBy: true,
        frameguard: { action: 'deny' },
        referrerPolicy: { policy: 'same-origin' }
    }),

    // CORS configuration
    corsOptions: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        credentials: true,
        maxAge: 86400 // 24 hours
    },

    // Password validation rules
    passwordRules: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
    },

    // Session configuration
    sessionConfig: {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    },

    // JWT configuration
    jwtConfig: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },

    // Security validation functions
    validatePassword: (password) => {
        const rules = securityConfig.passwordRules;
        const errors = [];

        if (password.length < rules.minLength) {
            errors.push(`Password must be at least ${rules.minLength} characters long`);
        }
        if (rules.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (rules.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (rules.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (rules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // Sanitize user input
    sanitizeInput: (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/[<>]/g, '') // Remove < and >
            .trim(); // Remove leading/trailing whitespace
    },

    // Validate file uploads
    validateFileUpload: (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        return {
            isValid: allowedTypes.includes(file.mimetype) && file.size <= maxSize,
            errors: !allowedTypes.includes(file.mimetype) 
                ? ['Invalid file type'] 
                : file.size > maxSize 
                    ? ['File size too large'] 
                    : []
        };
    }
};

module.exports = securityConfig; 
require('dotenv').config();

const config = {
    // Server configuration
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }
    },

    // Database configuration
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-system',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        }
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },

    // Email configuration
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
        from: process.env.EMAIL_FROM || 'noreply@healthcare-system.com'
    },

    // File upload configuration
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'],
        uploadDir: process.env.UPLOAD_DIR || 'uploads',
        tempDir: process.env.TEMP_DIR || 'temp'
    },

    // Payment gateway configuration
    payment: {
        stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY || '',
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
        },
        currency: process.env.PAYMENT_CURRENCY || 'USD'
    },

    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined',
        directory: process.env.LOG_DIR || 'logs',
        maxSize: parseInt(process.env.LOG_MAX_SIZE) || 10 * 1024 * 1024, // 10MB
        maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5
    },

    // Rate limiting configuration
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100 // limit each IP to 100 requests per windowMs
    },

    // Security configuration
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
        sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 30 * 60 * 1000, // 30 minutes
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
        lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 15 * 60 * 1000 // 15 minutes
    },

    // API documentation configuration
    apiDocs: {
        enabled: process.env.SWAGGER_ENABLED === 'true',
        path: process.env.SWAGGER_PATH || '/api-docs',
        title: 'Healthcare System API',
        version: '1.0.0',
        description: 'API documentation for the Healthcare System'
    },

    // Cache configuration (using MongoDB)
    cache: {
        enabled: process.env.CACHE_ENABLED === 'true',
        ttl: parseInt(process.env.CACHE_TTL) || 60 * 60, // 1 hour
        checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 60 * 60 // 1 hour
    },

    // Notification configuration
    notifications: {
        email: {
            enabled: process.env.EMAIL_NOTIFICATIONS === 'true',
            templates: {
                welcome: 'welcome',
                appointment: 'appointment',
                prescription: 'prescription',
                payment: 'payment'
            }
        },
        sms: {
            enabled: process.env.SMS_NOTIFICATIONS === 'true',
            provider: process.env.SMS_PROVIDER || 'twilio',
            accountSid: process.env.SMS_ACCOUNT_SID || '',
            authToken: process.env.SMS_AUTH_TOKEN || '',
            fromNumber: process.env.SMS_FROM_NUMBER || ''
        }
    },

    // Backup configuration
    backup: {
        enabled: process.env.BACKUP_ENABLED === 'true',
        schedule: process.env.BACKUP_SCHEDULE || '0 0 * * *', // Daily at midnight
        retention: parseInt(process.env.BACKUP_RETENTION) || 7, // 7 days
        directory: process.env.BACKUP_DIR || 'backups'
    }
};

// Validate required environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS',
    'STRIPE_SECRET_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config; 
const securityConfig = require('../config/securityConfig');
const logger = require('../utils/logger');

const securityMiddleware = {
    // Apply basic security middleware
    applyBasicSecurity: (app) => {
        // Apply helmet for security headers
        app.use(securityConfig.helmetConfig);

        // Apply CORS
        app.use(cors(securityConfig.corsOptions));

        // Apply rate limiting
        app.use(securityConfig.rateLimiter);

        logger.logInfo('Basic security middleware applied');
    },

    // Sanitize request input
    sanitizeRequest: (req, res, next) => {
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                req.body[key] = securityConfig.sanitizeInput(req.body[key]);
            });
        }

        if (req.query) {
            Object.keys(req.query).forEach(key => {
                req.query[key] = securityConfig.sanitizeInput(req.query[key]);
            });
        }

        if (req.params) {
            Object.keys(req.params).forEach(key => {
                req.params[key] = securityConfig.sanitizeInput(req.params[key]);
            });
        }

        next();
    },

    // Validate file uploads
    validateFileUpload: (req, res, next) => {
        if (!req.files) {
            return next();
        }

        const files = Array.isArray(req.files) ? req.files : [req.files];
        
        for (const file of files) {
            const validation = securityConfig.validateFileUpload(file);
            if (!validation.isValid) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid file upload',
                    errors: validation.errors
                });
            }
        }

        next();
    },

    // Validate request schema
    validateSchema: (schema) => {
        return (req, res, next) => {
            const { error } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid request data',
                    errors: error.details.map(detail => detail.message)
                });
            }
            next();
        };
    },

    // Check required roles
    checkRole: (roles) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized - No user found'
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Forbidden - Insufficient permissions'
                });
            }

            next();
        };
    },

    // Log security events
    logSecurityEvent: (event) => {
        return (req, res, next) => {
            logger.logInfo('Security event:', {
                event,
                user: req.user ? req.user.id : 'anonymous',
                ip: req.ip,
                method: req.method,
                path: req.path,
                userAgent: req.get('user-agent')
            });
            next();
        };
    },

    // Handle security errors
    handleSecurityError: (err, req, res, next) => {
        logger.logError('Security error:', err);

        if (err.name === 'UnauthorizedError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid or expired token'
            });
        }

        if (err.name === 'ForbiddenError') {
            return res.status(403).json({
                status: 'error',
                message: 'Access forbidden'
            });
        }

        next(err);
    }
};

module.exports = securityMiddleware; 
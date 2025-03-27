const config = require('./config');
const logger = require('../utils/logger');

/**
 * JWT configuration
 */
const jwtConfig = {
    secret: config.jwt.secret,
    expiresIn: config.jwt.expiresIn,
    refreshExpiresIn: config.jwt.refreshExpiresIn,
    algorithm: 'HS256',
    issuer: 'healthcare-system',
    audience: 'healthcare-system-api'
};

/**
 * Password configuration
 */
const passwordConfig = {
    saltRounds: config.security.bcryptRounds,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
};

/**
 * Session configuration
 */
const sessionConfig = {
    timeout: config.security.sessionTimeout,
    maxLoginAttempts: config.security.maxLoginAttempts,
    lockoutDuration: config.security.lockoutDuration
};

/**
 * Token types
 */
const tokenTypes = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'reset_password',
    VERIFY_EMAIL: 'verify_email'
};

/**
 * User roles
 */
const userRoles = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    PATIENT: 'patient',
    STAFF: 'staff'
};

/**
 * Role permissions
 */
const rolePermissions = {
    [userRoles.ADMIN]: [
        'manage_users',
        'manage_doctors',
        'manage_patients',
        'manage_appointments',
        'manage_prescriptions',
        'manage_payments',
        'manage_settings',
        'view_statistics',
        'manage_backups'
    ],
    [userRoles.DOCTOR]: [
        'view_patients',
        'manage_appointments',
        'create_prescriptions',
        'view_medical_records',
        'update_patient_status'
    ],
    [userRoles.PATIENT]: [
        'view_appointments',
        'view_prescriptions',
        'view_medical_records',
        'schedule_appointments',
        'update_profile'
    ],
    [userRoles.STAFF]: [
        'view_appointments',
        'manage_appointments',
        'view_patients',
        'update_patient_status'
    ]
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} Whether password meets requirements
 */
const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
        password.length >= passwordConfig.minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChars
    );
};

/**
 * Check if user has required permissions
 * @param {string} role - User role
 * @param {string[]} requiredPermissions - Required permissions
 * @returns {boolean} Whether user has all required permissions
 */
const hasPermissions = (role, requiredPermissions) => {
    const userPermissions = rolePermissions[role] || [];
    return requiredPermissions.every(permission => 
        userPermissions.includes(permission)
    );
};

/**
 * Generate token options
 * @param {string} type - Token type
 * @returns {Object} Token options
 */
const getTokenOptions = (type) => {
    switch (type) {
        case tokenTypes.ACCESS:
            return {
                expiresIn: jwtConfig.expiresIn,
                algorithm: jwtConfig.algorithm,
                issuer: jwtConfig.issuer,
                audience: jwtConfig.audience
            };
        case tokenTypes.REFRESH:
            return {
                expiresIn: jwtConfig.refreshExpiresIn,
                algorithm: jwtConfig.algorithm,
                issuer: jwtConfig.issuer,
                audience: jwtConfig.audience
            };
        case tokenTypes.RESET_PASSWORD:
            return {
                expiresIn: '1h',
                algorithm: jwtConfig.algorithm
            };
        case tokenTypes.VERIFY_EMAIL:
            return {
                expiresIn: '24h',
                algorithm: jwtConfig.algorithm
            };
        default:
            throw new Error('Invalid token type');
    }
};

module.exports = {
    jwtConfig,
    passwordConfig,
    sessionConfig,
    tokenTypes,
    userRoles,
    rolePermissions,
    validatePassword,
    hasPermissions,
    getTokenOptions
}; 
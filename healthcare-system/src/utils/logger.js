const winston = require('winston');
const path = require('path');
const config = require('../config/config');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
    level: config.logging.level,
    format: logFormat,
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // Write all logs error (and above) to error.log
        new winston.transports.File({
            filename: path.join(config.logging.directory, 'error.log'),
            level: 'error',
            maxsize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(config.logging.directory, 'combined.log'),
            maxsize: config.logging.maxSize,
            maxFiles: config.logging.maxFiles
        })
    ]
});

// Create a stream object for Morgan
const stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

/**
 * Log an error message
 * @param {string} message - Error message
 * @param {Error} error - Error object
 */
const logError = (message, error) => {
    logger.error(message, {
        error: {
            message: error.message,
            stack: error.stack,
            ...error
        }
    });
};

/**
 * Log an info message
 * @param {string} message - Info message
 * @param {Object} meta - Additional metadata
 */
const logInfo = (message, meta = {}) => {
    logger.info(message, meta);
};

/**
 * Log a warning message
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
const logWarn = (message, meta = {}) => {
    logger.warn(message, meta);
};

/**
 * Log a debug message
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
const logDebug = (message, meta = {}) => {
    logger.debug(message, meta);
};

/**
 * Log an audit event
 * @param {string} event - Audit event name
 * @param {Object} data - Audit event data
 */
const logAudit = (event, data) => {
    logger.info('AUDIT', {
        event,
        ...data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Log a security event
 * @param {string} event - Security event name
 * @param {Object} data - Security event data
 */
const logSecurity = (event, data) => {
    logger.warn('SECURITY', {
        event,
        ...data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Log a performance metric
 * @param {string} metric - Performance metric name
 * @param {number} value - Metric value
 * @param {Object} meta - Additional metadata
 */
const logPerformance = (metric, value, meta = {}) => {
    logger.info('PERFORMANCE', {
        metric,
        value,
        ...meta,
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    logger,
    stream,
    logError,
    logInfo,
    logWarn,
    logDebug,
    logAudit,
    logSecurity,
    logPerformance
};

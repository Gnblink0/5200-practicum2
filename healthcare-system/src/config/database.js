const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.database.uri, config.database.options);
        
        logger.logInfo('MongoDB Connected', {
            host: conn.connection.host,
            port: conn.connection.port,
            database: conn.connection.name
        });

        // Handle connection errors
        mongoose.connection.on('error', (err) => {
            logger.logError('MongoDB connection error', err);
        });

        // Handle disconnection
        mongoose.connection.on('disconnected', () => {
            logger.logWarn('MongoDB disconnected');
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.logInfo('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        logger.logError('Error connecting to MongoDB', error);
        process.exit(1);
    }
};

/**
 * Initialize database indexes
 * @returns {Promise<void>}
 */
const initializeIndexes = async () => {
    try {
        // Create indexes for all models
        await Promise.all([
            // User indexes
            mongoose.model('User').createIndexes(),
            // Admin indexes
            mongoose.model('Admin').createIndexes(),
            // Doctor indexes
            mongoose.model('Doctor').createIndexes(),
            // Patient indexes
            mongoose.model('Patient').createIndexes(),
            // Appointment indexes
            mongoose.model('Appointment').createIndexes(),
            // Prescription indexes
            mongoose.model('Prescription').createIndexes(),
            // Payment indexes
            mongoose.model('Payment').createIndexes(),
            // MedicalRecord indexes
            mongoose.model('MedicalRecord').createIndexes(),
            // AuditLog indexes
            mongoose.model('AuditLog').createIndexes(),
            // File indexes
            mongoose.model('File').createIndexes(),
            // Setting indexes
            mongoose.model('Setting').createIndexes(),
            // Message indexes
            mongoose.model('Message').createIndexes(),
            // Insurance indexes
            mongoose.model('Insurance').createIndexes()
        ]);

        logger.logInfo('Database indexes initialized successfully');
    } catch (error) {
        logger.logError('Error initializing database indexes', error);
        throw error;
    }
};

/**
 * Clear database collections
 * @returns {Promise<void>}
 */
const clearCollections = async () => {
    try {
        const collections = await mongoose.connection.db.collections();
        await Promise.all(collections.map(collection => collection.deleteMany({})));
        logger.logInfo('All collections cleared successfully');
    } catch (error) {
        logger.logError('Error clearing collections', error);
        throw error;
    }
};

/**
 * Get database statistics
 * @returns {Promise<Object>}
 */
const getDatabaseStats = async () => {
    try {
        const stats = await mongoose.connection.db.stats();
        return {
            collections: stats.collections,
            documents: stats.objects,
            dataSize: stats.dataSize,
            storageSize: stats.storageSize,
            indexes: stats.indexes,
            indexSize: stats.indexSize
        };
    } catch (error) {
        logger.logError('Error getting database statistics', error);
        throw error;
    }
};

/**
 * Check database health
 * @returns {Promise<boolean>}
 */
const checkDatabaseHealth = async () => {
    try {
        await mongoose.connection.db.admin().ping();
        return true;
    } catch (error) {
        logger.logError('Database health check failed', error);
        return false;
    }
};

module.exports = {
    connectDB,
    initializeIndexes,
    clearCollections,
    getDatabaseStats,
    checkDatabaseHealth
}; 
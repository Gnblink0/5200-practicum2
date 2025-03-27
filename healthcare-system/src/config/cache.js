const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

// Cache Schema
const cacheSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create Cache model
const Cache = mongoose.model('Cache', cacheSchema);

/**
 * Set a key-value pair in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to store
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<void>}
 */
const set = async (key, value, ttl = config.cache.ttl) => {
    try {
        const expiresAt = new Date(Date.now() + ttl * 1000);
        await Cache.findOneAndUpdate(
            { key },
            { value, expiresAt },
            { upsert: true, new: true }
        );
    } catch (error) {
        logger.logError('Error setting cache', { key, error });
        throw error;
    }
};

/**
 * Get a value from cache by key
 * @param {string} key - Cache key
 * @returns {Promise<any>}
 */
const get = async (key) => {
    try {
        const cache = await Cache.findOne({
            key,
            expiresAt: { $gt: new Date() }
        });

        if (!cache) {
            return null;
        }

        return cache.value;
    } catch (error) {
        logger.logError('Error getting cache', { key, error });
        throw error;
    }
};

/**
 * Delete a key from cache
 * @param {string} key - Cache key
 * @returns {Promise<void>}
 */
const del = async (key) => {
    try {
        await Cache.deleteOne({ key });
    } catch (error) {
        logger.logError('Error deleting cache', { key, error });
        throw error;
    }
};

/**
 * Check if a key exists in cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
const exists = async (key) => {
    try {
        const count = await Cache.countDocuments({
            key,
            expiresAt: { $gt: new Date() }
        });
        return count > 0;
    } catch (error) {
        logger.logError('Error checking cache existence', { key, error });
        throw error;
    }
};

/**
 * Set multiple key-value pairs in cache
 * @param {Object} pairs - Object containing key-value pairs
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<void>}
 */
const mset = async (pairs, ttl = config.cache.ttl) => {
    try {
        const operations = Object.entries(pairs).map(([key, value]) => ({
            updateOne: {
                filter: { key },
                update: {
                    $set: {
                        value,
                        expiresAt: new Date(Date.now() + ttl * 1000)
                    }
                },
                upsert: true
            }
        }));

        await Cache.bulkWrite(operations);
    } catch (error) {
        logger.logError('Error setting multiple cache entries', { error });
        throw error;
    }
};

/**
 * Get multiple values from cache by keys
 * @param {string[]} keys - Array of cache keys
 * @returns {Promise<Object>}
 */
const mget = async (keys) => {
    try {
        const caches = await Cache.find({
            key: { $in: keys },
            expiresAt: { $gt: new Date() }
        });

        return keys.reduce((result, key) => {
            const cache = caches.find(c => c.key === key);
            result[key] = cache ? cache.value : null;
            return result;
        }, {});
    } catch (error) {
        logger.logError('Error getting multiple cache entries', { keys, error });
        throw error;
    }
};

/**
 * Delete multiple keys from cache
 * @param {string[]} keys - Array of cache keys
 * @returns {Promise<void>}
 */
const mdel = async (keys) => {
    try {
        await Cache.deleteMany({ key: { $in: keys } });
    } catch (error) {
        logger.logError('Error deleting multiple cache entries', { keys, error });
        throw error;
    }
};

/**
 * Clear all expired cache entries
 * @returns {Promise<void>}
 */
const clearExpired = async () => {
    try {
        await Cache.deleteMany({
            expiresAt: { $lte: new Date() }
        });
    } catch (error) {
        logger.logError('Error clearing expired cache entries', { error });
        throw error;
    }
};

/**
 * Get cache statistics
 * @returns {Promise<Object>}
 */
const getStats = async () => {
    try {
        const stats = await Cache.aggregate([
            {
                $group: {
                    _id: null,
                    totalEntries: { $sum: 1 },
                    expiredEntries: {
                        $sum: {
                            $cond: [
                                { $lte: ['$expiresAt', new Date()] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        return stats[0] || { totalEntries: 0, expiredEntries: 0 };
    } catch (error) {
        logger.logError('Error getting cache statistics', { error });
        throw error;
    }
};

// Schedule cleanup of expired entries
if (config.cache.enabled) {
    setInterval(clearExpired, config.cache.checkPeriod * 1000);
}

module.exports = {
    set,
    get,
    del,
    exists,
    mset,
    mget,
    mdel,
    clearExpired,
    getStats
}; 
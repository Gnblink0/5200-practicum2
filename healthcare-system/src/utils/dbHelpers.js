const mongoose = require('mongoose');
const logger = require('./logger');

/**
 * Create a new document with error handling
 * @param {Model} Model - Mongoose model
 * @param {Object} data - Document data
 * @returns {Promise<Document>} Created document
 */
const createDocument = async (Model, data) => {
    try {
        const document = await Model.create(data);
        logger.logInfo('Document created successfully', {
            model: Model.modelName,
            id: document._id
        });
        return document;
    } catch (error) {
        logger.logError('Error creating document:', {
            model: Model.modelName,
            error
        });
        throw error;
    }
};

/**
 * Find a document by ID with error handling
 * @param {Model} Model - Mongoose model
 * @param {string} id - Document ID
 * @param {Object} options - Query options
 * @returns {Promise<Document>} Found document
 */
const findById = async (Model, id, options = {}) => {
    try {
        const document = await Model.findById(id, options);
        if (!document) {
            throw new Error(`${Model.modelName} not found`);
        }
        return document;
    } catch (error) {
        logger.logError('Error finding document by ID:', {
            model: Model.modelName,
            id,
            error
        });
        throw error;
    }
};

/**
 * Find documents with pagination
 * @param {Model} Model - Mongoose model
 * @param {Object} query - Query criteria
 * @param {Object} options - Query options
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Paginated results
 */
const findWithPagination = async (Model, query = {}, options = {}, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const [documents, total] = await Promise.all([
            Model.find(query, options)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Model.countDocuments(query)
        ]);

        return {
            documents,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        logger.logError('Error finding documents with pagination:', {
            model: Model.modelName,
            query,
            error
        });
        throw error;
    }
};

/**
 * Update a document with error handling
 * @param {Model} Model - Mongoose model
 * @param {string} id - Document ID
 * @param {Object} updates - Update data
 * @param {Object} options - Update options
 * @returns {Promise<Document>} Updated document
 */
const updateDocument = async (Model, id, updates, options = { new: true }) => {
    try {
        const document = await Model.findByIdAndUpdate(id, updates, options);
        if (!document) {
            throw new Error(`${Model.modelName} not found`);
        }
        logger.logInfo('Document updated successfully', {
            model: Model.modelName,
            id
        });
        return document;
    } catch (error) {
        logger.logError('Error updating document:', {
            model: Model.modelName,
            id,
            error
        });
        throw error;
    }
};

/**
 * Delete a document with error handling
 * @param {Model} Model - Mongoose model
 * @param {string} id - Document ID
 * @returns {Promise<Document>} Deleted document
 */
const deleteDocument = async (Model, id) => {
    try {
        const document = await Model.findByIdAndDelete(id);
        if (!document) {
            throw new Error(`${Model.modelName} not found`);
        }
        logger.logInfo('Document deleted successfully', {
            model: Model.modelName,
            id
        });
        return document;
    } catch (error) {
        logger.logError('Error deleting document:', {
            model: Model.modelName,
            id,
            error
        });
        throw error;
    }
};

/**
 * Check if a document exists
 * @param {Model} Model - Mongoose model
 * @param {Object} query - Query criteria
 * @returns {Promise<boolean>} Existence status
 */
const documentExists = async (Model, query) => {
    try {
        const count = await Model.countDocuments(query);
        return count > 0;
    } catch (error) {
        logger.logError('Error checking document existence:', {
            model: Model.modelName,
            query,
            error
        });
        throw error;
    }
};

/**
 * Get collection statistics
 * @param {Model} Model - Mongoose model
 * @returns {Promise<Object>} Collection statistics
 */
const getCollectionStats = async (Model) => {
    try {
        const stats = await Model.collection.stats();
        return {
            count: stats.count,
            size: stats.size,
            avgObjSize: stats.avgObjSize,
            storageSize: stats.storageSize,
            totalIndexSize: stats.totalIndexSize,
            indexSizes: stats.indexSizes
        };
    } catch (error) {
        logger.logError('Error getting collection stats:', {
            model: Model.modelName,
            error
        });
        throw error;
    }
};

/**
 * Create text index for search
 * @param {Model} Model - Mongoose model
 * @param {Array} fields - Fields to index
 * @returns {Promise<void>}
 */
const createTextIndex = async (Model, fields) => {
    try {
        await Model.collection.createIndex(
            fields.reduce((acc, field) => ({ ...acc, [field]: 'text' }), {})
        );
        logger.logInfo('Text index created successfully', {
            model: Model.modelName,
            fields
        });
    } catch (error) {
        logger.logError('Error creating text index:', {
            model: Model.modelName,
            fields,
            error
        });
        throw error;
    }
};

/**
 * Perform text search
 * @param {Model} Model - Mongoose model
 * @param {string} searchTerm - Search term
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Search results
 */
const textSearch = async (Model, searchTerm, options = {}) => {
    try {
        return await Model.find(
            { $text: { $search: searchTerm } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } });
    } catch (error) {
        logger.logError('Error performing text search:', {
            model: Model.modelName,
            searchTerm,
            error
        });
        throw error;
    }
};

module.exports = {
    createDocument,
    findById,
    findWithPagination,
    updateDocument,
    deleteDocument,
    documentExists,
    getCollectionStats,
    createTextIndex,
    textSearch
}; 
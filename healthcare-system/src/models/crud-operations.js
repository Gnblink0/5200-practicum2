const User = require('./User');
const Admin = require('./Admin');
const logger = require('../utils/logger');

/**
 * Base CRUD operations class
 */
class BaseCrud {
    constructor(model) {
        this.model = model;
    }

    /**
     * Create a new document
     * @param {Object} data - Document data
     * @returns {Promise<Object>} Created document
     */
    async create(data) {
        try {
            const doc = new this.model(data);
            await doc.save();
            return doc;
        } catch (error) {
            logger.logError('Error in create operation', error);
            throw error;
        }
    }

    /**
     * Get document by ID
     * @param {string} id - Document ID
     * @returns {Promise<Object>} Found document
     */
    async getById(id) {
        try {
            return await this.model.findById(id);
        } catch (error) {
            logger.logError('Error in getById operation', error);
            throw error;
        }
    }

    /**
     * Get all documents
     * @param {Object} query - Query parameters
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of documents
     */
    async find(query = {}, options = {}) {
        try {
            return await this.model.find(query, options);
        } catch (error) {
            logger.logError('Error in find operation', error);
            throw error;
        }
    }

    /**
     * Update document
     * @param {string} id - Document ID
     * @param {Object} data - Update data
     * @param {Object} options - Update options
     * @returns {Promise<Object>} Updated document
     */
    async update(id, data, options = { new: true, runValidators: true }) {
        try {
            return await this.model.findByIdAndUpdate(id, data, options);
        } catch (error) {
            logger.logError('Error in update operation', error);
            throw error;
        }
    }

    /**
     * Delete document
     * @param {string} id - Document ID
     * @returns {Promise<Object>} Deleted document
     */
    async delete(id) {
        try {
            return await this.model.findByIdAndDelete(id);
        } catch (error) {
            logger.logError('Error in delete operation', error);
            throw error;
        }
    }
}

/**
 * Admin CRUD operations
 */
class AdminCrud extends BaseCrud {
    constructor() {
        super(Admin);
    }

    /**
     * Get admin by user ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Admin document
     */
    async getAdminByUserId(userId) {
        try {
            return await this.model.findOne({ userId });
        } catch (error) {
            logger.logError('Error in getAdminByUserId operation', error);
            throw error;
        }
    }

    /**
     * Add activity log entry
     * @param {string} id - Admin ID
     * @param {string} action - Action performed
     * @param {Object} details - Action details
     * @param {string} userId - User ID who performed the action
     * @returns {Promise<Object>} Updated admin document
     */
    async addActivityLogEntry(id, action, details, userId) {
        try {
            return await this.model.findByIdAndUpdate(
                id,
                {
                    $push: {
                        activityLog: {
                            action,
                            details,
                            userId,
                            timestamp: new Date()
                        }
                    }
                },
                { new: true }
            );
        } catch (error) {
            logger.logError('Error in addActivityLogEntry operation', error);
            throw error;
        }
    }

    /**
     * Update admin permissions
     * @param {string} id - Admin ID
     * @param {Array<string>} permissions - New permissions
     * @returns {Promise<Object>} Updated admin document
     */
    async updatePermissions(id, permissions) {
        try {
            return await this.model.findByIdAndUpdate(
                id,
                { permissions },
                { new: true, runValidators: true }
            );
        } catch (error) {
            logger.logError('Error in updatePermissions operation', error);
            throw error;
        }
    }
}

/**
 * User CRUD operations
 */
class UserCrud extends BaseCrud {
    constructor() {
        super(User);
    }

    /**
     * Get user by email
     * @param {string} email - User email
     * @returns {Promise<Object>} User document
     */
    async getByEmail(email) {
        try {
            return await this.model.findOne({ email });
        } catch (error) {
            logger.logError('Error in getByEmail operation', error);
            throw error;
        }
    }

    /**
     * Get users by role
     * @param {string} role - User role
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of user documents
     */
    async getByRole(role, options = {}) {
        try {
            return await this.model.find({ role }, options);
        } catch (error) {
            logger.logError('Error in getByRole operation', error);
            throw error;
        }
    }

    /**
     * Update user password
     * @param {string} id - User ID
     * @param {string} password - New password
     * @returns {Promise<Object>} Updated user document
     */
    async updatePassword(id, password) {
        try {
            const user = await this.model.findById(id);
            if (!user) {
                throw new Error('User not found');
            }
            user.password = password;
            await user.save();
            return user;
        } catch (error) {
            logger.logError('Error in updatePassword operation', error);
            throw error;
        }
    }

    /**
     * Update user status
     * @param {string} id - User ID
     * @param {string} status - New status
     * @returns {Promise<Object>} Updated user document
     */
    async updateStatus(id, status) {
        try {
            return await this.model.findByIdAndUpdate(
                id,
                { status },
                { new: true, runValidators: true }
            );
        } catch (error) {
            logger.logError('Error in updateStatus operation', error);
            throw error;
        }
    }
}

module.exports = {
    AdminCrud: new AdminCrud(),
    UserCrud: new UserCrud()
}; 
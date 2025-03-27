const User = require('../User');
const logger = require('../../utils/logger');

class UserService {
    /**
     * Get all users with pagination
     * @param {Object} query - Query parameters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated users
     */
    async getUsers(query = {}, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [users, total] = await Promise.all([
                User.find(query)
                    .select('-password')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                User.countDocuments(query)
            ]);

            return {
                users,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.logError('Error getting users:', error);
            throw error;
        }
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User object
     */
    async getUserById(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            logger.logError('Error getting user by ID:', error);
            throw error;
        }
    }

    /**
     * Update user
     * @param {string} userId - User ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated user
     */
    async updateUser(userId, updateData) {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            logger.logError('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Delete user
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Deleted user
     */
    async deleteUser(userId) {
        try {
            const user = await User.findByIdAndDelete(userId);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            logger.logError('Error deleting user:', error);
            throw error;
        }
    }

    /**
     * Get users by role
     * @param {string} role - User role
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated users
     */
    async getUsersByRole(role, page = 1, limit = 10) {
        try {
            return this.getUsers({ role }, page, limit);
        } catch (error) {
            logger.logError('Error getting users by role:', error);
            throw error;
        }
    }

    /**
     * Search users
     * @param {string} searchTerm - Search term
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Search results
     */
    async searchUsers(searchTerm, filters = {}) {
        try {
            const query = {
                $or: [
                    { firstName: { $regex: searchTerm, $options: 'i' } },
                    { lastName: { $regex: searchTerm, $options: 'i' } },
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { phone: { $regex: searchTerm, $options: 'i' } }
                ],
                ...filters
            };

            return await User.find(query)
                .select('-password')
                .limit(20)
                .sort({ createdAt: -1 });
        } catch (error) {
            logger.logError('Error searching users:', error);
            throw error;
        }
    }

    /**
     * Get user statistics
     * @returns {Promise<Object>} User statistics
     */
    async getUserStats() {
        try {
            const stats = await User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 },
                        active: {
                            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                        },
                        verified: {
                            $sum: { $cond: [{ $eq: ['$emailVerified', true] }, 1, 0] }
                        }
                    }
                }
            ]);

            return stats.reduce((acc, curr) => {
                acc[curr._id] = curr;
                return acc;
            }, {});
        } catch (error) {
            logger.logError('Error getting user statistics:', error);
            throw error;
        }
    }

    /**
     * Update user status
     * @param {string} userId - User ID
     * @param {boolean} isActive - Active status
     * @returns {Promise<Object>} Updated user
     */
    async updateUserStatus(userId, isActive) {
        try {
            return this.updateUser(userId, { isActive });
        } catch (error) {
            logger.logError('Error updating user status:', error);
            throw error;
        }
    }

    /**
     * Get user activity
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User activity data
     */
    async getUserActivity(userId) {
        try {
            const user = await User.findById(userId)
                .select('lastLogin loginHistory createdAt updatedAt')
                .lean();

            if (!user) {
                throw new Error('User not found');
            }

            return {
                lastLogin: user.lastLogin,
                loginHistory: user.loginHistory,
                accountCreated: user.createdAt,
                lastUpdated: user.updatedAt
            };
        } catch (error) {
            logger.logError('Error getting user activity:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} profileData - Profile data
     * @returns {Promise<Object>} Updated user
     */
    async updateUserProfile(userId, profileData) {
        try {
            const allowedFields = [
                'firstName',
                'lastName',
                'phone',
                'address',
                'dateOfBirth',
                'gender',
                'profilePicture'
            ];

            const updateData = Object.keys(profileData)
                .filter(key => allowedFields.includes(key))
                .reduce((obj, key) => {
                    obj[key] = profileData[key];
                    return obj;
                }, {});

            return this.updateUser(userId, updateData);
        } catch (error) {
            logger.logError('Error updating user profile:', error);
            throw error;
        }
    }
}

module.exports = new UserService();

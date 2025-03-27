// src/db/connection.js
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config();

// Connection URI from environment variables
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "healthcare_system";

// MongoDB connection options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
};

// Create a MongoDB client
const client = new MongoClient(uri, options);

// Connection pool
let dbConnection = null;

/**
 * Connect to MongoDB and return the database connection
 * @returns {Promise<Db>} MongoDB database connection
 */
async function connectToDatabase() {
    if (dbConnection) {
        return dbConnection;
    }

    try {
        await client.connect();
        console.log("Connected successfully to MongoDB server");
        
        dbConnection = client.db(dbName);
        return dbConnection;
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        throw err;
    }
}

/**
 * Connect to MongoDB using Mongoose
 * @returns {Promise<Connection>} Mongoose connection
 */
async function connectMongoose() {
    try {
        await mongoose.connect(uri, {
            dbName,
            ...options
        });
        console.log("Connected successfully to MongoDB using Mongoose");
        return mongoose.connection;
    } catch (err) {
        console.error("Error connecting to MongoDB with Mongoose:", err);
        throw err;
    }
}

/**
 * Close the MongoDB connection
 */
async function closeConnection() {
    try {
        await client.close();
        dbConnection = null;
        console.log("MongoDB connection closed");
    } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        throw err;
    }
}

/**
 * Close Mongoose connection
 */
async function closeMongooseConnection() {
    try {
        await mongoose.connection.close();
        console.log("Mongoose connection closed");
    } catch (err) {
        console.error("Error closing Mongoose connection:", err);
        throw err;
    }
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
async function getDatabaseStats() {
    try {
        const db = await connectToDatabase();
        const stats = await db.stats();
        return stats;
    } catch (err) {
        console.error("Error getting database stats:", err);
        throw err;
    }
}

/**
 * Check database health
 * @returns {Promise<boolean>} Database health status
 */
async function checkDatabaseHealth() {
    try {
        const db = await connectToDatabase();
        await db.command({ ping: 1 });
        return true;
    } catch (err) {
        console.error("Database health check failed:", err);
        return false;
    }
}

// Export functions
module.exports = {
    connectToDatabase,
    connectMongoose,
    closeConnection,
    closeMongooseConnection,
    getDatabaseStats,
    checkDatabaseHealth
};
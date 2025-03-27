const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config/config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const dbErrorHandler = require('./middleware/dbErrorHandler');
const authMiddleware = require('./middleware/authMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Create Express app
const app = express();

// Connect to MongoDB
mongoose.connect(config.database.url, config.database.options)
    .then(() => {
        logger.logInfo('Connected to MongoDB');
    })
    .catch((error) => {
        logger.logError('MongoDB connection error:', error);
        process.exit(1);
    });

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('combined', { stream: logger.stream })); // HTTP request logging

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/appointments', authMiddleware, appointmentRoutes);
app.use('/api/medical-records', authMiddleware, medicalRecordRoutes);
app.use('/api/prescriptions', authMiddleware, prescriptionRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Error handling middleware
app.use(dbErrorHandler);
app.use(errorHandler);

// Start server
const PORT = config.server.port || 3000;
const server = app.listen(PORT, () => {
    logger.logInfo(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.logInfo('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.logInfo('Server closed');
        mongoose.connection.close(false, () => {
            logger.logInfo('MongoDB connection closed');
            process.exit(0);
        });
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.logError('Uncaught Exception:', error);
    server.close(() => {
        mongoose.connection.close(false, () => {
            process.exit(1);
        });
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.logError('Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
        mongoose.connection.close(false, () => {
            process.exit(1);
        });
    });
});

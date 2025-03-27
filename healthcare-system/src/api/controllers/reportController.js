// src/api/controllers/reportController.js
const { AdminCrud } = require('../../models/crud-operations');
const reportService = require('../../models/services/reportService');
const logger = require('../../utils/logger');

/**
 * Report controller for handling reporting and analytics operations
 */
class ReportController {
  /**
   * Generate financial report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generateFinancialReport(req, res, next) {
    try {
      const { startDate, endDate, groupBy } = req.query;

      // Validate date parameters
      if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        return res.status(400).json({
          error: {
            message: 'Valid startDate and endDate parameters are required'
          }
        });
      }

      // Only admins can access financial reports
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access financial reports'
          }
        });
      }

      // Check if admin has reporting or billing_management permission
      const admin = await AdminCrud.getAdminByUserId(req.user.id);
      
      if (!admin || (!admin.permissions.includes('reporting') && !admin.permissions.includes('billing_management'))) {
        return res.status(403).json({
          error: {
            message: 'Insufficient permissions to access financial reports'
          }
        });
      }

      // Generate financial report
      const report = await reportService.generateFinancialReport(startDate, endDate, groupBy);

      res.status(200).json(report);
    } catch (error) {
      logger.error('Error in generateFinancialReport controller:', error);
      next(error);
    }
  }

  /**
   * Generate appointment statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generateAppointmentStatistics(req, res, next) {
    try {
      const { startDate, endDate, groupBy } = req.query;

      // Validate date parameters
      if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        return res.status(400).json({
          error: {
            message: 'Valid startDate and endDate parameters are required'
          }
        });
      }

      // Only admins can access appointment statistics
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access appointment statistics'
          }
        });
      }

      // Check if admin has reporting permission
      const admin = await AdminCrud.getAdminByUserId(req.user.id);
      
      if (!admin || !admin.permissions.includes('reporting')) {
        return res.status(403).json({
          error: {
            message: 'Insufficient permissions to access appointment statistics'
          }
        });
      }

      // Generate appointment statistics
      const statistics = await reportService.generateAppointmentStatistics(startDate, endDate, groupBy);

      res.status(200).json(statistics);
    } catch (error) {
      logger.error('Error in generateAppointmentStatistics controller:', error);
      next(error);
    }
  }

  /**
   * Generate doctor performance report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generateDoctorPerformanceReport(req, res, next) {
    try {
      const { startDate, endDate, doctorId } = req.query;

      // Validate date parameters
      if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        return res.status(400).json({
          error: {
            message: 'Valid startDate and endDate parameters are required'
          }
        });
      }

      // Only admins can access doctor performance reports
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access doctor performance reports'
          }
        });
      }

      // Check if admin has reporting permission
      const admin = await AdminCrud.getAdminByUserId(req.user.id);
      
      if (!admin || !admin.permissions.includes('reporting')) {
        return res.status(403).json({
          error: {
            message: 'Insufficient permissions to access doctor performance reports'
          }
        });
      }

      // Generate doctor performance report
      const report = await reportService.generateDoctorPerformanceReport(startDate, endDate, doctorId);

      res.status(200).json(report);
    } catch (error) {
      logger.error('Error in generateDoctorPerformanceReport controller:', error);
      next(error);
    }
  }

  /**
   * Generate patient statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generatePatientStatistics(req, res, next) {
    try {
      const { startDate, endDate, groupBy } = req.query;

      // Validate date parameters
      if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        return res.status(400).json({
          error: {
            message: 'Valid startDate and endDate parameters are required'
          }
        });
      }

      // Only admins can access patient statistics
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access patient statistics'
          }
        });
      }

      // Check if admin has reporting permission
      const admin = await AdminCrud.getAdminByUserId(req.user.id);
      
      if (!admin || !admin.permissions.includes('reporting')) {
        return res.status(403).json({
          error: {
            message: 'Insufficient permissions to access patient statistics'
          }
        });
      }

      // Generate patient statistics
      const statistics = await reportService.generatePatientStatistics(startDate, endDate, groupBy);

      res.status(200).json(statistics);
    } catch (error) {
      logger.error('Error in generatePatientStatistics controller:', error);
      next(error);
    }
  }

  /**
   * Generate system usage report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generateSystemUsageReport(req, res, next) {
    try {
      const { days } = req.query;

      // Parse days parameter
      const daysNum = parseInt(days) || 30;

      // Only admins can access system usage reports
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access system usage reports'
          }
        });
      }

      // Check if admin has reporting or system_configuration permission
      const admin = await AdminCrud.getAdminByUserId(req.user.id);
      
      if (!admin || (!admin.permissions.includes('reporting') && !admin.permissions.includes('system_configuration'))) {
        return res.status(403).json({
          error: {
            message: 'Insufficient permissions to access system usage reports'
          }
        });
      }

      // Generate system usage report
      const report = await reportService.generateSystemUsageReport(daysNum);

      res.status(200).json(report);
    } catch (error) {
      logger.error('Error in generateSystemUsageReport controller:', error);
      next(error);
    }
  }

  /**
   * Export report data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async exportReportData(req, res, next) {
    try {
      const { reportType, format, startDate, endDate } = req.query;

      // Validate required parameters
      if (!reportType || !format) {
        return res.status(400).json({
          error: {
            message: 'reportType and format parameters are required'
          }
        });
      }

      // Validate report type
      const validReportTypes = ['financial', 'appointments', 'doctors', 'patients', 'system'];
      if (!validReportTypes.includes(reportType)) {
        return res.status(400).json({
          error: {
            message: `Invalid report type. Must be one of: ${validReportTypes.join(', ')}`
          }
        });
      }

      // Validate format
      const validFormats = ['csv', 'json', 'pdf'];
      if (!validFormats.includes(format)) {
        return res.status(400).json({
          error: {
            message: `Invalid format. Must be one of: ${validFormats.join(', ')}`
          }
        });
      }

      // Only admins can export reports
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to export reports'
          }
        });
      }

      // Check if admin has reporting permission
      const admin = await AdminCrud.getAdminByUserId(req.user.id);
      
      if (!admin || !admin.permissions.includes('reporting')) {
        return res.status(403).json({
          error: {
            message: 'Insufficient permissions to export reports'
          }
        });
      }

      // Export report data
      const exportData = await reportService.exportReportData(reportType, format, startDate, endDate);

      // Set appropriate content type and attachment headers
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.csv"`);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.json"`);
      } else if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.pdf"`);
      }

      res.status(200).send(exportData);
    } catch (error) {
      logger.error('Error in exportReportData controller:', error);
      next(error);
    }
  }

  /**
   * Generate custom report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async generateCustomReport(req, res, next) {
    try {
      const reportConfig = req.body;

      // Validate report configuration
      if (!reportConfig || !reportConfig.metrics || !Array.isArray(reportConfig.metrics) || reportConfig.metrics.length === 0) {
        return res.status(400).json({
          error: {
            message: 'Valid report configuration with metrics array is required'
          }
        });
      }

      // Only admins can generate custom reports
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to generate custom reports'
          }
        });
      }

      // Check if admin has reporting permission
      const admin = await AdminCrud.getAdminByUserId(req.user.id);
      
      if (!admin || !admin.permissions.includes('reporting')) {
        return res.status(403).json({
          error: {
            message: 'Insufficient permissions to generate custom reports'
          }
        });
      }

      // Generate custom report
      const report = await reportService.generateCustomReport(reportConfig);

      res.status(200).json(report);
    } catch (error) {
      logger.error('Error in generateCustomReport controller:', error);
      next(error);
    }
  }
}

module.exports = new ReportController();
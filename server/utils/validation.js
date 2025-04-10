const { ValidationError, ERROR_CODES } = require('./errors');

const validateMedication = (medication) => {
  const errors = [];
  
  if (!medication.name || typeof medication.name !== 'string') {
    errors.push('Medication name is required and must be a string');
  }
  
  if (!medication.dosage || typeof medication.dosage !== 'string') {
    errors.push('Medication dosage is required and must be a string');
  }
  
  if (!medication.frequency || typeof medication.frequency !== 'string') {
    errors.push('Medication frequency is required and must be a string');
  }
  
  if (!medication.duration || typeof medication.duration !== 'string') {
    errors.push('Medication duration is required and must be a string');
  }
  
  if (errors.length > 0) {
    throw new ValidationError(
      'Invalid medication data',
      { errors, medication }
    );
  }
};

const validateDates = (appointmentDate, expiryDate) => {
  const appointment = new Date(appointmentDate);
  const expiry = new Date(expiryDate);
  const now = new Date();
  
  if (expiry <= appointment) {
    throw new ValidationError(
      'Expiry date must be after appointment date',
      { appointmentDate, expiryDate }
    );
  }
  
  if (expiry <= now) {
    throw new ValidationError(
      'Expiry date must be in the future',
      { expiryDate, currentDate: now }
    );
  }
  
  // Check if expiry date is within reasonable range (e.g., 1 year)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (expiry > oneYearFromNow) {
    throw new ValidationError(
      'Expiry date cannot be more than one year from now',
      { expiryDate, maxAllowedDate: oneYearFromNow }
    );
  }
};

module.exports = {
  validateMedication,
  validateDates
}; 
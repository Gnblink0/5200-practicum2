class PrescriptionError extends Error {
  constructor(message, code, context) {
    super(message);
    this.name = 'PrescriptionError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends PrescriptionError {
  constructor(message, context) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

class TransactionError extends PrescriptionError {
  constructor(message, context) {
    super(message, 'TRANSACTION_ERROR', context);
    this.name = 'TransactionError';
  }
}

class AuthorizationError extends PrescriptionError {
  constructor(message, context) {
    super(message, 'AUTHORIZATION_ERROR', context);
    this.name = 'AuthorizationError';
  }
}

const ERROR_CODES = {
  INVALID_MEDICATION: 'INVALID_MEDICATION',
  INVALID_EXPIRY: 'INVALID_EXPIRY',
  CONCURRENT_MODIFICATION: 'CONCURRENT_MODIFICATION',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TRANSACTION_ERROR: 'TRANSACTION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  DUPLICATE_PRESCRIPTION: 'DUPLICATE_PRESCRIPTION',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

module.exports = {
  PrescriptionError,
  ValidationError,
  TransactionError,
  AuthorizationError,
  ERROR_CODES
}; 
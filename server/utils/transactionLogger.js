const { v4: uuidv4 } = require('uuid');

class TransactionLogger {
  constructor() {
    this.transactions = new Map();
  }

  generateTransactionId() {
    return uuidv4();
  }

  start(operation, context = {}) {
    const transactionId = this.generateTransactionId();
    const startTime = Date.now();
    
    this.transactions.set(transactionId, {
      operation,
      startTime,
      context,
      status: 'started'
    });

    console.log(`[Transaction ${transactionId}] Started ${operation}`, {
      context,
      timestamp: new Date(startTime).toISOString()
    });

    return transactionId;
  }

  success(transactionId, result = {}) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      console.warn(`Transaction ${transactionId} not found`);
      return;
    }

    const duration = Date.now() - transaction.startTime;
    transaction.status = 'completed';
    transaction.duration = duration;
    transaction.result = result;

    console.log(`[Transaction ${transactionId}] Completed successfully`, {
      operation: transaction.operation,
      duration: `${duration}ms`,
      result,
      timestamp: new Date().toISOString()
    });

    this.transactions.delete(transactionId);
  }

  error(transactionId, error) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      console.warn(`Transaction ${transactionId} not found`);
      return;
    }

    const duration = Date.now() - transaction.startTime;
    transaction.status = 'failed';
    transaction.duration = duration;
    transaction.error = error;

    console.error(`[Transaction ${transactionId}] Failed`, {
      operation: transaction.operation,
      duration: `${duration}ms`,
      error: {
        message: error.message,
        code: error.code,
        context: error.context,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });

    this.transactions.delete(transactionId);
  }

  rollback(transactionId, reason) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      console.warn(`Transaction ${transactionId} not found`);
      return;
    }

    console.warn(`[Transaction ${transactionId}] Rolling back`, {
      operation: transaction.operation,
      reason,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new TransactionLogger(); 
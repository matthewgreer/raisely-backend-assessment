const CUSTOM_ERRORS = [
  'NotFoundError',
  'TransactionError',
  'ValidationError',
]

const isCustomError = (error) => {
  return CUSTOM_ERRORS.includes(error.name);
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = 'NotFoundError';
  }
}

class TransactionError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = 'TransactionError';
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = 'ValidationError';
  }
}

module.exports = {
  isCustomError,
  NotFoundError,
  TransactionError,
  ValidationError,
};

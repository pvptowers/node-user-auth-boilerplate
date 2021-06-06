class ErrorResponse extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.isOperations = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;

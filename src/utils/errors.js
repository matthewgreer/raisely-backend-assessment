class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
    this.name = "NotFoundError";
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
    this.name = "ValidationError";
  }
}

module.exports = {
  NotFoundError,
  ValidationError
};

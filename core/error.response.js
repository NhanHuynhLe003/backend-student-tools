const statusCodes = require("./statusCode");
const reasonPhrases = require("./reasonPhrase");

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

//conflict
class ConflictRequestError extends ErrorResponse {
  constructor(message = reasonPhrases.CONFLICT, status = statusCodes.CONFLICT) {
    super(message, status);
  }
}

//Forbidden
class BadRequestError extends ErrorResponse {
  constructor(
    message = reasonPhrases.BAD_REQUEST,
    status = statusCodes.BAD_REQUEST
  ) {
    super(message, status);
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(
    message = reasonPhrases.UNAUTHORIZED,
    status = statusCodes.UNAUTHORIZED
  ) {
    super(message, status);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(
    message = reasonPhrases.NOT_FOUND,
    status = statusCodes.NOT_FOUND
  ) {
    super(message, status);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(
    message = reasonPhrases.FORBIDDEN,
    status = statusCodes.FORBIDDEN
  ) {
    super(message, status);
  }
}
module.exports = {
  ConflictRequestError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
};

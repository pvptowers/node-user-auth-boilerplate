// class ErrorResponse extends Error {
//   constructor(message, status, errors) {
//     super(message);
//     this.status = status;
//     this.errors = errors;
//     this.isOperations = true;

//     Error.captureStackTrace(this, this.constructor);
//   }
// }

//module.exports = ErrorResponse;

class ErrorResponse extends Error {
  constructor(message, statusCode, errors) {
    super(message);
    console.log("INSIDE CONSTRUCTIO", this);
    this.statusCode = statusCode;
    this.statusState = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.errors = errors;
    this.isOperational = true;
    console.log("FROM ERROR RESPONSE", Error, message, statusCode, errors);

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;

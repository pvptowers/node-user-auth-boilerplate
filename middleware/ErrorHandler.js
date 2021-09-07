const ErrorResponse = require("./errorResponse");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  console.log("IT REACHES CASTERROR HANDLER", err);
  return new ErrorResponse(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ErrorResponse(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new ErrorResponse(message, 400);
};

const testVal = (error, req, res, next) => {
  console.log("THREE", error);

  let validationErrors;
  // let allErrors;
  if (error.errors) {
    let item = error.errors;
    console.log("FOUR", item);
    validationErrors = {};
    //allErrors = {};

    error.errors.forEach((item) => (validationErrors[item.param] = item.msg));
    console.log("FIVE", validationErrors);
    //errors.forEach((error) => (allErrors[error.param] = error.msg));
    return new ErrorResponse(validationErrors, 400);
  }

  // console.log("SIX", validationErrors);
  // return res.status(error.statusCode).send({
  //   path: req.originalUrl,
  //   timestamp: new Date().getTime(),
  //   status: error.status,
  //   error: error,
  //   message: error.message,
  //   stack: error.stack,
  //   validationErrors,
  // });
};

const handleJWTError = () =>
  new ErrorResponse("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new ErrorResponse("Your token has expired please login again", 401);

const sendErrorDev = (err, req, res, next) => {
  console.log("SEVEN", err);
  let validationErrors;
  if (err.errors) {
    validationErrors = {};
    err.errors.forEach((error) => (validationErrors[error.param] = error.msg));
  } else {
    validationErrors = {};
  }

  console.log("IN SENDERRORDEVB", validationErrors);
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    validationErrors,
  });
};

// const { status, message, errors } = err;

// err.statusCode = err.statusCode || 500;
// err.status = err.status || "error";
// const sendErrorProd = (err, req, res, next) => {
//   console.log("PRODUCTION ERROR", err);
//   if (err.isOperational) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   } else {
//     res.status(500).json({
//       status: "error",
//       message: "Something went wrong",
//     });
//   }
// };

// if (
//   process.env.NODE_ENV === "development" ||
//   process.env.NODE_ENV === "test"
// ) {
//   let error = { ...err };
//   error.message = err.message;
//   console.log("DEV ERROR", res);
//   sendErrorDev(err, res);

//   // if (error.name === "ValidationError")
//   //   error = handleValidationErrorDB(error);
//   // console.log(err.message)
// } else if (process.env.NODE_ENV === "production") {
//   let error = { ...err };
//   error.message = err.message;
//   if (error.message === "Validation Failure") error = testVal(error);
//   if (error.name === "CastError") error = handleCastErrorDB(error);
//   if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//   if (error.name === "ValidationError")
//     error = handleValidationErrorDB(error);
//   if (error.name === "JsonWebTokenError") error = handleJWTError();
//   if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
//   sendErrorProd(error, req, res);
// }
// };

//module.exports = errorHandler;
const sendErrorProd = (err, req, res, next) => {
  console.log("SEVEN - PROD", err);
  let validationErrors;
  if (err.errors) {
    validationErrors = {};
    errors.forEach((error) => (validationErrors[error.param] = error.msg));
  } else {
    validationErrors = {};
  }

  console.log("IN SENDEERROR PROD -here", validationErrors);
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

// module.exports = (err, req, res, next) => {
//   const { status, message, errors } = err;

//   let error = { ...err };
//   error.message = err.message;
//   if (error.message === "Validation Failure") {
//     error = testVal(error);
//   }
//   if (error.name === "CastError") {
//     error = handleCastErrorDB(error);
//   }
//   if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//   if (error.name === "ValidationError") error = handleValidationErrorDB(error);
//   if (error.name === "JsonWebTokenError") error = handleJWTError();
//   if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

//   console.log("HERES THE STATUS CODE", err.statusCode);
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   if (
//     process.env.NODE_ENV === "development" ||
//     process.env.NODE_ENV === "test"
//   ) {
//     sendErrorDev(err, req, res, next);
//   } else if (process.env.NODE_ENV === "production") {
//     sendErrorProd(error, req, res, next);
//   }
// };

//THIS SECTION WORKS

// module.exports = (err, req, res, next) => {
//   console.log("INCOMING ERROR", err);
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   if (
//     process.env.NODE_ENV === "development" ||
//     process.env.NODE_ENV === "test"
//   ) {
//     let error = { ...err };
//     console.log("IN PROD SECTION", error);
//     error.message = err.message;
//     if (error.message === "Validation Failure") {
//       error = testVal(error);
//     }
//     if (error.name === "CastError") error = handleCastErrorDB(error);
//     if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//     if (error.name === "ValidationError")
//       error = handleValidationErrorDB(error);
//     if (error.name === "JsonWebTokenError") error = handleJWTError();
//     if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
//     sendErrorDev(err, req, res);
//   } else if (process.env.NODE_ENV === "production") {
//     let error = { ...err };
//     console.log("IN PROD SECTION", error);
//     error.message = err.message;
//     if (error.message === "Validation Failure") {
//       error = testVal(error);
//     }
//     if (error.name === "CastError") error = handleCastErrorDB(error);
//     if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//     if (error.name === "ValidationError")
//       error = handleValidationErrorDB(error);
//     if (error.name === "JsonWebTokenError") error = handleJWTError();
//     if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
//     sendErrorProd(error, req, res);
//   }
// };

//END OF WORKING SECTION

module.exports = (err, req, res, next) => {
  console.log("ONE", err);
  let error = { ...err };
  error.message = err.message;

  // if (error.message === "Validation Failure") {
  //   console.log("TWO", error);
  //   error = testVal(error);
  // }
  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
  sendErrorDev(error, req, res, next);
  sendErrorProd(error, req, res);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorProd(error, req, res);
  }
};

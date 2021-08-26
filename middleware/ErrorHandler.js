const ErrorResponse = require("./errorResponse");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  console.log("IT REACHES CASTERROR HANDLER", err);
  return new ErrorResponse(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/([" '])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ErrorResponse(message, 400);
};

const handleValidationErrorDB = (err) => {
  console.log("HERES THE DUPLICATE FIELDS ERROR 111111111111");
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new ErrorResponse(message, 400);
};

const testVal = (err) => {
  let validationErrors;
  // let allErrors;
  if (errors) {
    validationErrors = {};
    //allErrors = {};

    errors.forEach((error) => (validationErrors[error.param] = error.msg));

    //errors.forEach((error) => (allErrors[error.param] = error.msg));
  }

  return res.status(status).send({
    path: req.originalUrl,
    timestamp: new Date().getTime(),
    message,
    validationErrors,
    status,
  });
};

const handleJWTError = () =>
  new ErrorResponse("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new ErrorResponse("Your token has expired please login again", 401);

const sendErrorDev = (err, req, res, next) => {
  console.log("SEND DEV ERROR", err, res);
  let validationErrors;
  if (err.errors) {
    validationErrors = {};
    errors.forEach((error) => (validationErrors[error.param] = error.msg));
  } else {
    validationErrors = {};
  }
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
  if (err.isOperational) {
    console.log("THE ERROR IS OPERATIONAL", err.isOperational);
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

module.exports = (err, req, res, next) => {
  console.log("ERROR ARRIVING IN EXPORT _ WHAQTS STATUS", err.statusCode);
  const { status, message, errors } = err;

  console.log("BEFORE", err.statusCode);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log("AFTER", err.statusCode);

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    console.log("THIS IS AN ERROR FROM DEV", err);
    let error = { ...err };
    error.message = err.message;
    console.log("DEV ERROR", res);
    sendErrorDev(err, req, res, next);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    console.log("ERROR IN ELSE IF PROD", error);
    error.message = err.message;
    if (error.message === "Validation Failure") {
      error = testVal(error);
    }
    if (error.name === "CastError") {
      console.log("INSIDE PROD PASS TO HANDLER", error);
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorProd(error, req, res, next);
  }
};

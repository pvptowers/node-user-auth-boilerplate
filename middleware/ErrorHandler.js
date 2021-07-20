const ErrorResponse = require("./errorResponse");

const errorHandler = (err, req, res, next) => {
  const handleValidationErrorDB = (err) => {
    //LOOP OVER ERRORS OBJECT TO INCLUDE ALL VALIDATION ERROR MESSAGES
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new ErrorResponse(message, 400);
  };

  const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new ErrorResponse(message, 400);
  };

  const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/([" '])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
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

  const sendErrorDev = (err, res) => {
    let validationErrors;
    if (errors) {
      validationErrors = {};
      //allErrors = {};

      errors.forEach((error) => (validationErrors[error.param] = error.msg));

      //errors.forEach((error) => (allErrors[error.param] = error.msg));
    }
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      validationErrors,
    });

    // res.json({
    //   status: err.status,
    //   error: err,
    //   message: err.message,
    //   stack: err.stack,
    // });
  };

  const { status, message, errors } = err;

  // if (err.name === "CastError") {
  //   const message = `Reource not found `;
  //   error = new ErrorResponse(message, 404);
  // }
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  const sendErrorProd = (err, res) => {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Something went wrong",
      });
    }
  };

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    let error = { ...err };
    error.message = err.message;

    sendErrorDev(err, res);

    // if (error.name === "ValidationError")
    //   error = handleValidationErrorDB(error);
    // console.log(err.message)
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (error.message === "Validation Failure") error = testVal(error);
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};

module.exports = errorHandler;

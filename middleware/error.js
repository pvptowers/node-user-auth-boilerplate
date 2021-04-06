const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  //HANDLE INVALID DATABASE ID'S PASSED IN URL PARAMS
  const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new ErrorResponse(message, 400);
  };

  //HANDLE DUPLICATE FIELDS WHERE UNIQUE = TRUE IN MODEL
  const handleDuplicateFieldsDB = (err) => {
    //const value = err.errmsg.match(/([" '])(\\?.)*?\1/)[0];
    const message = `Duplicate field value entered`;
    console.log("THIS IS AN ERROR");
    return new ErrorResponse(message, 400);
  };

  //MONGOOSE VALIDATION ERROR
  const handleValidationErrorDB = (err) => {
    //LOOP OVER ERRORS OBJECT TO INCLUDE ALL VALIDATION ERROR MESSAGES
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new ErrorResponse(message, 400);
  };

  //HANDLE ERROR FOR INVALID JWT TOKEN - ONLY WORKS IN PRODUCTION
  const handleJWTError = () =>
    new ErrorResponse("Invalid token. Please log in again!", 401);

  //HANDLE ERROR FOR EXPIRED JWT TOKEN - ONLY WORKS IN PRODUCTION
  const handleJWTExpiredError = () =>
    new ErrorResponse("Your token has expired! Please log in again.", 401);

  //DEFINE ERROR MESSAGES SENT IN DEVELOPMENT
  const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  };

  //DEFINE ERROR MESSAGES SENT IN PRODUCTION
  const sendErrorProd = (err, res) => {
    //OPERATIONAL ERROR - SEND MESSAGE TO CLIENT
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.messaage,
      });
    }
    //PROGRAMMING OR UNKNOWN ERROR - DON'T LEAK ERROR DETAILS TO CLIENT
    else {
      //LOG ERROR FOR DEVELOPER
      console.error("ERROR", err);
      //SEND GENERIC MESSAGE TO CLIENT
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
  };

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    let error = { ...err };
    console.log("THIS IS THE ERROR CODE", error.code);

    error.message = err.message;
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;

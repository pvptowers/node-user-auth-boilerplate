const ErrorResponse = require("./errorResponse");

// const prodError = (err, req, res) => {
//   if (req.originalUrl.startsWith("/api")) {
//     if (err.isOperational) {
//       return res.status(err.status).json({
//         status: err.status,
//         message: err.message,
//       });
//     }
//     // B) Programming or other unknown error: don't leak error details
//     // 1) Log error
//     console.error("ERROR 💥", err);
//     // 2) Send generic message
//     return res.status(500).json({
//       status: "error",
//       message: "Something went very wrong!",
//     });
//   }
// };

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new ErrorResponse(message, 400);
};

module.exports = (err, req, res, next) => {
  const { status, message, errors } = err;

  if (err.name === "CastError") {
    const message = `Reource not found `;
    error = new ErrorResponse(message, 404);
  }

  if (message === "Validation Failure") {
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
  } else if (err.message === "test") {
    res.status(401).send({
      message: "TESTING2",
    });
  } else {
    res.status(401).send({
      message: "NOT",
    });
  }
};

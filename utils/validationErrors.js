const { validationResult } = require("express-validator");

const ErrorResponse = require("../middleware/errorResponse");
exports.validationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  console.log("TESTING VALERRORS", errors);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse("Validation Failure", 401, errors.array()));
  }
  return next();
};

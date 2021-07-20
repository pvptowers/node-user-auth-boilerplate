const { check, validationResult } = require("express-validator");
const ErrorResponse = require("../middleware/errorResponse");
exports.validationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse("Validation Failure", 401, errors.array()));
  }
  return next();
};

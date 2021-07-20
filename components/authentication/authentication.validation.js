const { check, validationResult } = require("express-validator");
const Team = require("../../models/team.model");
const User = require("../../models/user.model");
const ErrorResponse = require("../../middleware/errorResponse");
exports.newAccountValidation = [
  check("teamName")
    .notEmpty()
    .withMessage("You must provide a team name")
    .bail(),
  check("email")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        return Promise.reject("A user with this email already exists");
      }
    })
    .bail(),
  check("email").notEmpty().withMessage("You must provide an email").bail(),

  check("password")
    .notEmpty()
    .withMessage("You must provide a password")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage(
      "Password have at least 1 uppercase, 1 lowercase and 1 letter"
    ),
  check("passwordConfirm")
    .custom(async (passwordConfirm, { req }) => {
      const password = req.body.password;
      if (password !== passwordConfirm) {
        return Promise.reject("Passwords do not match");
      }
    })
    .bail(),
  check("agreedTerms")
    .custom(async (agreedTerms, { req }) => {
      if (!agreedTerms) {
        return Promise.reject(
          "You need to agree to the terms to create an account"
        );
      }
    })
    .bail(),
];

// exports.validationErrors = async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     console.log(new ErrorResponse("Validation Failure", 401, errors.array()));
//     return next(new ErrorResponse("Validation Failure", 401, errors.array()));
//   }
//   return next();
// };

const { check } = require("express-validator");
const Team = require("../../models/team.model");
const User = require("../../models/user.model");

exports.registrationValidation = [
  check("teamName")
    .notEmpty()
    .withMessage("You must provide a team name")
    .bail(),
  check("teamName")
    .custom(async (teamName) => {
      const team = await Team.findOne({ teamName });
      if (team) {
        return Promise.reject("A team with that name already exists");
      }
    })
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

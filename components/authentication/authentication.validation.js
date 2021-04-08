const { check, validationResult } = require("express-validator");
const Team = require("../../models/team.model");
const User = require("../../models/user.model");

const ErrorResponse = require("../../utils/errorResponse");

exports.newAccountValidation = [
  check("teamName").custom(async (teamName) => {
    const team = await Team.findOne({ teamName });
    if (team) {
      throw new ErrorResponse("A Team with this name already exists", 401);
    }
  }),
  check("email")
    .isEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email }).select("+password");
      if (user) {
        throw new ErrorResponse(
          "A user with this email already exists. Please login instead",
          401
        );
      }
    }),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more"),
  check("passwordConfirm").custom(async (passwordConfirm, { req }) => {
    console.log(passwordConfirm);
    console.log(req.body.password);
    const password = req.body.password;
    if (password !== passwordConfirm) {
      throw new ErrorResponse("Passwords must match", 422);
    }
  }),
  //   check("agreedTerms").custom(async (agreedTerms, { req }) => {
  //     const agreed = await req.body.agreedTerms;
  //     if (agreed !== true) {
  //       throw new ErrorResponse("You must agree terms");
  //     }
  //   }),
];
// exports.invitedUserValidation = [
//   check("email")
//     .isEmail()
//     .custom(async (email) => {
//       const user = await User.findOne({ email }).select("+password");
//       if (user) {
//         throw new ErrorResponse(
//           "A user with this email already exists. Please login instead",
//           401
//         );
//       }
//     }),
//   check("password")
//     .isLength({ min: 6 })
//     .withMessage("Password must be 6 characters or more"),
//   check("passwordConfirm").custom(async (passwordConfirm, { req }) => {
//     const password = req.body.password;
//     if (password !== passwordConfirm) {
//       throw new Error("Passwords must match");
//     }
//   }),
// ];
// exports.loginValidation = [
//   check("email")
//     .not()
//     .isEmpty()
//     .withMessage("you must provide an email111")
//     .custom(async (email) => {
//       const user = await User.findOne({ email }).select("+password");
//       if (!user) {
//         throw new ErrorResponse("Invalid Credentials11111", 401);
//       }
//     }),
//   check("password").not().isEmpty().withMessage("You must enter a password"),
// ];

// exports.updatePasswordValidation = [
//   check("currentPassword")
//     .not()
//     .isEmpty()
//     .withMessage("You must enter your current password"),
//   check("newPassword")
//     .not()
//     .isEmpty()
//     .withMessage("You must enter a new password"),
// ];

// exports.updateUserValidation = [
//   check("email")
//     .isEmail()
//     .custom(async (email) => {
//       const user = await User.findOne({ email }).select("+password");
//       if (user) {
//         throw new ErrorResponse(
//           "A user with this email already exists. You cannot update your email to this address",
//           401
//         );
//       }
//     }),
// ];

exports.validationErrors = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  return next();
};

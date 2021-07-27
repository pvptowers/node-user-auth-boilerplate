//LOCAL DEPENDENCIES
const User = require("../../models/user.model");
const asyncHandler = require("../../middleware/asyncHandler");
const crypto = require("crypto");
const authenticatedToken = require("../../middleware/authenticatedToken");
const Team = require("../../models/team.model");
const mongoose = require("mongoose");
const ErrorResponse = require("../../middleware/errorResponse");
const sendEmail = require("../../utils/email");
const authService = require("./authentication.service");
const tokenService = require("./token.service");
// DESCRIPTION: CREATE A NEW ACCOUNT & ROOT USER
// ROUTE: POST /auth/create-account
// ACCESS: Public
exports.createAccount = asyncHandler(async (req, res, next) => {
  const newUser = await authService.createAccount(req.body);
  const token = await tokenService.generateToken(newUser);
  res.status(200).send({ newUser, token });
  // const messagetosend = "Account created successfully";

  // authenticatedToken(newUser, 200, res, messagetosend);
});

// DESCRIPTION: Authenticate/Login Existing User
// ROUTE: POST /auth/login
// ACCESS: Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authService.loginUser(email, password, next);
  authenticatedToken(user, 200, res);
});

// DESCRIPTION: LOGOUT USER AND CLEAR TOKEN
// ROUTE: POST /auth/logout
// ACCESS: Private
exports.logout = asyncHandler(async (req, res, next) => {
  await authService.logoutUser();
  res.status(200).json({
    success: true,
    data: {},
  });
});

// DESCRIPTION: REQUEST FOR FORGOTTEN USER PASSWORD
// ROUTE: POST /auth/forgot-password
// ACCESS: Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const resetToken = await authService.passwordResetToken(req.body.email);
  const urlProtocol = req.protocol;
  const urlHost = req.get("host");
  await authService.forgotPasswordRequest(
    urlProtocol,
    urlHost,
    resetToken,
    req.body.email
  );

  res.status(200).json({
    status: "Success",
    message: "token sent to email",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await authService.resetPassword(
    req.params.token,
    req.body.password,
    req.body.passwordConfirm
  );
  authenticatedToken(user, 200, res);
});

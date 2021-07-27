const asyncHandler = require("../../middleware/asyncHandler");
const authenticatedToken = require("../../middleware/authenticatedToken");
const authService = require("./authentication.service");
const tokenService = require("./token.service");

// DESCRIPTION: CREATE A NEW ACCOUNT & ROOT USER
// ROUTE: POST /auth/create-account
// ACCESS: Public
exports.createAccount = asyncHandler(async (req, res, next) => {
  const newUser = await authService.createAccount(req.body);
  const token = await tokenService.generateToken(newUser);
  res.status(200).send({
    data: { newUser },
    token,
    success: true,
    message: "Account created successfully",
  });
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
  await authService.forgotPasswordRequest(
    req.protocol,
    req.get("host"),
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

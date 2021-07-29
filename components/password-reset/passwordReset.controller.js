const asyncHandler = require("../../middleware/asyncHandler");
const authenticatedToken = require("../../middleware/authenticatedToken");
const authService = require("./authentication.service");

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

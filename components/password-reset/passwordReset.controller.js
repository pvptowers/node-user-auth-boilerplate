const asyncHandler = require("../../middleware/asyncHandler");
const authMiddleware = require("../../middleware/authentication.middleware");
const passwordResetService = require("./passwordReset.service");

// DESCRIPTION: REQUEST FOR FORGOTTEN USER PASSWORD
// ROUTE:       POST /AUTH/FORGOT-PASSWORD
// ACCESS:      PUBLIC
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const resetToken = await passwordResetService.passwordResetToken(
    req.body.email
  );
  await passwordResetService.forgotPasswordRequest(
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

// DESCRIPTION: RESET USER PASSWORD
// ROUTE:       PATCH /AUTH/RESETPASSWORD
// ACCESS:      PUBLIC
exports.resetPassword = asyncHandler(async (req, res, next) => {
  console.log("BODY", req.params.token);
  const user = await passwordResetService.resetPassword(
    req.params.token,
    req.body.password,
    req.body.passwordConfirm
  );
  authMiddleware.sendAuthToken("reset", user, 200, res);
});

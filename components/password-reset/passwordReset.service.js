const asyncHandler = require("../../middleware/asyncHandler");
const ErrorResponse = require("../../middleware/errorResponse");
const User = require("../../models/user.model");
const sendEmail = require("../../utils/email");
const crypto = require("crypto");
const userService = require("../users/user.service");

const passwordResetToken = async (email) => {
  const user = await userService.findUserByEmail(email);
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  return resetToken;
};

const forgotPasswordRequest = async (
  urlProtocol,
  urlHost,
  resetToken,
  userEmail
) => {
  const resetURL = `${urlProtocol}://${urlHost}/auth/resetPassword/${resetToken}}`;
  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to: ${resetURL}. \n If you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: userEmail,
      subject: "Your password reset token (Valid for 10 mins)",
      message,
    });
  } catch (err) {
    const user = await userService.findUserByEmail(userEmail);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ErrorResponse(
      "There was an error sending the email, try again later",
      500
    );
  }
};

const resetPassword = asyncHandler(
  async (token, userPassword, userPasswordConfirm) => {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      throw new ErrorResponse("Token is invalid or has expired", 400);
    }
    user.password = userPassword;
    user.passwordConfirm = userPasswordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    return await user.save();
  }
);

module.exports = {
  passwordResetToken,
  forgotPasswordRequest,
  resetPassword,
};

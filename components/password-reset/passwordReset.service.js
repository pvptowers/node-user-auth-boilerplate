const asyncHandler = require("../../middleware/asyncHandler");
const ErrorResponse = require("../../middleware/errorResponse");
const mongoose = require("mongoose");
const User = require("../../models/user.model");
const Team = require("../../models/team.model");
const sendEmail = require("../../utils/email");
const crypto = require("crypto");

const teamService = require("../teams/team.service");
const userService = require("../users/user.service");

const passwordResetToken = async (userEmail) => {
  //Get user based on POSTED email
  const user = await User.findOne({ email: userEmail });

  if (!user) {
    throw new ErrorResponse("There is no user with that email address", 404);
  }
  //Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  return resetToken;
};

const forgotPasswordRequest = async (
  urlProtocol,
  urlHost,
  resetToken,
  userEmail,
  next
) => {
  //Send it back as an email
  // const resetURL = `${req.protocol}://${req.get(
  //   "host"
  // )}/auth/resetPassword/${resetToken}}`;
  const resetURL = `${urlProtocol}://${urlHost}/auth/resetPassword/${resetToken}}`;
  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to: ${resetURL}. \n If you didn't forget your password, please ignore this email!`;

  try {
    console.log("TRYING TO SEND", userEmail);
    await sendEmail({
      email: userEmail,
      subject: "Your password reset token (Valid for 10 mins)",
      message,
    });

    // res.status(200).json({
    //   status: "Success",
    //   message: "token sent to email",
    // });
  } catch (err) {
    console.log(err);
    const user = await User.findOne({ email: userEmail });
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorResponse(
        "There was an error sending the email, try again later"
      ),
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
    //If token has not expired and there is a user, set the new password
    if (!user) {
      return next(new ErrorResponse("Token is invalid or has expired", 400));
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
  resetToken,
};

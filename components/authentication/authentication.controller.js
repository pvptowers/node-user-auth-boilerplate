//LOCAL DEPENDENCIES
const User = require("../../models/user.model");
const asyncHandler = require("../../middleware/asyncHandler");
const crypto = require("crypto");
const authenticatedToken = require("../../middleware/authenticatedToken");
const Team = require("../../models/team.model");
const mongoose = require("mongoose");
const { check, validationResult } = require("express-validator");
const ErrorResponse = require("../../middleware/errorResponse");
const sendEmail = require("../../utils/email");
const { createTeam } = require("../teams/team.service");
// DESCRIPTION: CREATE A NEW ACCOUNT & ROOT USER
// ROUTE: POST /auth/create-account
// ACCESS: Public
exports.createAccount = asyncHandler(async (req, res, next) => {
  const { teamName } = req.body;
  const newAccount = await createTeam(teamName);
  // const newAccount = await Team.create({
  //   teamName: req.body.teamName,
  //   _id: new mongoose.Types.ObjectId(),
  // });
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    signupDate: Date.now(),
    team: newAccount._id,
    role: req.body.role,
    agreedTerms: req.body.agreedTerms,
  });

  const accounts = await Team.findById(newAccount._id);

  accounts.users.push(newUser);
  await accounts.save();
  const messagetosend = "Account created successfully";
  authenticatedToken(newUser, 200, res, messagetosend);
});

// DESCRIPTION: Authenticate/Login Existing User
// ROUTE: POST /auth/login
// ACCESS: Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  //CHECK IF EMAIL & PASSWORD EXIST
  if (!email || !password) {
    return next(
      new ErrorResponse(`Please enter valid email and password`, 401)
    );
  }

  // CHECK IF USER EXISTS
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(
      new ErrorResponse("Please enter valid email and password", 401)
    );
  }
  //CHECK IF PASSWORD IS CORRECT
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }

  //IF PASSWORD IS CORRECT, SEND TOKEN TO CLIENT
  authenticatedToken(user, 200, res);
};

// DESCRIPTION: LOGOUT USER AND CLEAR TOKEN
// ROUTE: POST /auth/logout
// ACCESS: Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  //Get user based on POSTED email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse("There is no user with that email address", 404)
    );
  }
  //Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //Send it back as an email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/auth/resetPassword/${resetToken}}`;

  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to: ${resetURL}. \n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Your password reset token (Valid for 10 mins)",
      message,
    });

    res.status(200).json({
      status: "Success",
      message: "token sent to email",
    });
  } catch (err) {
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
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //If token has not expired and there is a user, set the new password
  if (!user) {
    return next(new ErrorResponse("Token is invalid or has expired", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //Update changedPasswordAt property for the user

  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
  //Log the user in, send JWT
  authenticatedToken(user, 200, res);
});

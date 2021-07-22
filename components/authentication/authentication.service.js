const asyncHandler = require("../../middleware/asyncHandler");
const ErrorResponse = require("../../middleware/errorResponse");
const mongoose = require("mongoose");
const User = require("../../models/user.model");
const LoginUser = asyncHandler(async (email, password, next) => {
  console.log("REACHES HERE", email, password);
  //CHECK IF EMAIL & PASSWORD EXIST
  if (!email || !password) {
    console.log("WE REACH THIS ERROR POINT");
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
  return user;
});

module.exports = {
  LoginUser,
};

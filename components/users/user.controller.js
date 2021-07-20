const mongoose = require("mongoose");
const asyncHandler = require("../../middleware/asyncHandler");
const User = require("../../models/user.model");
const authenticatedToken = require("../../middleware/authenticatedToken");
const ErrorResponse = require("../../middleware/errorResponse");

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params._id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndRemove(req.params._id);
  if (!user) {
    return next(new ErrorResponse("No user exists with that id", 404));
  }
  res.status(200).json({
    success: true,
    data: null,
  });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params._id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new ErrorResponse("No user exists with that id", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

const asyncHandler = require("../../middleware/asyncHandler");
const User = require("../../models/user.model");
const ErrorResponse = require("../../middleware/errorResponse");
const userService = require("./user.service");

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await userService.getUserById(req.params._id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  await userService.deleteUser(req.params._id);
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

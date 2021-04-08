const mongoose = require("mongoose");
const asyncHandler = require("../../middleware/asyncHandler");
const User = require("../../models/user.model");
const authenticatedToken = require("../../middleware/authenticatedToken");

exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params._id);
  res.status(200).json({
    success: true,
    data: user,
  });
});

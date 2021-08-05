const User = require("../../models/user.model");
const asyncHandler = require("../../middleware/asyncHandler");
const ErrorResponse = require("../../middleware/errorResponse");
const createUser = async (data, teamId) => {
  return User.create({
    email: data.email,
    password: data.password,
    passwordConfirm: data.passwordConfirm,
    signupDate: Date.now(),
    team: teamId || data.teamId,
    role: data.role,
    agreedTerms: data.agreedTerms,
  });
};

const findUserByEmail = async (email) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ErrorResponse("Please enter valid email and password", 401);
  }
  return user;
};

module.exports = {
  createUser,
  findUserByEmail,
};

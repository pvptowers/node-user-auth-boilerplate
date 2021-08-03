const User = require("../../models/user.model");
const asyncHandler = require("../../middleware/asyncHandler");

const createUser = asyncHandler(async (data, teamId) => {
  return User.create({
    email: data.email,
    password: data.password,
    passwordConfirm: data.passwordConfirm,
    signupDate: Date.now(),
    team: teamId || data.teamId,
    role: data.role,
    agreedTerms: data.agreedTerms,
  });
});

module.exports = {
  createUser,
};

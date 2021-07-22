const User = require("../../models/user.model");
const asyncHandler = require("../../middleware/asyncHandler");

const createUser = asyncHandler(async (userBody, newAccount) => {
  return User.create({
    email: userBody.email,
    password: userBody.password,
    passwordConfirm: userBody.passwordConfirm,
    signupDate: Date.now(),
    team: newAccount || userBody.teamId,
    role: userBody.role,
    agreedTerms: userBody.agreedTerms,
  });
});

module.exports = {
  createUser,
};

const User = require("../../models/user.model");
const ErrorResponse = require("../../middleware/errorResponse");

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ErrorResponse("No user exists with that id", 404);
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndRemove(id);
  if (!user) throw new ErrorResponse("No user exists with that id", 404);
};

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
  getUserById,
  deleteUser,
  createUser,
  findUserByEmail,
};

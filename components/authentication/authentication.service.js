const asyncHandler = require("../../middleware/asyncHandler");
const ErrorResponse = require("../../middleware/errorResponse");
const User = require("../../models/user.model");
const teamService = require("../teams/team.service");
const userService = require("../users/user.service");

const register = async (data) => {
  const newTeam = await teamService.createTeam(data.teamName);
  const newUser = await userService.createUser(data, newTeam._id);
  const team = await teamService.getTeamById(newTeam._id);
  team.users.push(newUser);
  await team.save();
  return newUser;
};

const login = async (email, password) => {
  if (!email || !password) {
    throw new ErrorResponse(`Please enter valid email and password`, 401);
  }
  const user = await userService.findUserByEmail(email);
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ErrorResponse(`Please enter valid email and password`, 401);
  }
  return user;
};

const logoutUser = asyncHandler(async () => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
});

module.exports = {
  register,
  login,
  logoutUser,
};

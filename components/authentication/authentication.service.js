const ErrorResponse = require("../../middleware/errorResponse");
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

module.exports = {
  register,
  login,
};

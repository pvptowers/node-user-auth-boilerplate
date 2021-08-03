const asyncHandler = require("../../middleware/asyncHandler");
const ErrorResponse = require("../../middleware/errorResponse");
const User = require("../../models/user.model");
const teamService = require("../teams/team.service");
const userService = require("../users/user.service");

const register = asyncHandler(async (data) => {
  const newTeam = await teamService.createTeam(data.teamName);
  const newUser = await userService.createUser(data, newTeam._id);
  const team = await teamService.getTeamById(newTeam._id);
  team.users.push(newUser);
  await team.save();
  return newUser;
});

const loginUser = asyncHandler(async (email, password, next) => {
  //CHECK IF EMAIL & PASSWORD EXIST
  if (!email || !password) {
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

const logoutUser = asyncHandler(async () => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
});

module.exports = {
  register,
  loginUser,
  logoutUser,
};

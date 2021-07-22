const asyncHandler = require("../../middleware/asyncHandler");
const ErrorResponse = require("../../middleware/errorResponse");
const mongoose = require("mongoose");
const User = require("../../models/user.model");
const Team = require("../../models/team.model");
const teamService = require("../teams/team.service");
const userService = require("../users/user.service");

const createAccount = asyncHandler(async (newAccountBody) => {
  const newTeam = await teamService.createTeam(newAccountBody.teamName);
  const newUser = await userService.createUser(newAccountBody, newTeam._id);
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

module.exports = {
  createAccount,
  loginUser,
};

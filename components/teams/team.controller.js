const mongoose = require("mongoose");
const asyncHandler = require("../../middleware/asyncHandler");
const Team = require("../../models/team.model");
const ErrorResponse = require("../../middleware/errorResponse");
const User = require("../../models/user.model");
const teamService = require("./team.service");
const userService = require("../users/user.service");
const tokenService = require("../authentication/token.service");
exports.getTeam = asyncHandler(async (req, res, next) => {
  const team = await teamService.getTeamById(req.params._id, next);
  res.status(200).json({
    success: true,
    data: team,
  });
});

exports.addUser = asyncHandler(async (req, res, next) => {
  if (!req.body.teamId) {
    return next(new ErrorResponse("Please provide a team ID", 401));
  }

  const newUser = await userService.createUser(req.body);
  const team = await teamService.getTeamById(req.body.teamId);
  team.users.push(newUser);
  await team.save();

  tokenService.sendAuthToken(newUser, 200, res);
});

exports.updateTeam = asyncHandler(async (req, res, next) => {
  // const team = await teamService.getTeamById(req.params._id);
  const team = await Team.findById(req.params._id);
  if (!team) {
    return next(new ErrorResponse("No Team Exists with this ID"));
  }
  if (!req.body.teamName) {
    return next(new ErrorResponse("You need to provide a teamName"));
  } else {
    team.teamName = req.body.teamName;
    const newteam = await team.save();
    res.status(200).json({
      success: true,
      data: newteam,
    });
  }
});

exports.deleteTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.deleteOne({ _id: req.params._id });

  res.status(200).json({ status: "success", data: null });
});

//separate route to delete all users from team

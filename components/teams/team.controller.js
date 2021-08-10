const mongoose = require("mongoose");
const asyncHandler = require("../../middleware/asyncHandler");
const Team = require("../../models/team.model");
const ErrorResponse = require("../../middleware/errorResponse");
const User = require("../../models/user.model");
const authMiddleware = require("../../middleware/authentication.middleware");
const teamService = require("./team.service");
const userService = require("../users/user.service");
const tokenService = require("../authentication/token.service");

// DESCRIPTION: REQUEST FOR CURRENT TEAM DATA
// ROUTE:       GET /AUTH/GET-TEAM
// ACCESS:      PRIVATE
exports.getTeam = asyncHandler(async (req, res, next) => {
  const team = await teamService.getTeamById(req.params._id);
  res.status(200).json({
    success: true,
    data: team,
  });
});

// DESCRIPTION: REQUEST TO ADD USER TO TEAM
// ROUTE:       POST /AUTH/ADD-USER
// ACCESS:      PRIVATE
exports.addUser = asyncHandler(async (req, res, next) => {
  if (!req.body.teamId) {
    return next(new ErrorResponse("Please provide a team ID", 401));
  }
  const newUser = await userService.createUser(req.body);
  const team = await teamService.getTeamById(req.body.teamId);
  team.users.push(newUser);
  await team.save();
  authMiddleware.sendAuthToken("user added", newUser, 200, res);
});

// DESCRIPTION: REQUEST TO UPDATE TEAM DETAILS
// ROUTE:       PUT /AUTH/UPDATE-TEAM/:_ID
// ACCESS:      PRIVATE
exports.updateTeam = asyncHandler(async (req, res, next) => {
  const changes = { teamName: req.body.teamName };
  const team = await teamService.getTeamById(req.params._id);
  const updatedTeam = await teamService.updateTeam(changes, team);
  res.status(200).json({
    success: true,
    data: updatedTeam,
  });
});

// DESCRIPTION: REQUEST TO DELETE A TEAM
// ROUTE:       PUT /AUTH/DELETE-TEAM/:_ID
// ACCESS:      PRIVATE
exports.deleteTeam = asyncHandler(async (req, res, next) => {
  const team = await teamService.deleteTeam(req.params._id);
  res.status(200).json({ status: "success", data: null });
});

//separate route to delete all users from team

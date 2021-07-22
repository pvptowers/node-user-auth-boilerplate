const mongoose = require("mongoose");
const ErrorResponse = require("../../middleware/errorResponse");
const Team = require("../../models/team.model");
const asyncHandler = require("../../middleware/asyncHandler");

const createTeam = asyncHandler(async (teamName) => {
  return await Team.create({
    teamName,
    _id: new mongoose.Types.ObjectId(),
  });
});

// const getTeamById = asyncHandler(async (teamId) => {
//   const team = await Team.findById(teamId);
//   if (!team) {
//     return next(new ErrorResponse("No Team Exists With This ID", 404));
//   }
// });

const getTeamById = async (teamId, next) => {
  const team = await Team.findById(teamId);
  if (!team) {
    return next(new ErrorResponse("No Team Exists With This ID", 404));
  }
  return team;
};

module.exports = { createTeam, getTeamById };

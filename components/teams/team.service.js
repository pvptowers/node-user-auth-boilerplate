const mongoose = require("mongoose");
const ErrorResponse = require("../../middleware/errorResponse");
const Team = require("../../models/team.model");
const asyncHandler = require("../../middleware/asyncHandler");
const { restart } = require("nodemon");

const createTeam = asyncHandler(async (teamName) => {
  return await Team.create({
    teamName,
    _id: new mongoose.Types.ObjectId(),
  });
});

const getTeamById = async (teamId, next) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ErrorResponse("No Team Exists With This ID", 404);
  }
  return team;
};

// const updateTeam = async ({updatedTeamDetails}) => {
//  const {teamName} = updatedTeamDetails;
//  if (!teamName) {
//    throw new ErrorResponse("You need to provide a teamName")
//  } else {

//  }
// }

module.exports = { createTeam, getTeamById };

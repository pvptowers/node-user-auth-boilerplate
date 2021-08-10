const mongoose = require("mongoose");
const ErrorResponse = require("../../middleware/errorResponse");
const Team = require("../../models/team.model");
const asyncHandler = require("../../middleware/asyncHandler");

const createTeam = async (teamName) => {
  return await Team.create({
    teamName,
    _id: new mongoose.Types.ObjectId(),
  });
};

const getTeamById = async (teamId) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ErrorResponse("No Team Exists With This ID", 404);
  }
  return team;
};

const updateTeam = async (changes, team) => {
  if (!changes.teamName) {
    throw new ErrorResponse("You need to provide a teamName");
  } else {
    team.teamName = changes.teamName;
    const updatedTeam = await team.save();
    return updatedTeam;
  }
};

// const updateTeam = async ({updatedTeamDetails}) => {
//  const {teamName} = updatedTeamDetails;
//  if (!teamName) {
//    throw new ErrorResponse("You need to provide a teamName")
//  } else {

//  }
// }

module.exports = { createTeam, getTeamById, updateTeam };

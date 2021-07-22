const mongoose = require("mongoose");

const Team = require("../../models/team.model");
const asyncHandler = require("../../middleware/asyncHandler");

const createTeam = asyncHandler(async (teamName) => {
  return await Team.create({
    teamName,
    _id: new mongoose.Types.ObjectId(),
  });
});

const getTeamById = asyncHandler(async (teamId) => {
  return await Team.findById(teamId);
});

module.exports = { createTeam, getTeamById };

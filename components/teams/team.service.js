const mongoose = require("mongoose");

const Team = require("../../models/team.model");
const asyncHandler = require("../../middleware/asyncHandler");

const createTeam = asyncHandler(async (teamName) => {
  return await Team.create({
    teamName,
    _id: new mongoose.Types.ObjectId(),
  });
});

module.exports = { createTeam };

const mongoose = require("mongoose");
const asyncHandler = require("../../middleware/asyncHandler");
const Team = require("../../models/team.model");
const authenticatedToken = require("../../middleware/authenticatedToken");

exports.getTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params._id);
  res.status(200).json({
    success: true,
    data: team,
  });
});

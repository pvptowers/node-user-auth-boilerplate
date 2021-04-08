const mongoose = require("mongoose");
const asyncHandler = require("../../middleware/asyncHandler");
const Team = require("../../models/team.model");
const authenticatedToken = require("../../middleware/authenticatedToken");
const ErrorResponse = require("../../utils/errorResponse");

exports.getTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params._id);
  if (!team) {
    return next(new ErrorResponse("No Team Exists With This ID"));
  }
  res.status(200).json({
    success: true,
    data: team,
  });
});

// exports.updateTeam = asyncHandler(async (req, res, next) => {
//   const team = await Team.findById(req.params._id, (err, doc) => {
//     if (err) {
//       return next(new ErrorResponse("Unable to Update Team"));
//     } else {
//       doc.teamName = req.body.teamName;
//       doc.save();
//     }
//     res.status(200).json({
//       success: true,
//       data: doc,
//     });
//   });
// });

// exports.updateTeam = asyncHandler(async (req, res, next) => {
//   const team = await Team.findById(req.params._id, (err, doc) => {
//     if (err) {
//       return next(new ErrorResponse("eror"));
//     } else if (!doc) {
//       return next(new ErrorResponse("No Team Exists With This ID"));
//     } else {
//       doc.teamName = req.body.teamName;
//       doc.save();
//     }
//     res.status(200).json({
//       success: true,
//       data: doc,
//     });
//   });
// });

exports.updateTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params._id);
  console.log(team);
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
  const team = await Team.findByIdAndDelete(req.params._id);
  res.status(200).json({
    success: true,
    data: team,
  });
});

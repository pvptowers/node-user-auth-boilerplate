const mongoose = require("mongoose");
const asyncHandler = require("../../middleware/asyncHandler");
const Team = require("../../models/team.model");
const authenticatedToken = require("../../middleware/authenticatedToken");

exports.getTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params._id);
  // if (!team) {
  //   return next(new ErrorResponse("No Team Exists With This ID"));
  // }
  res.status(200).json({
    success: true,
    data: team,
  });
});

// exports.updateTeam = asyncHandler(async (req, res, next) => {
//   const team = await Team.findById(req.params._id);
//   if (!team) {
//     return next(new ErrorResponse("No Team Exists with this ID"));
//   }
//   if (!req.body.teamName) {
//     return next(new ErrorResponse("You need to provide a teamName"));
//   } else {
//     team.teamName = req.body.teamName;
//     const newteam = await team.save();
//     res.status(200).json({
//       success: true,
//       data: newteam,
//     });
//   }
// });

exports.deleteTeam = asyncHandler(async (req, res, next) => {
  //   const team = await Team.findByIdAndDelete(req.params._id).populate("users");
  const team = await Team.findById(req.params._id);
  const filteredIds = team.users;

  team.remove(team.users);
  //   const result = await Team.deleteMany({ _id: { $in: filteredIds } });
  // console.log(result)
  //   res.status(200).json({
  //     success: true,
  //     data: team,
  //   });
});

//separate route to delete all users from team

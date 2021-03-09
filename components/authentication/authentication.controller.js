//LOCAL DEPENDENCIES
const User = require("../../models/user.model");
const asyncHandler = require("../../middleware/asyncHandler");
const ErrorResponse = require("../../utils/errorResponse");
const authenticatedToken = require("../../middleware/authenticatedToken");
const Team = require("../../models/team.model");
const mongoose = require("mongoose");

// DESCRIPTION: CREATE A NEW ACCOUNT & ROOT USER
// ROUTE: POST /account/create-account
// ACCESS: Public
exports.createAccount = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  if (req.body.agreedTerms === false) {
    return next(
      new ErrorResponse(
        "You need to agree to ther terms and conditions to create an account",
        401
      )
    );
  } else {
    const newAccount = await Team.create({
      teamName: req.body.teamName,
      _id: new mongoose.Types.ObjectId(),
    });
    const newUser = await User.create({
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      signupDate: Date.now(),
      team: newAccount._id,
      role: req.body.role,
      agreedTerms: req.body.agreedTerms,
    });

    const accounts = await Team.findById(newAccount._id);

    accounts.users.push(newUser);
    await accounts.save();
    authenticatedToken(newUser, 200, res);
  }
});

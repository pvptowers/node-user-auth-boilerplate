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

// DESCRIPTION: Authenticate/Login Existing User
// ROUTE: POST /auth/login
// ACCESS: Public
exports.login = async (req, res, next) => {
  console.log(req.body);
  const { email, password } = req.body;
  //CHECK IF EMAIL & PASSWORD EXIST
  if (!email || !password) {
    return next(
      new ErrorResponse(`Please provide your email and password`, 400)
    );
  }

  // CHECK IF USER EXISTS
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }
  //CHECK IF PASSWORD IS CORRECT
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse(`Invalid Credentials`, 401));
  }

  //IF PASSWORD IS CORRECT, SEND TOKEN TO CLIENT
  authenticatedToken(user, 200, res);
};

exports.logout = asyncHandler(async (req, res, next) => {
  console.log(this.logout.constructor.name);

  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
});

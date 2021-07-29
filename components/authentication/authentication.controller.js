const asyncHandler = require("../../middleware/asyncHandler");
const authenticatedToken = require("../../middleware/authenticatedToken");
const authService = require("./authentication.service");
const tokenService = require("./token.service");
const User = require("../../models/user.model");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

// DESCRIPTION: CREATE A NEW ACCOUNT & ROOT USER
// ROUTE: POST /auth/create-account
// ACCESS: Public
exports.createAccount = asyncHandler(async (req, res, next) => {
  const newUser = await authService.createAccount(req.body);
  const token = await tokenService.generateToken(newUser);
  res.status(200).send({
    data: { newUser },
    token,
    success: true,
    message: "Account created successfully",
  });
});

// DESCRIPTION: Authenticate/Login Existing User
// ROUTE: POST /auth/login
// ACCESS: Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authService.loginUser(email, password, next);
  authenticatedToken(user, 200, res);
});

// DESCRIPTION: LOGOUT USER AND CLEAR TOKEN
// ROUTE: POST /auth/logout
// ACCESS: Private
exports.logout = asyncHandler(async (req, res, next) => {
  await authService.logoutUser();
  res.status(200).json({
    success: true,
    data: {},
  });
});

// DESCRIPTION: REQUEST FOR FORGOTTEN USER PASSWORD
// ROUTE: POST /auth/forgot-password
// ACCESS: Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const resetToken = await authService.passwordResetToken(req.body.email);
  await authService.forgotPasswordRequest(
    req.protocol,
    req.get("host"),
    resetToken,
    req.body.email
  );

  res.status(200).json({
    status: "Success",
    message: "token sent to email",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await authService.resetPassword(
    req.params.token,
    req.body.password,
    req.body.passwordConfirm
  );
  authenticatedToken(user, 200, res);
});

// DESCRIPTION: Protect Middleware Method to ensure user is logged in when accessing specific routes
exports.protect = asyncHandler(async (req, res, next) => {
  //GET TOKEN & CHECK IT EXISTS
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //IF NO TOKEN RETURN ERROR MESSAGE
  if (!token) {
    return next(new ErrorResponse("Please log in to access", 401));
  }
  //VERIFY TOKEN WITH JWT
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //CHECK IF USER STILL EXISTS
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new ErrorResponse(
        "The user belonging to this token no longer exists",
        401
      )
    );
  }

  //CHECK IF USER HAS CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
  // if (currentUser.changedPasswordAfter(decoded.iat)) {
  //     return next(new ErrorResponse("User recently changed password, please log in again", 401))
  // }

  //GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

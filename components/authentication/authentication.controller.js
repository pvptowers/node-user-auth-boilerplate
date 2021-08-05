const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const asyncHandler = require("../../middleware/asyncHandler");
const authService = require("./authentication.service");
const tokenService = require("./token.service");

// DESCRIPTION: REGISTER A NEW ACCOUNT & ROOT USER
// ROUTE: POST /AUTH/REGISTER
// ACCESS: PUBLIC
exports.register = asyncHandler(async (req, res, next) => {
  const newUser = await authService.register({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    agreedTerms: req.body.agreedTerms,
    teamName: req.body.teamName,
  });
  tokenService.sendAuthToken(newUser, 200, res);
});

// DESCRIPTION: LOGIN EXISTING USER
// ROUTE: POST /AUTH/LOGIN
// ACCESS: PUBLIC
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);
  tokenService.sendAuthToken(user, 200, res);
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
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new ErrorResponse(
        "User recently changed password, please log in again",
        401
      )
    );
  }

  //GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

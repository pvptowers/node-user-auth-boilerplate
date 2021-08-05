const asyncHandler = require("../../middleware/asyncHandler");
const authMiddleware = require("../../middleware/authentication.middleware");
const authService = require("./authentication.service");

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
  authMiddleware.sendAuthToken("register", newUser, 200, res);
});

// DESCRIPTION: LOGIN EXISTING USER
// ROUTE: POST /AUTH/LOGIN
// ACCESS: PUBLIC
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);
  authMiddleware.sendAuthToken("login", user, 200, res);
});

// DESCRIPTION: LOGOUT USER AND CLEAR TOKEN
// ROUTE: POST /AUTH/LOGOUT
// ACCESS: PUBLIC
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
});

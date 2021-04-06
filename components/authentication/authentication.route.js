//THIRD PARTY LIBRARIES
const express = require("express");

//IMPORT CONTROLLER FUNCTIONS
const {
  createAccount,
  getAccount,
  getAllTeams,
  login,
} = require("./authentication.controller");

//APPLY MIDDLEWARE
//PROTECTED ROUTE - REQUIRES AUTHENTICATION
// const { protect } = require("../middleware/protect");
//VALIDATION MIDDLEWARE
// const {
//   newAccountValidation,
//   invitedUserValidation,
//   validationErrors,
// } = require("../middleware/validator");
//const { userAuthentication } = require("../controllers/authController");

//CALL EXPRESS ROUTER
const router = express.Router();

//DEFINTE ROUTES
router.post(
  "/create-account",
  //   newAccountValidation,
  //   validationErrors,
  createAccount
);
router.post("/login", login);
// router.get("/all-teams", getAllTeams);
// router.get(`/:id`, getAccount);
// router.post(
//   "/invite-user",
//   invitedUserValidation,
//   validationErrors,
//   inviteUser
// );
// router.get(`/:id`, getAccount);

// router.put("/updateaccount", protect, updateAccount);

//EXPORT MODULE
module.exports = router;

//THIRD PARTY LIBRARIES
const express = require("express");
const {
  newAccountValidation,
  // validationErrors,
} = require("./authentication.validation");

const { validationErrors } = require("./../../utils/validationErrors");

//IMPORT CONTROLLER FUNCTIONS
const {
  createAccount,

  getAccount,
  getAllTeams,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("./authentication.controller");

//CALL EXPRESS ROUTER
const router = express.Router();

//DEFINTE ROUTES
router.post(
  "/create-account",
  newAccountValidation,
  validationErrors,
  createAccount
);
// router.post("/add-user", newAccountValidation, validationErrors, addUser);
router.post("/forgotpassword", forgotPassword);
router.patch("/resetpassword/:token", resetPassword);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;

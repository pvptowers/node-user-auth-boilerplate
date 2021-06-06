//THIRD PARTY LIBRARIES
const express = require("express");
const {
  newAccountValidation,
  validationErrors,
} = require("./authentication.validation");

//IMPORT CONTROLLER FUNCTIONS
const {
  createAccount,
  addUser,
  getAccount,
  getAllTeams,
  login,
  logout,
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
router.post("/add-user", addUser);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;

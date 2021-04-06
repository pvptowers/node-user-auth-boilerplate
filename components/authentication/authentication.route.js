//THIRD PARTY LIBRARIES
const express = require("express");

//IMPORT CONTROLLER FUNCTIONS
const {
  createAccount,
  getAccount,
  getAllTeams,
  login,
  logout,
} = require("./authentication.controller");

//CALL EXPRESS ROUTER
const router = express.Router();

//DEFINTE ROUTES
router.post("/create-account", createAccount);
router.post("/login", login);
router.get("/logout", logout);

//router.get("/current-user")
//router.post("/update-user")
//router.put("update-password")
//router.get("/logout")

module.exports = router;

//THIRD PARTY LIBRARIES
const express = require("express");
const { registrationValidation } = require("./authentication.validation");

const { validationErrors } = require("./../../utils/validationErrors");

//IMPORT CONTROLLER FUNCTIONS
const {
  register,

  login,
  logout,
} = require("./authentication.controller");

//CALL EXPRESS ROUTER
const router = express.Router();

//DEFINTE ROUTES
router.post("/register", registrationValidation, validationErrors, register);

router.post("/login", login);
router.get("/logout", logout);

module.exports = router;

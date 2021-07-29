//THIRD PARTY LIBRARIES
const express = require("express");
const {
  newAccountValidation,
  // validationErrors,
} = require("./authentication.validation");

const { validationErrors } = require("./../../utils/validationErrors");

//IMPORT CONTROLLER FUNCTIONS
const { forgotPassword, resetPassword } = require("./passwordReset.controller");

//CALL EXPRESS ROUTER
const router = express.Router();

//DEFINTE ROUTES

// router.post("/add-user", newAccountValidation, validationErrors, addUser);
router.post("/forgotpassword", forgotPassword);
router.patch("/resetpassword/:token", resetPassword);

module.exports = router;

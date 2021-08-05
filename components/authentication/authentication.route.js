const express = require("express");
const { registrationValidation } = require("./authentication.validation");
const { validationErrors } = require("./../../utils/validationErrors");

const { register, login, logout } = require("./authentication.controller");

const router = express.Router();

router.post("/register", registrationValidation, validationErrors, register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;

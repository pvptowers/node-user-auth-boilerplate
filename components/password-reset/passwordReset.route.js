const express = require("express");
const { forgotPassword, resetPassword } = require("./passwordReset.controller");

const router = express.Router();

router.post("/forgotpassword", forgotPassword);
router.patch("/resetpassword/:token", resetPassword);

module.exports = router;

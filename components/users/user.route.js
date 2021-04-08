const express = require("express");

const { getUser } = require("./user.controller");

const router = express.Router();

router.get(`/get-user/:_id`, getUser);

module.exports = router;

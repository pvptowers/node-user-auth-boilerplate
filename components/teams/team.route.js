const express = require("express");

const { getTeam } = require("./team.controller");

const router = express.Router();

router.get(`/get-team/:_id`, getTeam);

module.exports = router;

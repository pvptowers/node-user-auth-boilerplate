const express = require("express");

const { getTeam, updateTeam, deleteTeam } = require("./team.controller");

const router = express.Router();

router.get(`/get-team/:_id`, getTeam);
router.put(`/update-team/:_id`, updateTeam);
router.delete(`/delete-team/:_id`, deleteTeam);

module.exports = router;

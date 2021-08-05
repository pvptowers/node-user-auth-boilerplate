const express = require("express");
const { protect } = require("../../middleware/authentication.middleware");
const {
  getTeam,
  addUser,
  updateTeam,
  deleteTeam,
} = require("./team.controller");
const router = express.Router();

router.get(`/get-team/:_id`, protect, getTeam);
router.put(`/update-team/:_id`, updateTeam);
router.delete(`/delete-team/:_id`, deleteTeam);
router.post("/add-user", addUser);

module.exports = router;

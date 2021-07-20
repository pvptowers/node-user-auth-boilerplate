const express = require("express");

const { getUser, deleteUser, updateUser } = require("./user.controller");

const router = express.Router();

router.get("/get-user/:_id", getUser);
router.delete("/delete-user/:_id", deleteUser);
router.patch("/update-user/:_id", updateUser);

module.exports = router;

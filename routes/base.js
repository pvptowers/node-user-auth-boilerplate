const express = require("express");

const { base } = require("../controllers/base");

const router = express.Router();

router.get("/base", base);
module.exports = router;

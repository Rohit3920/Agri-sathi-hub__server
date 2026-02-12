const express = require("express");
const { getAllSchemes } = require("../controllers/govSchmController");

const router = express.Router();

router.get("/", getAllSchemes);

module.exports = router;
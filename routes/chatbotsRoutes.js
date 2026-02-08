const express = require("express");
const { processChat } = require("../controllers/chatbotsController")

const router = express.Router();

router.post("/query", processChat);

module.exports = router;
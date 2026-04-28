const express = require("express");
const router = express.Router();

const {
    createMessage,
    getMessages,
    deleteMessage
} = require("../controllers/feedbackController");

/* ROUTES */
router.post("/send", createMessage);      // Send message
router.get("/", getMessages);             // Get all messages (admin)
router.delete("/:id", deleteMessage);     // Delete message

module.exports = router;
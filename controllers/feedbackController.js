const feedback = require("../models/feedbackModel");

/* ================= CREATE MESSAGE ================= */
exports.createMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const newMessage = await feedback.create({
            name,
            email,
            message
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ================= GET ALL MESSAGES ================= */
exports.getMessages = async (req, res) => {
    try {
        const messages = await feedback.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: messages.length,
            messages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/* ================= DELETE MESSAGE ================= */
exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        await Message.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Message deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
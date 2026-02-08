const ChatBot = require("../models/chatbotsModel");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

exports.processChat = async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({ error: "Message required" });
        }

        // 🔥 Force agriculture-only context via prompt
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: `
You are **Agri Sathi**, a professional agricultural assistant.

RULES:
- Answer ONLY farming, agriculture, crops, soil, irrigation, weather, pests, fertilizer, or market-related questions.
- If the question is NOT related to agriculture, politely say:
  "I can only help with agriculture-related questions."

Now answer the following question strictly in an agricultural context:

Question: ${message}
      `,
        });

        const botReply = response.text;

        // Save chat to MongoDB
        const chatLog = new ChatBot({
            userId : userId,
            userMessage: message,
            botResponse: botReply,
            category: "Agriculture",
        });

        await chatLog.save();

        return res.status(200).json({
            reply: botReply,
            isBlocked: false,
        });

    } catch (error) {
        console.error("Gemini Error:", error);
        return res.status(500).json({
            error: "AI service temporarily unavailable",
        });
    }
};
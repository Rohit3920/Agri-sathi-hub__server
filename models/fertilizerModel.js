const mongoose = require("mongoose");

const inputSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["fertilizer", "pesticide"],
    },

    category: String,

    elements: {
        n: Number,
        p: Number,
        k: Number
    },

    dosagePerHectare: String,

    phEffect: String,

    toxicityLevel: String,

    protectDieases: [String]

});

module.exports = mongoose.model("fertilizer", inputSchema);
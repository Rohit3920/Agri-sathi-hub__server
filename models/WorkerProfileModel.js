const mongoose = require("mongoose");

const workerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    skills: {
        type: [String],
        required: true
    },

    experience: {
        type: Number,
        default: 0
    },

    dailyWage: {
        type: Number,
        required: true
    },

    availability: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("WorkerProfile", workerProfileSchema);

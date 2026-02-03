const mongoose = require("mongoose");

const workerGroupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },

    leaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    skills: [String],

    groupWagePerDay: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("WorkerGroup", workerGroupSchema);

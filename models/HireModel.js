const mongoose = require("mongoose");

const hireSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    hireType: {
        type: String,
        enum: ["single", "group"],
        required: true
    },

    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkerGroup"
    },

    workType: {
        type: String,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },

    days: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Hire", hireSchema);

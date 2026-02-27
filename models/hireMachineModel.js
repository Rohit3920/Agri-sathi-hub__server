// models/HireMachine.js
const mongoose = require("mongoose");

const HireMachineSchema = new mongoose.Schema({
    machineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MachineRental",
        required: true,
    },
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // The person hiring the machine
        required: true,
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // The machine owner
        required: true,
    },
    selectedParts: [String],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    dailyHours: { type: Number, required: true },
    totalDays: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed", "cancelled", "startWork"],
        default: "pending",
    }
}, { timestamps: true });

module.exports = mongoose.model("HireMachine", HireMachineSchema);
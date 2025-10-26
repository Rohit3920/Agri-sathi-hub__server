const mongoose = require("mongoose");

const orderMachineRentalSchema = new mongoose.Schema(
    {
        machineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MachineRental",
            required: [true, "Machine ID is required"],
        },

        userId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },

        rentalHours : {
            type: Number,
        },

        machineStatus: {
            type: String,
            enum: [
                "available",
                "unavailable",
                "rented",
                "under_maintenance",
                "idle",
                "reserved",
                "out_of_service",
                "working",
            ],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('OrderMachineRental', orderMachineRentalSchema);
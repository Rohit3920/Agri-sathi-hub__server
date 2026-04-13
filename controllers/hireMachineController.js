const mongoose = require("mongoose");
const HireMachine = require("../models/hireMachineModel");
const MachineRental = require("../models/machineRentalModel");

exports.requestRental = async (req, res) => {
    try {
        const { machineId, farmerId, providerId, startDate, endDate, dailyHours, selectedParts, totalDays, totalCost } = req.body;

        // 1️⃣ Comprehensive Validation
        if (!machineId || !farmerId || !providerId || !startDate || !endDate || !dailyHours || !totalDays || !totalCost) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: machineId, farmerId, providerId, dates, dailyHours, totalDays, and totalCost.",
            });
        }

        // 2️⃣ Fetch Machine Details
        const machine = await MachineRental.findById(machineId);
        if (!machine) {
            return res.status(404).json({ success: false, message: "Machine not found" });
        }

        // 3️⃣ Check Availability Status
        // Usually, a machine can only be requested if it is 'available'
        if (machine.machineStatus !== "available") {
            return res.status(400).json({
                success: false,
                message: `Machine is currently ${machine.machineStatus} and cannot be rented.`,
            });
        }

        // 4️⃣ Date Calculations
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start < new Date().setHours(0,0,0,0)) {
            return res.status(400).json({ success: false, message: "Start date cannot be in the past." });
        }
        if (end <= start) {
            return res.status(400).json({ success: false, message: "End date must be after start date." });
        }

        // Calculate total days
        // const diffTime = Math.abs(end - start);
        // const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days

        // Calculate total cost (Base Price * Hours * Days)
        // const totalCost = machine.price * dailyHours * totalDays;

        // 5️⃣ Prevent Duplicate Pending Request from the same farmer
        const existingPending = await HireMachine.findOne({
            machineId,
            farmerId,
            status: "pending",
        });

        if (existingPending) {
            return res.status(400).json({
                success: false,
                message: "You already have a pending request for this machine.",
            });
        }

        // 6️⃣ Prevent Overlapping Confirmed Bookings
        const overlappingBooking = await HireMachine.findOne({
            machineId,
            status: { $in: ["accepted", "startWork"] },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } },
            ],
        });

        if (overlappingBooking) {
            return res.status(400).json({
                success: false,
                message: "Machine is already booked by someone else for these dates.",
            });
        }

        // 7️⃣ Create Rental Entry
        const newRental = await HireMachine.create({
            machineId,
            farmerId,
            providerId,
            selectedParts: selectedParts || [],
            startDate: start,
            endDate: end,
            dailyHours,
            totalDays,
            totalCost,
            status: "pending",
        });

        res.status(201).json({
            success: true,
            message: "Rental request sent successfully. Waiting for provider approval.",
            data: newRental,
        });

    } catch (error) {
        console.error("Rental Request Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


exports.getProviderRequests = async (req, res) => {
    try {
        const { providerId } = req.params;

        const requests = await HireMachine.find({ providerId })
            .populate("machineId")
            .populate("farmerId", "username MobileNum profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: requests });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// READ: Farmer Requests
exports.getFarmerRequests = async (req, res) => {
    try {
        const { farmerId } = req.params;

        const requests = await HireMachine.find({ farmerId })
            .populate("machineId")
            .populate("providerId", "username MobileNum profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: requests });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// controllers/machineRentalController.js

exports.updateRentalStatus = async (req, res) => {
    try {
        const rentalId = req.params.id;
        const status = req.body.status?.trim();

        const allowedStatus = [
            "accepted",
            "rejected",
            "startWork",
            "completed",
            "cancelled"
        ];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value"
            });
        }

        const rental = await HireMachine.findById(rentalId);
        if (!rental) {
            return res.status(404).json({
                success: false,
                message: "Hire request not found"
            });
        }

        const machine = await MachineRental.findById(rental.machineId);
        if (!machine) {
            return res.status(404).json({
                success: false,
                message: "Machine not found"
            });
        }

        // 🔥 STATUS TRANSITION LOGIC

        if (status === "accepted" && rental.status === "pending") {
            rental.status = "accepted";
        }

        else if (status === "rejected" && rental.status === "pending") {
            rental.status = "rejected";
        }

        else if (status === "startWork" && rental.status === "accepted") {
            rental.status = "startWork";
            machine.machineStatus = "working";
        }

        else if (status === "completed" && rental.status === "startWork") {
            rental.status = "completed";
            machine.machineStatus = "available";
        }

        else if (
            status === "cancelled" &&
            (rental.status === "accepted" || rental.status === "startWork")
        ) {
            rental.status = "cancelled";
            machine.machineStatus = "available";
        }

        else {
            return res.status(400).json({
                success: false,
                message: "Invalid status transition"
            });
        }

        await rental.save();
        await machine.save();

        const updatedRental = await HireMachine.findById(rental._id)
            .populate("machineId")
            .populate("farmerId", "username MobileNum profilePicture");

        res.status(200).json({
            success: true,
            message: "Status updated successfully",
            data: updatedRental
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE: Remove Rental
exports.deleteRental = async (req, res) => {
    try {
        const rental = await HireMachine.findById(req.params.id);

        if (!rental) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        // If it was approved, restore machine availability
        if (rental.status === "approved") {
            await MachineRental.findByIdAndUpdate(rental.machineId, {
                machineStatus: "available",
            });
        }

        await rental.deleteOne();

        res.status(200).json({
            success: true,
            message: "Rental record deleted successfully",
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 1. Get a specific hiring request by its ID
exports.getRequestById = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await HireMachine.findById(id)
            .populate("machineId")
            .populate("farmerId", "username MobileNum profilePicture")
            .populate("providerId", "username MobileNum location address");

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Hiring request not found"
            });
        }

        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching request details",
            error: error.message
        });
    }
};

// 2. Get all hiring requests in the system (Admin or Audit view)
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await HireMachine.find()
            .populate("machineId", "title price")
            .populate("farmerId", "username")
            .populate("providerId", "username")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching all requests",
            error: error.message
        });
    }
};

// 3. Delete all requests associated with a specific machine
exports.deleteReqByMachine = async (req, res) => {
    try {
        const { machineId } = req.params;

        // Removes all history/pending requests for a machine if it's being unlisted
        const result = await HireMachine.deleteMany({ machineId });

        res.status(200).json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} requests for this machine.`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting requests by machine",
            error: error.message
        });
    }
};
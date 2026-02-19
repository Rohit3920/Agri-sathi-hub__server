const machineRental = require("../models/machineRentalModel");
const User = require("../models/authModel");
const orderMachineRentalSchema = require("../models/orderMachineRentalModel");

// 1. Add a new machine
async function AddMachine(req, res) {
    try {
        const {
            machineName,
            machineType,
            machineRegistationNumber,
            machineModel,
            description,
            machineImage,
            machineParts,
            machineWorkingArea,
            machineWorkingHours,
            rentalPricePerHour,
            availabilityStartDate,
            availabilityEndDate,
            city,
            state,
            country,
            longitude,
            latitude,
            machineOwner,
        } = req.body;

        // ✅ Validate coordinates
        if (
            longitude === undefined ||
            latitude === undefined ||
            isNaN(longitude) ||
            isNaN(latitude)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid machine location coordinates are required."
            });
        }

        const newMachine = await MachineRental.create({

            machineName,
            machineType,
            machineRegistationNumber,
            machineModel,
            description,
            machineImage,
            machineParts,
            machineWorkingArea,
            machineWorkingHours,
            rentalPricePerHour,
            availabilityStartDate,
            availabilityEndDate,
            machineOwner,

            // ✅ Proper GeoJSON
            location: {
                city: city || "",
                state: state || "",
                country: country || "INDIA",
                geo: {
                    type: "Point",
                    coordinates: [
                        parseFloat(longitude),
                        parseFloat(latitude)
                    ]
                }
            }

        });

        res.status(201).json({
            success: true,
            message: "Machine added successfully 🚜",
            data: newMachine
        });

    } catch (error) {
        console.error("AddMachine Error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// 2. Rent a machine
async function RentMachine(req, res) {
    try {
        const { machineId, userId, rentalHours } = req.body;

        const machine = await machineRental.findById(machineId);
        if (!machine)
            return res.status(404).json({ success: false, message: "Machine not found" });

        if (machine.machineStatus !== "available") {
            return res
                .status(400)
                .json({ success: false, message: "Machine is not available for rent" });
        }

        // Basic rental logic
        machine.machineStatus = "rented";
        const price = machine.rentalPricePerHour || 0;

        // Ensure rentalHours is a number for multiplication
        const hours = Number(rentalHours);
        if (isNaN(hours) || hours <= 0) {
            return res.status(400).json({ success: false, message: "Invalid rentalHours provided." });
        }

        const totalPrice = price * hours;
        await orderMachineRentalSchema.create({
            machineId,
            userId,
            rentalHours: hours,
            machineStatus: "rented",
        });

        await machine.save({
            machineStatus: "rented",
        });

        res.status(200).json({
            success: true,
            message: "Machine rented successfully",
            data: {
                machine,
                rentedBy: userId,
                rentalHours: hours,
                totalPrice,
            },
        });
    } catch (error) {
        console.error("Error in RentMachine:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Update rental status (e.g., available, under_maintenance)
async function UpdateRentalStatus(req, res) {
    try {
        const { machineId, status } = req.body;

        const machine = await machineRental.findById(machineId);
        if (!machine)
            return res.status(404).json({ success: false, message: "Machine not found" });

        machine.machineStatus = status;
        await machine.save();

        res.status(200).json({
            success: true,
            message: "Machine status updated successfully",
            data: machine,
        });
    } catch (error) {
        console.error("Error in UpdateRentalStatus:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update machine details
async function UpdateMachineDetails(req, res) {
    try {
        const { updates } = req.body;
        const { machineId } = req.params;

        const updatedMachine = await machineRental.findByIdAndUpdate(
            machineId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedMachine)
            return res.status(404).json({ success: false, message: "Machine not found" });

        res.status(200).json({
            success: true,
            message: "Machine details updated successfully",
            data: updatedMachine,
        });
    } catch (error) {
        console.error("Error in UpdateMachineDetails:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Remove machine
async function RemoveMachine(req, res) {
    try {
        const { machineId } = req.body;

        const removedMachine = await machineRental.findByIdAndDelete(machineId);

        if (!removedMachine)
            return res.status(404).json({ success: false, message: "Machine not found" });

        res.status(200).json({
            success: true,
            message: "Machine removed successfully",
            data: removedMachine,
        });
    } catch (error) {
        console.error("Error in RemoveMachine:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. List all machines
async function ListMachines(req, res) {
    try {
        const machines = await machineRental.find().populate("machineOwner", "username email MobileNum");
        res.status(200).json({
            success: true,
            count: machines.length,
            data: machines,
        });
    } catch (error) {
        console.error("Error in ListMachines:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. Get rental history (for now, lists rented machines)
async function GetRentalHistory(req, res) {
    try {
        const rentedMachines = await machineRental.find({ machineStatus: "rented" })
            .populate("machineOwner", "username email MobileNum");

        res.status(200).json({
            success: true,
            count: rentedMachines.length,
            data: rentedMachines,
        });
    } catch (error) {
        console.error("Error in GetRentalHistory:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 8. Get all available machines
async function GetAvailableMachines(req, res) {
    try {
        const availableMachines = await machineRental.find({ machineStatus: "available" })
            .populate("machineOwner", "username email MobileNum");

        res.status(200).json({
            success: true,
            count: availableMachines.length,
            data: availableMachines,
        });
    } catch (error) {
        console.error("Error in GetAvailableMachines:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 9. Get machines by userId (machines owned by a specific user)
async function GetMachineByUserId(req, res) {
    try {
        const { userId } = req.params;

        const machines = await machineRental.find({ machineOwner: userId });

        res.status(200).json({ success: true, data: machines });
    } catch (error) {
        console.error("Error in GetMachineByUserId:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 10. Get machine by ID
async function GetMachineById(req, res) {
    try {
        const { machineId } = req.params;

        const machine = await machineRental.findById(machineId).populate("machineOwner");
        if (!machine)
            return res.status(404).json({ success: false, message: "Machine not found" });

        res.status(200).json({ success: true, data: machine });
    } catch (error) {
        console.error("Error in GetMachineById:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    AddMachine,
    RentMachine,
    UpdateRentalStatus,
    UpdateMachineDetails,
    RemoveMachine,
    ListMachines,
    GetRentalHistory,
    GetAvailableMachines,
    GetMachineByUserId,
    GetMachineById,
};
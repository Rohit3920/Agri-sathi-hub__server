const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/machineRentalController");

const {
    requestRental,
    getProviderRequests,
    getFarmerRequests,
    updateRentalStatus,
    deleteRental,
    getRequestById,
    getAllRequests,
    deleteReqByMachine,
} = require("../controllers/hireMachineController");

// Existing declared routes (Unchanged)
router.post("/add-machine", AddMachine);
router.post("/rent-machine", RentMachine);
router.post("/update-rental-status", UpdateRentalStatus);

router.put("/update-machine-details/:machineId", UpdateMachineDetails);

router.delete("/remove-machine", RemoveMachine);

router.get("/list-machines", ListMachines);
router.get("/rental-history", GetRentalHistory);
router.get("/available-machines", GetAvailableMachines);
router.get("/get-machine-by-userId/:userId", GetMachineByUserId);
router.get("/get-machine-by-id/:machineId", GetMachineById);

// General hire routes
router.post("/request", requestRental);
router.delete("/delete/:id", deleteRental);

// Status Management
router.patch("/status/:id", updateRentalStatus);

// Role Specific fetching
router.get("/provider/:providerId", getProviderRequests);
router.get("/farmer/:farmerId", getFarmerRequests);

// --- Newly added routes below ---

router.get("/all-requests", getAllRequests);
router.get("/get-request-by-id/:id", getRequestById);
router.delete("/delete-by-machine/:machineId", deleteReqByMachine);

module.exports = router;
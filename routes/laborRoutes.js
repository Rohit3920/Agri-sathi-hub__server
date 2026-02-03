const express = require("express");
const router = express.Router();

const {
    upsertWorkerProfile,
    getAvailableWorkers,
    createWorkerGroup,
    getWorkerGroups,
    createHireRequest,
    getHireRequests,
    updateHireStatus,
    getGroupById,
    getWorkerById
} = require("../controllers/laborController");

/* WORKER PROFILE */
router.post("/worker/profile", upsertWorkerProfile);
router.get("/workers/available", getAvailableWorkers);
router.get("/worker/:id", getWorkerById);



/* WORKER GROUP */
router.post("/worker-group", createWorkerGroup);
router.get("/worker-groups", getWorkerGroups);
router.get("/worker-group/:id", getGroupById);


/* HIRE */
router.post("/hire", createHireRequest);
router.get("/hire", getHireRequests);
router.put("/hire/:id/status", updateHireStatus);

module.exports = router;

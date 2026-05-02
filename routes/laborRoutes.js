const express = require("express");
const router = express.Router();

const {
    upsertWorkerProfile,
    getAvailableWorkers,
    createWorkerGroup,
    getWorkerGroups,
    createHireRequest,
    getHireRequests,
    getHireById,
    updateHireStatus,
    getGroupById,
    getWorkerById,
    deleteWorkerProfile,
    deleteWorkerGroup,
    updateWorkerGroup,
    getWorkerByFarmerId,
    getWorkerGroupsByLeaderId,
    getHireWorkerByUserId,
    getHireWorkerGroupsByFarmerId,
    getHireWorkerByFarmerId,
    getHireWorkerGroupsByWorkerId,
    getHireWorkerById
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
router.get("/hire/:id", getHireById);
router.post("/hire", createHireRequest);
router.get("/hire", getHireRequests);
router.patch("/hire/:id/status", updateHireStatus);
// router.patch("/status-change/:id", updateHireStatus);

// GET worker groups and single workers for a and worker
router.get("/worker-group/worker/:leaderId", getWorkerGroupsByLeaderId);
router.get("/single-worker/worker/:userId", getHireWorkerByUserId);

/* GET hire request in workers and group by farmerId and workerId */
router.get("/worker-group-hire/farmer/:farmerId", getHireWorkerGroupsByFarmerId);
router.get("/single-worker-hire/farmer/:farmerId", getHireWorkerByFarmerId);

router.get("/worker-group-hire/worker/:workerId", getHireWorkerGroupsByWorkerId);
router.get("/single-worker-hire/worker/:workerId", getHireWorkerById);

/* DELETE OPERATIONS */
router.delete("/delete-single-worker/:id", deleteWorkerProfile);
router.delete("/delete-group/:id", deleteWorkerGroup);

/* UPDATE OPERATIONS */
router.put("/worker-group/:id", updateWorkerGroup);

/* FETCH WORKERS BY FARMER ID */
router.get("/worker-by-farmer/:farmerId", getWorkerByFarmerId);

module.exports = router;

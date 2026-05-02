const User = require("../models/authModel");
const WorkerProfile = require("../models/WorkerProfileModel");
const WorkerGroup = require("../models/WorkerGroupModel");
const Hire = require("../models/HireModel");

exports.getHireById = async (req, res) => {
    try {
        const hire = await Hire.findById(req.params.id)
            .populate("farmerId", "username email")
            .populate("workerId", "username email")
            .populate("groupId");

        if (!hire) {
            return res.status(404).json({ message: "Hire not found" });
        }

        res.json(hire);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// create or update worker profile
exports.upsertWorkerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);

        // if (!user || user.userMode !== "worker") {
        //     return res.status(403).json({ message: "Only workers can create profile" });
        // }

        const profile = await WorkerProfile.findOneAndUpdate(
            { userId: req.body.userId },
            req.body,
            { upsert: true, new: true }
        );

        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get available workers
exports.getAvailableWorkers = async (req, res) => {
    try {
        const workers = await WorkerProfile.find({ availability: true })
            .populate("userId", "username MobileNum address profilePicture");

        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getWorkerById = async (req, res) => {
    try {
        const worker = await WorkerProfile.findById(req.params.id)
            .populate({
                path: "userId",
                select: "username email MobileNum profilePicture address",
            });

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        res.status(200).json(worker);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({ message: error.message });
    }
};


// create worker group
exports.createWorkerGroup = async (req, res) => {
    try {
        const leader = await User.findById(req.body.leaderId);

        // if (!leader || leader.userMode !== "worker") {
        //     return res.status(403).json({ message: "Only workers can create groups" });
        // }

        const group = await WorkerGroup.create(req.body);
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get all worker groups
exports.getWorkerGroups = async (req, res) => {
    try {
        const groups = await WorkerGroup.find()
            .populate("leaderId", "username  MobileNum address")
            .populate("members", "username");

        res.json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getGroupById = async (req, res) => {
    try {
        const group = await WorkerGroup.findById(req.params.id)
            .populate({
                path: "leaderId",
                select: "username MobileNum profilePicture address",
            })
            .populate({
                path: "members",
                select: "username profilePicture MobileNum skills",
            });

        if (!group) {
            return res.status(404).json({ message: "Worker Group not found" });
        }

        res.status(200).json(group);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({ message: error.message });
    }
};
// GET/worker-group/worker/:workerId"
exports.getWorkerGroupsByLeaderId = async (req, res) => {
    try {
        const workerGroups = await WorkerGroup.find({ leaderId: req.params.leaderId })
            .populate("leaderId", "username email MobileNum profilePicture address");
        res.status(200).json(workerGroups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET/single-worker/worker/:workerId"
exports.getHireWorkerByUserId = async (req, res) => {
    try {
        const worker = await WorkerProfile.find({ userId: req.params.userId })
            .populate("userId", "username email MobileNum profilePicture address");
        res.status(200).json(worker);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// create hire request (farmer)
exports.createHireRequest = async (req, res) => {
    try {
        const farmer = await User.findById(req.body.farmerId);

        if (!farmer || farmer.userMode !== "farmer") {
            return res.status(403).json({ message: "Only farmers can hire workers" });
        }

        const start = new Date(req.body.startDate);
        const end = new Date(req.body.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const hire = await Hire.create({
            ...req.body,
            days: diffDays
        });

        res.status(201).json(hire);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get hire requests for worker or group leader
exports.getHireRequests = async (req, res) => {
    try {
        const { userId, groupId } = req.query;

        const hires = await Hire.find({
            $or: [
                { workerId: userId },
                { groupId: groupId }
            ]
        }).populate("farmerId", "username MobileNum");

        res.json(hires);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// update hire status (accept / reject / complete)
exports.updateHireStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const hire = await Hire.findById(req.params.id);
        if (!hire) {
            return res.status(404).json({ message: "Hire not found" });
        }

        // Example: assume role is passed from frontend
        const userRole = req.body.userRole;

        if (userRole === "servicer") {
            if (!["accepted", "rejected"].includes(status)) {
                return res.status(403).json({ message: "Servicer not allowed" });
            }
        }

        if (userRole === "farmer") {
            if (!["rejected", "completed"].includes(status)) {
                return res.status(403).json({ message: "Farmer not allowed" });
            }
        }

        hire.status = status;
        await hire.save();

        res.json({
            message: "Status updated successfully",
            hire
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Worker Profile
// @route   DELETE /api/labor/delete-worker/:id
exports.deleteWorkerProfile = async (req, res) => {
    try {
        const worker = await WorkerProfile.findById(req.params.id);
        if (!worker) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        // Use findByIdAndDelete to remove the document
        await WorkerProfile.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Worker profile deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Worker Group
// @route   DELETE /api/labor/delete-group/:id
exports.deleteWorkerGroup = async (req, res) => {
    try {
        const group = await WorkerGroup.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: "Worker group not found" });
        }

        await WorkerGroup.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Worker group deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Worker Group Details
// @route   PUT /api/labor/worker-group/:id
exports.updateWorkerGroup = async (req, res) => {
    try {
        const updatedGroup = await WorkerGroup.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedGroup) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.status(200).json(updatedGroup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    hire Worker  Details
// @route   GET /api/labor/worker-by-farmer/:famrmerId
exports.getWorkerByFarmerId = async (req, res) => {
    try {
        const worker = await Hire.find({ farmerId: req.params.farmerId })
            .populate("workerId", "username email MobileNum profilePicture address")
            .populate("groupId", "groupName members");
        console.log(worker);
        if (!worker) {
            return res.status(404).json({ message: "Worker not found for this farmer" });
        }

        res.status(200).json(worker);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({ message: error.message });
    }
};


// GET /worker/worker-group/:farmerId
exports.getHireWorkerGroupsByFarmerId = async (req, res) => {
    try {
        const workerGroups = await Hire.find({ farmerId: req.params.farmerId, groupId: { $ne: null } })
            .populate("groupId", "groupName members")
            .populate("farmerId", "username MobileNum")
            .sort({ createdAt: -1 });;
        res.status(200).json({ success: true, data: workerGroups });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /worker/farmer/:farmerId
exports.getHireWorkerByFarmerId = async (req, res) => {
    try {
        const workers = await Hire.find({ farmerId: req.params.farmerId })
            .populate("workerId", "username email MobileNum profilePicture address")
            .sort({ createdAt: -1 });
            // .populate("groupId", "groupName members");
        res.status(200).json({ success: true, data: workers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/labor/worker-group-hire/worker/:userId
exports.getHireWorkerGroupsByWorkerId = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Find all hire records where this worker is the main contact
        // OR where the record has a groupId (we filter more in frontend or add complex logic here)
        const workerGroups = await Hire.find({
            $or: [
                { workerId: userId },
                // If your Hire schema stores a group reference, we find those
                { groupId: { $ne: null } }
            ]
        })
        .populate("groupId")
        .populate("farmerId", "username MobileNum")
        .sort({ createdAt: -1 });

        // Note: If you want to only show groups this SPECIFIC user belongs to,
        // you'd need to cross-reference the WorkerGroup members list.
        res.status(200).json({ success: true, data: workerGroups });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /worker/worker/:workerId
exports.getHireWorkerById = async (req, res) => {
    try {
        const worker = await Hire.find( { workerId: req.params.workerId } )
            .populate("workerId", "username email MobileNum profilePicture address")
            .populate("farmerId", "username MobileNum")
            .sort({ createdAt: -1 });;
        res.status(200).json({ success: true, data: worker });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

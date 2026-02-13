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
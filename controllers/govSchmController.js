const Scheme = require("../models/govSchmModel");

// @desc    Get all schemes (with Pagination, Search, and Filter)
// @route   GET /api/gov-scheme
const getAllSchemes = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, status } = req.query;

        // Build Query
        let query = {};
        if (status && status !== "all") {
            query.scheme_status = status;
        }
        if (search) {
            query.$or = [
                { scheme_name: { $regex: search, $options: "i" } },
                { scheme_id: { $regex: search, $options: "i" } },
                { target_beneficiaries: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;
        const totalCount = await Scheme.countDocuments(query);
        const schemes = await Scheme.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            pagination: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: parseInt(page),
            },
            data: schemes,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new scheme
// @route   POST /api/gov-scheme
const createScheme = async (req, res) => {
    try {
        const newScheme = await Scheme.create(req.body);
        res.status(201).json({ success: true, data: newScheme });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update scheme
// @route   PUT /api/gov-scheme/:id
const updateScheme = async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!scheme) return res.status(404).json({ success: false, message: "Scheme not found" });
        res.status(200).json({ success: true, data: scheme });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete scheme
// @route   DELETE /api/gov-scheme/:id
const deleteScheme = async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndDelete(req.params.id);
        if (!scheme) return res.status(404).json({ success: false, message: "Scheme not found" });
        res.status(200).json({ success: true, message: "Scheme deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    getAllSchemes, 
    createScheme, 
    updateScheme, 
    deleteScheme 
};
const Scheme = require("../models/govSchmModel");

const getAllSchemes = async (req, res) => {
    try {
        const schemes = await Scheme.find();

        res.status(200).json({
            success: true,
            count: schemes.length,
            data: schemes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: Could not fetch schemes",
            error: error.message,
        });
    }
};

module.exports = { getAllSchemes };

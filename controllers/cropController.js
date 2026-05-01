const Crop = require("../models/cropModel");
const Fertilizer = require("../models/fertilizerModel");


// 🌱 Predict Best Crops (AI Score Based)

exports.predictBestCrops = async (req, res) => {
    try {
        const { temp, rainfall, humidity, phLevel, soilType, n, p, k } = req.body;

        // 1. Validation
        if (!temp || !rainfall || !humidity || !phLevel || !soilType) {
            return res.status(400).json({
                message: "Missing required environmental data"
            });
        }

        // 2. Fetch ALL fields (removing .select() or using .select("+all"))
        // We need the full object to return it to the frontend
        const crops = await Crop.find();

        // 3. Calculation Logic
        const results = crops.map(crop => {
            let score = 0;
            const { climate, soil, nutritients: nutrients } = crop.requiredData;

            // --- Scoring Algorithm ---
            // Temperature (Max 25)
            if (Math.abs(temp - climate.temp) <= 5) score += 25;
            else if (Math.abs(temp - climate.temp) <= 10) score += 10;

            // Rainfall (Max 25)
            if (rainfall >= climate.rainfall * 0.9) score += 25;
            else if (rainfall >= climate.rainfall * 0.7) score += 15;

            // Humidity (Max 15)
            if (Math.abs(humidity - climate.humidity) <= 10) score += 15;

            // PH Level (Max 15)
            if (Math.abs(phLevel - soil.phLevel) <= 0.5) score += 15;
            else if (Math.abs(phLevel - soil.phLevel) <= 1.5) score += 5;

            // Soil Type (Max 10)
            const typeMatch = Array.isArray(soil.soilType)
                ? soil.soilType.includes(soilType)
                : soil.soilType === soilType;
            if (typeMatch) score += 10;

            // Nutrients (Max 10)
            if (n >= (nutrients?.n || 0) * 0.8) score += 3;
            if (p >= (nutrients?.p || 0) * 0.8) score += 3;
            if (k >= (nutrients?.k || 0) * 0.8) score += 4;

            // 4. Return the FULL crop object + the calculated score
            return {
                ...crop._doc, // Spreads all MongoDB fields (cropName, diseases, etc.)
                score
            };
        });

        // 5. Sort by highest score first
        results.sort((a, b) => b.score - a.score);

        // 6. Return top 10
        // NOTE: We return the array directly to keep it clean for your frontend
        res.json(results.slice(0, 10));

    } catch (error) {
        console.error("Prediction Error:", error);
        res.status(500).json({
            message: "Prediction failed",
            error: error.message
        });
    }
};

// 🌦 Get Best Crops (Simple Weather Filter)

exports.getBestCrops = async (req, res) => {

    try {

        const { temp, rainfall, humidity } = req.body;

        const crops = await Crop.find();

        const recommended = crops.filter(crop => {

            const climate = crop.requiredData.climate;

            return (
                temp >= climate.temp - 5 &&
                temp <= climate.temp + 5 &&
                rainfall >= climate.rainfall * 0.7 &&
                humidity >= climate.humidity * 0.7
            );

        });

        res.json(recommended);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

};



// 🧪 Get Fertilizers for Crop

exports.getCropFertilizers = async (req, res) => {

    try {

        const crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: "Crop not found" });
        }

        const fertilizers = await Fertilizer.find({
            name: { $in: crop.fertilizer }
        });

        res.json(fertilizers);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

};



// 🐛 Get Pesticides for Crop

exports.getCropPesticides = async (req, res) => {

    try {

        const crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: "Crop not found" });
        }

        const pesticides = await Fertilizer.find({
            name: { $in: crop.pestisieds },
            type: "pesticide"
        });

        res.json(pesticides);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

};



// 🌾 Get Related Crops
exports.getRelatedCrops = async (req, res) => {

    try {

        const crop = await Crop.findById(req.params.id);

        if (!crop) {
            return res.status(404).json({ message: "Crop not found" });
        }

        const related = await Crop.find({
            cropSeason: { $in: crop.cropSeason },
            _id: { $ne: crop._id }
        });

        res.json(related);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

};



// 🧬 Crop Health Check

exports.checkCropHealth = async (req, res) => {

    try {

        const { cropId, n, p, k, rainfall } = req.body;

        const crop = await Crop.findById(cropId);

        if (!crop) {
            return res.status(404).json({ message: "Crop not found" });
        }

        const nutrients = crop.requiredData.nutritients;
        const climate = crop.requiredData.climate;

        let issues = [];

        if (n < nutrients.n) issues.push("Nitrogen deficiency");
        if (p < nutrients.p) issues.push("Phosphorus deficiency");
        if (k < nutrients.k) issues.push("Potassium deficiency");

        if (n > nutrients.n) issues.push("Nitrogen excess");
        if (p > nutrients.p) issues.push("Phosphorus excess");
        if (k > nutrients.k) issues.push("Potassium excess");

        if (rainfall < climate.rainfall * 0.7) {
            issues.push("Low rainfall risk");
        }

        res.json({
            status: issues.length == 1 ? "under risk only" : issues.length > 1 ? "under multiple risks" : "Healthy",
            issues
        });

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

};

// 🌱 Get Crops by Season
exports.getSeasonCrops = async (req, res) => {
    try {
        const { season } = req.params;
        const normalizedSeason = season.toLowerCase().trim();

        // Define the mapping logic
        const seasonMapping = {
            kharif: ["kharif", "monsoon", "summer", "rainy", "all"],
            rabi: ["rabi", "winter", "all"],
            zaid: ["zaid", "summer", "spring", "all"]
        };

        const searchTerms = seasonMapping[normalizedSeason] || [normalizedSeason, "all"];

        const crops = await Crop.find({
            cropSeason: { $in: searchTerms }
        });

        res.status(200).json(crops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
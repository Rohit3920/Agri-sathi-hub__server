const express = require("express");
const router = express.Router();

const {
    getBestCrops,
    getCropFertilizers,
    getCropPesticides,
    getRelatedCrops,
    predictBestCrops,
    getSeasonCrops,
    checkCropHealth
} = require("../controllers/cropController");


// AI prediction
router.post("/predict", predictBestCrops);

// weather recommendation
router.post("/recommend", getBestCrops);

// season crops
router.get("/season/:season", getSeasonCrops);

// fertilizers
router.get("/:id/fertilizers", getCropFertilizers);

// pesticides
router.get("/:id/pesticides", getCropPesticides);

// related crops
router.get("/:id/related", getRelatedCrops);

// crop health
router.post("/health", checkCropHealth);

module.exports = router;
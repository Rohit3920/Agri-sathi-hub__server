const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({

    cropName: {
        type: String,
        required: true
    },

    cropSubName: String,

    cropType: [String],

    cropSeason: [String],

    cropDuration: Number,

    useOfPlant: [String],

    requiredData: {

        climate: {
            temp: Number,
            rainfall: Number,
            humidity: Number,
            sunlightHours: Number
        },

        soil: {
            phLevel: Number,
            soilType: [String],
            magnesium: Number
        },

        nutritients: {
            n: Number,
            p: Number,
            k: Number
        }

    },

    fertilizer: [String],

    pestisieds: [String],

    irrigation: [String],

    diseases: [String]

});

module.exports = mongoose.model("Crop", cropSchema);
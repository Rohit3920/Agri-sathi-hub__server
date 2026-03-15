const mongoose = require('mongoose');

const FavoriteCitySchema = new mongoose.Schema({
    cityName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('FavoriteCity', FavoriteCitySchema);
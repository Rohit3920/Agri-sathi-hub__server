const express = require('express');
const router = express.Router();

// Import the controller functions (make sure the path is correct)
const { getWeatherForecast } = require('../controllers/weatherController');

router.get('/forecast', getWeatherForecast);

module.exports = router;
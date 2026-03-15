const axios = require('axios');

const getDetailedLocation = async (lat, lon) => {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            { headers: { 'User-Agent': 'AgriSathiHub/1.0' } }
        );

        const addr = response.data.address;

        return {
            city: addr.city || addr.town || addr.village || "Unknown City",
            state: addr.state || "Unknown State",
            region: addr.state_district || addr.county || "Unknown Region"
        };
    } catch (error) {
        return { city: "Unknown", state: "Unknown", region: "Unknown" };
    }
};

exports.getWeatherForecast = async (req, res) => {
    const { lat, lon } = req.query;
    const API_KEY = process.env.WEATHER_API_KEY;

    try {
        const locationInfo = await getDetailedLocation(lat, lon);
        const url = `https://api.agromonitoring.com/agro/1.0/weather/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const weatherRes = await axios.get(url);

        // --- FILTER LOGIC FOR DAY-BY-DAY OUTLOOK ---
        const dailyData = [];
        const seenDates = new Set();

        weatherRes.data.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!seenDates.has(date)) {
                dailyData.push({
                    date: date, // For the unique key
                    dt: item.dt,
                    temp_c: Math.round(item.main.temp - 273.15),
                    maxtemp_c: Math.round(item.main.temp_max - 273.15), // Optional
                    mintemp_c: Math.round(item.main.temp_min - 273.15), // Optional
                    humidity: item.main.humidity,
                    wind_speed: item.wind.speed,
                    condition: item.weather[0].main,
                    icon: item.weather[0].icon,
                    clouds: item.clouds.all,
                    daily_chance_of_rain: item.pop ? Math.round(item.pop * 100) : 0 // 'pop' is probability of precipitation
                });
                seenDates.add(date);
            }
        });

        res.status(200).json({
            location: locationInfo,
            current: dailyData[0], // Today's weather
            forecast: dailyData.slice(0, 10) // Next 10 days for the outlook
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
function calculateScore(crop, input) {

    let score = 0;

    const { temp, rainfall, humidity, phLevel, soilType, n, p, k } = input;

    const data = crop.requiredData;

    if (Math.abs(temp - data.climate.temp) <= 5) score += 25;

    if (rainfall >= data.climate.rainfall * 0.7) score += 20;

    if (humidity >= data.climate.humidity * 0.7) score += 15;

    if (Math.abs(phLevel - data.soil.phLevel) <= 1) score += 15;

    if (data.soil.soilType.includes(soilType)) score += 10;

    if (n >= data.nutritients.n * 0.7) score += 5;

    if (p >= data.nutritients.p * 0.7) score += 5;

    if (k >= data.nutritients.k * 0.7) score += 5;

    return score;
}

module.exports = calculateScore;
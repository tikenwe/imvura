const {
    beans: { name: 'Beans', plantMin: 5, plantMax: 20 },
    maize: { name: 'Maize', plantMin: 5, plantMax: 30 },
    potatoes: { name: 'Potatoes', plantMin: 5, plantMax: 25 },
};

function adviseDay(rain, chance, crop) {
    return {
        plant: rain >= crop.plantMin && rain <= crop.plantMax,
        spray: rain < 2 && chance < 60,
        dry: rain < 1 && chance < 40,
    };
}

function getAdvice(daily, cropKey) {
    const crop = CROPS[cropKey];
    if (!crop) {
        return null;
    }

    return daily.time.map((date, i) => ({
        date,
        ...adviseDay(daily.precipitation_sum[i], daily.precipitation_probability_max[i], crop),
    }));
}

module.exports = { CROPS, getAdvice };
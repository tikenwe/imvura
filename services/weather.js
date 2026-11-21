const districts = require('../data/districts.json');

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const DAILY_FIELDS = 'precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min';

async function getForecasts() {
    const latitudes = districts.map((d) => d.lat).join(',');
    const longitudes = districts.map((d) => d.lon).join(',');

        const params = new URLSearchParams({
        latitude: latitudes,
        longitude: longitudes,
        daily: DAILY_FIELDS,
        timezone: 'Africa/Kigali',
        forecast_days: '7',
    });

        const response = await fetch (`${BASE_URL}?${params}`,{
            signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
        throw new Error (`Open-Meteo responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length !== districts.length) {
        throw new Error ("Unexpected response format Open-Meteo");
    }

    return districts.map((district, i) => ({
        ...district,
        daily: data[i].daily,
    }));

}

module.exports = { getForecasts };
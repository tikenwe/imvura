require('dotenv').config();
const express = require('express');
const os = require('os');
const path = require('path');
const { getForecasts } = require('./services/weather');
const { getCached, setCached } = require('./services/cache');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.set('X-Served-By', os.hostname());
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: os.hostname() });
});

app.get('/api/forecast', async (req, res) => {
    try {
        const cached = getCached();
        if (cached) {
            return res.json(cached);
        }

        const forecasts = await getForecasts();
        setCached(forecasts);
        res.json(forecasts);
    } catch (error) {
        console.error('Forecast error:', error.message);
        res.status(502).json({
            error: 'Weather data is unavailable right now. Please try again in a few minutes.',
        });
    }
});

app.listen(PORT, () => {
    console.log(`Imvura running on http://localhost:${PORT}`);
});
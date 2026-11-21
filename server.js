require('dotenv').config();
const express = require('express');
const os = require('os');
const path = require('path');
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



app.listen(PORT, () => {
    console.log( `Imvura running on http://localhost:${PORT}`);
});
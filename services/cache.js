const CACHE_MINUTES = Number(process.env.CACHE_MINUTES) || 30;

let cachedData = null;
let cachedAt = 0;

function getCached() {
    const ageMs = Date.now() - cachedAt ;
    if (cachedData && ageMs < CACHE_MINUTES * 60 *1000) {
        return cachedData;
    }
    return null;
}

function setCached(data) {
    cachedData = data;
    cachedAt = Date.now();
}

module.exports = { getCached, setCached };
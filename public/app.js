const searchInput = document.getElementById('search');
const provinceSelect = document.getElementById('province');
const cropSelect = document.getElementById('crop');
const sortSelect = document.getElementById('sort');
const heavyCheckbox = document.getElementById('heavy');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');

const HEAVY_RAIN_MM = 50;
let  districts = [];

//2.Turn 7 days of numbers into a simple summary
function summarise(district) {
    const rain = district.daily.precipitation_sum;
    const totalRain = rain.reduce((sum, mm) => sum + mm, 0);

    return {
        ...district,
        totalRain:  Math.round(totalRain * 10) / 10,
        rainyDays: rain.filter((mm) => mm >= 1).length,
        maxTemp: Math.max(...district.daily.temperature_2m_max),
        minTemp: Math.min(...district.daily.temperature_2m_min),
    };
}

function dayName(dateString) {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' });
}

// 3. Small helpers that build table cells safely
function cell(text) {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
}

function makeTag(text, isNone) {
    const span = document.createElement('span');
    span.className = isNone ? 'tag none' : 'tag';
    span.textContent = text;
    return span;
}

function adviceCell(advice) {
    const td = document.createElement('td');
    const wrap = document.createElement('div');
    wrap.className = 'days';

    const activities = [
        { key: 'plant', label: '🌱 Plant' },
        { key: 'spray', label: '💧 Spray' },
        { key: 'dry', label: '☀️ Dry' },
    ];

    activities.forEach((activity) => {
        const goodDays = advice
            .filter((day) => day[activity.key])
            .map((day) => dayName(day.date));

        const text = goodDays.length > 0
            ? `${activity.label}: ${goodDays.join(', ')}`
            : `${activity.label}: none`;

        wrap.appendChild(makeTag(text, goodDays.length === 0));
    });

    td.appendChild(wrap);
    return td;
}

// 4. Filter, sort and draw the table
function render() {
    const query = searchInput.value.trim().toLowerCase();
    const province = provinceSelect.value;

    let list = districts.filter((d) => d.name.toLowerCase().includes(query));

    if (province) {
        list = list.filter((d) => d.province === province);
    }

    if (heavyCheckbox.checked) {
        list = list.filter((d) => d.totalRain >= HEAVY_RAIN_MM);
    }

    const sorters = {
        'rain-desc': (a, b) => b.totalRain - a.totalRain,
        'rain-asc': (a, b) => a.totalRain - b.totalRain,
        'temp-desc': (a, b) => b.maxTemp - a.maxTemp,
        name: (a, b) => a.name.localeCompare(b.name),
    };
    list.sort(sorters[sortSelect.value]);

    resultsEl.replaceChildren();

    if (list.length === 0) {
        statusEl.textContent = 'No districts match your search. Try another name or clear the filters.';
        return;
    }

    statusEl.textContent = `Showing ${list.length} of ${districts.length} districts.`;

    const maxRain = Math.max(...districts.map((d) => d.totalRain), 1);

    list.forEach((d, index) => {
        const row = document.createElement('tr');
        row.style.setProperty('--i', index);

        row.appendChild(cell(d.name));
        row.appendChild(cell(d.province));

        const rainTd = cell(`${d.totalRain} mm`);
        const bar = document.createElement('span');
        bar.className = 'rain-bar';
        bar.style.width = `${Math.round((d.totalRain / maxRain) * 120)}px`;
        rainTd.appendChild(bar);
        row.appendChild(rainTd);

        row.appendChild(cell(`${d.rainyDays} of 7`));
        row.appendChild(cell(`${d.minTemp}–${d.maxTemp} °C`));
        row.appendChild(adviceCell(d.advice));

        resultsEl.appendChild(row);
    });
}

// 5. Load data from our server, with clear error messages
async function loadForecast() {
    statusEl.classList.remove('error');
    statusEl.textContent = 'Loading forecast…';

    try {
        const response = await fetch(`/api/forecast?crop=${encodeURIComponent(cropSelect.value)}`);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong. Please try again.');
        }

        districts = data.map(summarise);
        render();
    } catch (error) {
        districts = [];
        resultsEl.replaceChildren();
        statusEl.classList.add('error');
        statusEl.textContent = error instanceof TypeError
            ? 'Could not reach the Imvura server. Check your internet connection and try again.'
            : error.message;
    }
}

// 6. Update the table whenever the user changes something
searchInput.addEventListener('input', render);
provinceSelect.addEventListener('change', render);
sortSelect.addEventListener('change', render);
heavyCheckbox.addEventListener('change', render);
cropSelect.addEventListener('change', loadForecast);

loadForecast();
    


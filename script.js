// Default cities with their time zones
const DEFAULT_CITIES = [
    { name: 'New York', timezone: 'America/New_York', country: 'USA' },
    { name: 'London', timezone: 'Europe/London', country: 'UK' },
    { name: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE' },
    { name: 'India', timezone: 'Asia/Kolkata', country: 'India' },
    { name: 'Singapore', timezone: 'Asia/Singapore', country: 'Singapore' },
    { name: 'Tokyo', timezone: 'Asia/Tokyo', country: 'Japan' },
    { name: 'Sydney', timezone: 'Australia/Sydney', country: 'Australia' },
    { name: 'Los Angeles', timezone: 'America/Los_Angeles', country: 'USA' },
];

// All available cities
const ALL_CITIES = [
    ...DEFAULT_CITIES,
    { name: 'Paris', timezone: 'Europe/Paris', country: 'France' },
    { name: 'Berlin', timezone: 'Europe/Berlin', country: 'Germany' },
    { name: 'Moscow', timezone: 'Europe/Moscow', country: 'Russia' },
    { name: 'Bangkok', timezone: 'Asia/Bangkok', country: 'Thailand' },
    { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', country: 'Hong Kong' },
    { name: 'Shanghai', timezone: 'Asia/Shanghai', country: 'China' },
    { name: 'Mumbai', timezone: 'Asia/Kolkata', country: 'India' },
    { name: 'Mexico City', timezone: 'America/Mexico_City', country: 'Mexico' },
    { name: 'Toronto', timezone: 'America/Toronto', country: 'Canada' },
    { name: 'São Paulo', timezone: 'America/Sao_Paulo', country: 'Brazil' },
    { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', country: 'Argentina' },
    { name: 'Cairo', timezone: 'Africa/Cairo', country: 'Egypt' },
    { name: 'Johannesburg', timezone: 'Africa/Johannesburg', country: 'South Africa' },
    { name: 'Istanbul', timezone: 'Europe/Istanbul', country: 'Turkey' },
    { name: 'Dubai', timezone: 'Asia/Dubai', country: 'UAE' },
    { name: 'Bangkok', timezone: 'Asia/Bangkok', country: 'Thailand' },
    { name: 'Seoul', timezone: 'Asia/Seoul', country: 'South Korea' },
    { name: 'Manila', timezone: 'Asia/Manila', country: 'Philippines' },
    { name: 'Jakarta', timezone: 'Asia/Jakarta', country: 'Indonesia' },
    { name: 'Kuala Lumpur', timezone: 'Asia/Kuala_Lumpur', country: 'Malaysia' },
    { name: 'Auckland', timezone: 'Pacific/Auckland', country: 'New Zealand' },
];

class DigitalClock {
    constructor() {
        this.cities = this.loadCities();
        this.timeFormat = localStorage.getItem('timeFormat') || '12';
        this.theme = localStorage.getItem('theme') || 'dark';
        this.showSeconds = localStorage.getItem('showSeconds') !== 'false';
        this.showDate = localStorage.getItem('showDate') !== 'false';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyTheme();
        this.renderClocks();
        this.startClock();
    }

    setupEventListeners() {
        // Add city button
        document.getElementById('addCityBtn').addEventListener('click', () => this.showAddCityModal());
        document.getElementById('addFirstCity').addEventListener('click', () => this.showAddCityModal());

        // Close modal buttons
        document.getElementById('closeModal').addEventListener('click', () => this.hideAddCityModal());
        document.getElementById('closeSettings').addEventListener('click', () => this.hideSettingsModal());

        // Settings button
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettingsModal());

        // Format select
        document.getElementById('formatSelect').addEventListener('change', (e) => {
            this.setTimeFormat(e.target.value);
        });

        // City search
        document.getElementById('citySearch').addEventListener('input', (e) => {
            this.filterCities(e.target.value);
        });

        // Settings
        document.getElementById('settingsFormat').addEventListener('change', (e) => {
            this.setTimeFormat(e.target.value);
        });

        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        document.getElementById('showSeconds').addEventListener('change', (e) => {
            this.showSeconds = e.target.checked;
            localStorage.setItem('showSeconds', this.showSeconds);
            this.renderClocks();
        });

        document.getElementById('showDate').addEventListener('change', (e) => {
            this.showDate = e.target.checked;
            localStorage.setItem('showDate', this.showDate);
            this.renderClocks();
        });

        document.getElementById('clearAll').addEventListener('click', () => {
            if (confirm('Are you sure you want to remove all cities?')) {
                this.cities = [];
                this.saveCities();
                this.renderClocks();
                this.hideSettingsModal();
            }
        });

        // Close modal when clicking outside
        document.getElementById('addCityModal').addEventListener('click', (e) => {
            if (e.target.id === 'addCityModal') this.hideAddCityModal();
        });

        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') this.hideSettingsModal();
        });
    }

    showAddCityModal() {
        document.getElementById('addCityModal').classList.add('show');
        document.getElementById('citySearch').value = '';
        this.renderCityList(ALL_CITIES);
    }

    hideAddCityModal() {
        document.getElementById('addCityModal').classList.remove('show');
    }

    showSettingsModal() {
        document.getElementById('settingsModal').classList.add('show');
        document.getElementById('settingsFormat').value = this.timeFormat;
        document.getElementById('themeSelect').value = this.theme;
        document.getElementById('showSeconds').checked = this.showSeconds;
        document.getElementById('showDate').checked = this.showDate;
    }

    hideSettingsModal() {
        document.getElementById('settingsModal').classList.remove('show');
    }

    renderCityList(citiesToShow) {
        const cityList = document.getElementById('cityList');
        cityList.innerHTML = '';

        citiesToShow.forEach(city => {
            const isAdded = this.cities.some(c => c.timezone === city.timezone);
            const cityItem = document.createElement('div');
            cityItem.className = 'city-item';
            if (isAdded) cityItem.style.opacity = '0.5';

            cityItem.innerHTML = `
                <div class="city-item-name">${city.name}</div>
                <div class="city-item-tz">${city.country} • ${city.timezone}</div>
            `;

            if (!isAdded) {
                cityItem.addEventListener('click', () => this.addCity(city));
            }

            cityList.appendChild(cityItem);
        });
    }

    filterCities(query) {
        const filtered = ALL_CITIES.filter(city =>
            city.name.toLowerCase().includes(query.toLowerCase()) ||
            city.country.toLowerCase().includes(query.toLowerCase()) ||
            city.timezone.toLowerCase().includes(query.toLowerCase())
        );
        this.renderCityList(filtered);
    }

    addCity(city) {
        const exists = this.cities.some(c => c.timezone === city.timezone);
        if (!exists) {
            this.cities.push(city);
            this.saveCities();
            this.renderClocks();
            this.renderCityList(ALL_CITIES);
        }
    }

    removeCity(timezone) {
        this.cities = this.cities.filter(c => c.timezone !== timezone);
        this.saveCities();
        this.renderClocks();
    }

    renderClocks() {
        const container = document.getElementById('clocksContainer');
        const emptyState = document.getElementById('emptyState');

        if (this.cities.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';
        container.innerHTML = '';

        this.cities.forEach(city => {
            const clockCard = this.createClockCard(city);
            container.appendChild(clockCard);
        });
    }

    createClockCard(city) {
        const card = document.createElement('div');
        card.className = 'clock-card';
        card.id = `clock-${city.timezone}`;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', () => this.removeCity(city.timezone));

        const cityName = document.createElement('div');
        cityName.className = 'city-name';
        cityName.textContent = city.name;

        const countryInfo = document.createElement('div');
        countryInfo.className = 'city-country';
        countryInfo.textContent = city.country;

        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'time-display';
        timeDisplay.id = `time-${city.timezone}`;

        const dateDisplay = document.createElement('div');
        dateDisplay.className = 'date-display';
        dateDisplay.id = `date-${city.timezone}`;

        card.appendChild(removeBtn);
        card.appendChild(cityName);
        card.appendChild(countryInfo);
        card.appendChild(timeDisplay);
        if (this.showDate) {
            card.appendChild(dateDisplay);
        }

        return card;
    }

    formatTime(date) {
        if (this.timeFormat === '24') {
            return this.format24Hour(date);
        } else {
            return this.format12Hour(date);
        }
    }

    format12Hour(date) {
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;
        hours = String(hours).padStart(2, '0');

        const timeStr = this.showSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
        return `${timeStr} <span class="ampm">${ampm}</span>`;
    }

    format24Hour(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return this.showSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
    }

    formatDate(date) {
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    updateClock() {
        this.cities.forEach(city => {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone: city.timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: this.timeFormat === '12',
            });

            const parts = formatter.formatToParts(now);
            const timeObj = {};
            parts.forEach(part => {
                timeObj[part.type] = part.value;
            });

            const timeElement = document.getElementById(`time-${city.timezone}`);
            if (timeElement) {
                let timeStr = `${timeObj.hour}:${timeObj.minute}`;
                if (this.showSeconds) {
                    timeStr += `:${timeObj.second}`;
                }
                if (this.timeFormat === '12') {
                    timeStr += ` <span class="ampm">${timeObj.dayPeriod}</span>`;
                }
                timeElement.innerHTML = timeStr;
            }

            // Update date if visible
            if (this.showDate) {
                const dateElement = document.getElementById(`date-${city.timezone}`);
                if (dateElement) {
                    const localDate = new Date(now.toLocaleString('en-US', { timeZone: city.timezone }));
                    dateElement.textContent = this.formatDate(localDate);
                }
            }
        });
    }

    startClock() {
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    setTimeFormat(format) {
        this.timeFormat = format;
        localStorage.setItem('timeFormat', format);
        document.getElementById('formatSelect').value = format;
        document.getElementById('settingsFormat').value = format;
    }

    setTheme(theme) {
        this.theme = theme;
        localStorage.setItem('theme', theme);
        this.applyTheme();
    }

    applyTheme() {
        if (this.theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }

    loadCities() {
        const saved = localStorage.getItem('cities');
        return saved ? JSON.parse(saved) : DEFAULT_CITIES;
    }

    saveCities() {
        localStorage.setItem('cities', JSON.stringify(this.cities));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DigitalClock();
});

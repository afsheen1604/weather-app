// Get API key from config file
const API_KEY = window.WEATHER_CONFIG?.apiKey;
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check if elements exist before adding event listeners
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        themeToggle.classList.toggle('active');
        // Store theme preference in memory instead of localStorage
        window.darkModeEnabled = body.classList.contains('dark');
    });
}

// Load saved theme (using memory storage instead of localStorage)
if (window.darkModeEnabled) {
    body.classList.add('dark');
    if (themeToggle) themeToggle.classList.add('active');
}

// Weather functions
async function getWeatherData(query) {
    try {
        console.log('Making API request with query:', query);
        console.log('Using API key:', API_KEY.substring(0, 8) + '...');
        
        const response = await fetch(`${API_URL}?${query}&appid=${API_KEY}&units=metric`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API Error:', errorData);
            throw new Error(errorData.message || 'Weather data not found');
        }
        
        const data = await response.json();
        console.log('Weather data received:', {
            location: `${data.name}, ${data.sys.country}`,
            coordinates: `${data.coord.lat}, ${data.coord.lon}`,
            weather: data.weather[0].description,
            temp: data.main.temp
        });
        
        displayWeather(data);
        hideError();
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        showError(error.message);
        hideWeather();
    }
}

function searchWeather() {
    const cityInput = document.getElementById('cityInput');
    if (!cityInput) {
        showError('City input not found');
        return;
    }
    
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(`q=${city}`);
    } else {
        showError('Please enter a city name');
    }
}

function getLocationWeather() {
    if (navigator.geolocation) {
        showError('Getting your location...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                console.log('Got location:', {
                    lat: latitude,
                    lon: longitude,
                    accuracy: accuracy + ' meters'
                });
                
                // Round coordinates to 4 decimal places for better accuracy
                const roundedLat = Math.round(latitude * 10000) / 10000;
                const roundedLon = Math.round(longitude * 10000) / 10000;
                
                console.log('Rounded coordinates:', roundedLat, roundedLon);
                getWeatherData(`lat=${roundedLat}&lon=${roundedLon}`);
            },
            (error) => {
                console.error('Geolocation error:', error);
                let errorMessage = 'Unable to get your location: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Position unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Request timeout';
                        break;
                    default:
                        errorMessage += error.message;
                        break;
                }
                showError(errorMessage);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    } else {
        showError('Geolocation is not supported');
    }
}

function displayWeather(data) {
    const elements = {
        location: document.getElementById('location'),
        description: document.getElementById('description'),
        temperature: document.getElementById('temperature'),
        humidity: document.getElementById('humidity'),
        windSpeed: document.getElementById('windSpeed'),
        pressure: document.getElementById('pressure'),
        visibility: document.getElementById('visibility')
    };

    // Check if all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Element not found: ${key}`);
            showError('Display elements not found');
            return;
        }
    }

    elements.location.textContent = `${data.name}, ${data.sys.country}`;
    elements.description.textContent = data.weather[0].description;
    elements.temperature.textContent = `${Math.round(data.main.temp)}°C`;
    elements.humidity.textContent = `${data.main.humidity}%`;
    elements.windSpeed.textContent = `${data.wind.speed} m/s`;
    elements.pressure.textContent = `${data.main.pressure} hPa`;
    elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    const weatherCard = document.getElementById('weatherCard');
    if (weatherCard) {
        weatherCard.classList.remove('hidden');
        setTimeout(() => weatherCard.classList.add('show'), 100);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    } else {
        console.error('Error div not found:', message);
    }
}

function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

function hideWeather() {
    const weatherCard = document.getElementById('weatherCard');
    if (weatherCard) {
        weatherCard.classList.remove('show');
        setTimeout(() => weatherCard.classList.add('hidden'), 300);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Enter key support
    const cityInput = document.getElementById('cityInput');
    if (cityInput) {
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchWeather();
            }
        });
    }

    // Check if API key is loaded from config
    if (!API_KEY) {
        showError('API key not found. Please ensure config.js is loaded properly.');
        return;
    }
});
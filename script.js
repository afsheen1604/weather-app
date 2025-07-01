// Initialize API configuration first
const API_KEY = '62b6dcc31360daebc069a37481c37a28'; // In production, use environment variables
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM elements
const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherCard = document.getElementById('weatherCard');
const errorMessage = document.getElementById('errorMessage');
const temperatureEl = document.getElementById('temperature');
const locationEl = document.getElementById('location');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');
const weatherIcon = document.getElementById('weatherIcon');

// Weather icon mapping
const weatherIcons = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
};

// Initialize the app
function init() {
    searchBtn.addEventListener('click', handleSearch);
    locationBtn.addEventListener('click', getCurrentLocation);
    locationInput.addEventListener('keypress', handleKeyPress);
    
    // Load default weather (New York)
    getWeatherByCity('New York');
}

function handleKeyPress(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
}

function handleSearch() {
    const city = locationInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                hideLoading();
                showError('Unable to get your location. Please enter a city name.');
            }
        );
    } else {
        showError('Geolocation is not supported by this browser.');
    }
}

async function getWeatherByCity(city) {
    try {
        showLoading();
        const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('City not found');
        }
        
        const data = await response.json();
        displayWeather(data);
        hideError();
    } catch (error) {
        showError('Location not found. Please try again.');
    } finally {
        hideLoading();
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        showLoading();
        const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Weather data not available');
        }
        
        const data = await response.json();
        displayWeather(data);
        hideError();
    } catch (error) {
        showError('Unable to get weather data for your location.');
    } finally {
        hideLoading();
    }
}

function displayWeather(data) {
    const temperature = Math.round(data.main.temp);
    const location = `${data.name}, ${data.sys.country}`;
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    const iconCode = data.weather[0].icon;
    
    temperatureEl.textContent = `${temperature}°C`;
    locationEl.textContent = location;
    humidityEl.textContent = `${humidity}%`;
    windSpeedEl.textContent = `${windSpeed} km/h`;
    
    // Set weather icon
    const iconEmoji = weatherIcons[iconCode] || '🌤️';
    weatherIcon.style.display = 'none';
    weatherIcon.parentElement.innerHTML = `<div style="font-size: 4rem; margin-bottom: 20px;">${iconEmoji}</div>`;
    
    // Clear input
    locationInput.value = '';
}

function showLoading() {
    weatherCard.classList.add('loading');
    searchBtn.disabled = true;
    locationBtn.disabled = true;
}

function hideLoading() {
    weatherCard.classList.remove('loading');
    searchBtn.disabled = false;
    locationBtn.disabled = false;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorMessage.classList.remove('show');
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
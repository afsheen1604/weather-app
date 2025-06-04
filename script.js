require('dotenv').config();
const API_KEY = process.env.API_KEY;
        const BASE_URL = 'https://api.openweathermap.org/data/2.5';

        // Theme management
        function toggleTheme() {
            const body = document.body;
            const themeIcon = document.getElementById('theme-icon');
            
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                themeIcon.textContent = '🌙';
                localStorage.setItem('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                themeIcon.textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            }
        }

        // Load saved theme
        function loadTheme() {
            const savedTheme = localStorage.getItem('theme');
            const themeIcon = document.getElementById('theme-icon');
            
            if (savedTheme === 'dark') {
                document.body.setAttribute('data-theme', 'dark');
                themeIcon.textContent = '☀️';
            }
        }

        // Show/hide loading state
        function showLoading(show) {
            const loading = document.getElementById('loading');
            const currentWeather = document.getElementById('current-weather');
            const forecastSection = document.getElementById('forecast-section');
            
            if (show) {
                loading.classList.remove('hidden');
                currentWeather.classList.add('hidden');
                forecastSection.classList.add('hidden');
            } else {
                loading.classList.add('hidden');
            }
        }

        // Show error message
        function showError(message) {
            const errorDiv = document.getElementById('error-message');
            errorDiv.innerHTML = `<div class="error">${message}</div>`;
            setTimeout(() => {
                errorDiv.innerHTML = '';
            }, 5000);
        }

        // Get current location
        function getCurrentLocation() {
            if (!navigator.geolocation) {
                showError('Geolocation is not supported by this browser.');
                return;
            }

            showLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherByCoords(latitude, longitude);
                },
                (error) => {
                    showLoading(false);
                    let message = 'Unable to retrieve your location.';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Location access denied by user.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Location information unavailable.';
                            break;
                        case error.TIMEOUT:
                            message = 'Location request timed out.';
                            break;
                    }
                    
                    showError(message);
                }
            );
        }

        // Search weather by city name
        function searchWeather(event) {
            event.preventDefault();
            const city = document.getElementById('cityInput').value.trim();
            
            if (!city) {
                showError('Please enter a city name.');
                return;
            }

            showLoading(true);
            fetchWeatherByCity(city);
        }

        // Fetch weather by city name
        async function fetchWeatherByCity(city) {
            try {
                const response = await fetch(
                    `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
                );
                
                if (!response.ok) {
                    throw new Error(response.status === 404 ? 'City not found' : 'Weather data unavailable');
                }
                
                const data = await response.json();
                displayCurrentWeather(data);
                fetchForecast(data.coord.lat, data.coord.lon);
                
            } catch (error) {
                showLoading(false);
                showError(error.message);
            }
        }

        // Fetch weather by coordinates
        async function fetchWeatherByCoords(lat, lon) {
            try {
                const response = await fetch(
                    `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );
                
                if (!response.ok) {
                    throw new Error('Weather data unavailable for your location');
                }
                
                const data = await response.json();
                displayCurrentWeather(data);
                fetchForecast(lat, lon);
                
            } catch (error) {
                showLoading(false);
                showError(error.message);
            }
        }

        // Fetch 5-day forecast
        async function fetchForecast(lat, lon) {
            try {
                const response = await fetch(
                    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
                );
                
                if (!response.ok) {
                    throw new Error('Forecast data unavailable');
                }
                
                const data = await response.json();
                displayForecast(data);
                
            } catch (error) {
                console.error('Forecast error:', error);
            }
        }

        // Display current weather
        function displayCurrentWeather(data) {
            const location = document.getElementById('location');
            const weatherIcon = document.getElementById('weather-icon');
            const temperature = document.getElementById('temperature');
            const description = document.getElementById('description');
            const humidity = document.getElementById('humidity');
            const windSpeed = document.getElementById('wind-speed');
            const feelsLike = document.getElementById('feels-like');
            const visibility = document.getElementById('visibility');

            location.textContent = `🌍 ${data.name}, ${data.sys.country}`;
            weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
            weatherIcon.alt = data.weather[0].description;
            temperature.textContent = `${Math.round(data.main.temp)}°C`;
            description.textContent = `✨ ${data.weather[0].description}`;
            humidity.textContent = `${data.main.humidity}%`;
            windSpeed.textContent = `${data.wind.speed} m/s`;
            feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
            visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

            showLoading(false);
            document.getElementById('current-weather').classList.remove('hidden');
        }

        // Display 5-day forecast
        function displayForecast(data) {
            const forecastGrid = document.getElementById('forecast-grid');
            forecastGrid.innerHTML = '';

            // Get one forecast per day (every 8th item since API returns 3-hour intervals)
            const dailyForecasts = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

            dailyForecasts.forEach(forecast => {
                const date = new Date(forecast.dt * 1000);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                const forecastItem = document.createElement('div');
                forecastItem.className = 'forecast-item';
                forecastItem.innerHTML = `
                    <div class="forecast-date">${dayName}, ${dayDate}</div>
                    <img class="forecast-icon" 
                         src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" 
                         alt="${forecast.weather[0].description}">
                    <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
                    <div class="forecast-desc">${forecast.weather[0].description}</div>
                `;
                forecastGrid.appendChild(forecastItem);
            });

            document.getElementById('forecast-section').classList.remove('hidden');
        }

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadTheme();
            
            // Try to get user's location on page load
            if (navigator.geolocation) {
                getCurrentLocation();
            }
        });
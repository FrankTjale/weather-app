const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const weatherIcon = document.getElementById("weatherIcon");

searchButton.addEventListener("click", searchWeather);

cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchWeather();
    }
});

async function searchWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    try {

        description.textContent = "Loading weather...";
        weatherIcon.textContent = "⏳";

        // Find the city coordinates
        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        const locationData = await locationResponse.json();

        if (!locationData.results) {
            throw new Error("City not found");
        }

        const location = locationData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Get weather data
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
        );

        const weatherData = await weatherResponse.json();

        const currentWeather = weatherData.current;

        // Display information
        cityName.textContent = `${location.name}, ${location.country}`;

        temperature.textContent =
            `${Math.round(currentWeather.temperature_2m)}°C`;

        humidity.textContent =
            `${currentWeather.relative_humidity_2m}%`;

        windSpeed.textContent =
            `${Math.round(currentWeather.wind_speed_10m)} km/h`;

        description.textContent =
            getWeatherDescription(currentWeather.weather_code);

        weatherIcon.textContent =
            getWeatherIcon(currentWeather.weather_code);

    } catch (error) {

        cityName.textContent = "Error";

        temperature.textContent = "--°C";

        description.textContent =
            "Could not find that city. Please try again.";

        humidity.textContent = "--%";

        windSpeed.textContent = "-- km/h";

        weatherIcon.textContent = "❌";

        console.error(error);
    }
}

function getWeatherDescription(code) {

    if (code === 0) {
        return "Clear sky";
    }

    if (code === 1 || code === 2) {
        return "Partly cloudy";
    }

    if (code === 3) {
        return "Overcast";
    }

    if (code >= 45 && code <= 48) {
        return "Foggy";
    }

    if (code >= 51 && code <= 67) {
        return "Rainy";
    }

    if (code >= 71 && code <= 77) {
        return "Snowy";
    }

    if (code >= 80 && code <= 82) {
        return "Rain showers";
    }

    if (code >= 95) {
        return "Thunderstorm";
    }

    return "Unknown weather";
}

function getWeatherIcon(code) {

    if (code === 0) {
        return "☀️";
    }

    if (code === 1 || code === 2) {
        return "🌤️";
    }

    if (code === 3) {
        return "☁️";
    }

    if (code >= 45 && code <= 48) {
        return "🌫️";
    }

    if (code >= 51 && code <= 67) {
        return "🌧️";
    }

    if (code >= 71 && code <= 77) {
        return "❄️";
    }

    if (code >= 80 && code <= 82) {
        return "🌦️";
    }

    if (code >= 95) {
        return "⛈️";
    }

    return "🌡️";
                                             }

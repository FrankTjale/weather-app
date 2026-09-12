const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const weatherIcon = document.getElementById("weatherIcon");
const feelsLike = document.getElementById("feelsLike");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const forecast = document.getElementById("forecast");


/* =========================
   SEARCH BUTTON
========================= */

searchButton.addEventListener("click", searchWeather);


/* =========================
   ENTER KEY
========================= */

cityInput.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        searchWeather();
    }

});


/* =========================
   SEARCH WEATHER BY CITY
========================= */

async function searchWeather() {

    const city = cityInput.value.trim();

    if (city === "") {

        alert("Please enter a city name.");

        return;
    }

    try {

        showLoading();


        const locationResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );


        const locationData = await locationResponse.json();


        if (!locationData.results) {

            throw new Error("City not found");

        }


        const location = locationData.results[0];


        await getWeather(
            location.latitude,
            location.longitude,
            location.name,
            location.country
        );


    } catch (error) {

        showError();

        console.error(error);

    }

}


/* =========================
   GET WEATHER
========================= */

async function getWeather(
    latitude,
    longitude,
    name,
    country
) {

    const weatherResponse = await fetch(

        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=5&timezone=auto`

    );


    const weatherData =
        await weatherResponse.json();


    const currentWeather =
        weatherData.current;

    const dailyWeather =
        weatherData.daily;


    /* =========================
       DISPLAY CURRENT WEATHER
    ========================= */

    cityName.textContent =
        `${name}, ${country}`;


    temperature.textContent =
        `${Math.round(currentWeather.temperature_2m)}°C`;


    feelsLike.textContent =
        `${Math.round(currentWeather.apparent_temperature)}°C`;


    humidity.textContent =
        `${currentWeather.relative_humidity_2m}%`;


    windSpeed.textContent =
        `${Math.round(currentWeather.wind_speed_10m)} km/h`;


    description.textContent =
        getWeatherDescription(
            currentWeather.weather_code
        );


    weatherIcon.textContent =
        getWeatherIcon(
            currentWeather.weather_code
        );


    /* =========================
       SUNRISE & SUNSET
    ========================= */

    sunrise.textContent =
        formatTime(dailyWeather.sunrise[0]);


    sunset.textContent =
        formatTime(dailyWeather.sunset[0]);


    /* =========================
       FORECAST
    ========================= */

    displayForecast(dailyWeather);

}


/* =========================
   USE MY LOCATION
========================= */

function useMyLocation() {

    if (!navigator.geolocation) {

        alert(
            "Geolocation is not supported by your browser."
        );

        return;
    }


    showLoading();


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            try {

                /* Find nearest city */

                const locationResponse =
                    await fetch(

                        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`

                    );


                const locationData =
                    await locationResponse.json();


                let name = "My Location";
                let country = "";


                if (
                    locationData.results &&
                    locationData.results.length > 0
                ) {

                    name =
                        locationData.results[0].name;

                    country =
                        locationData.results[0].country;

                }


                cityInput.value = name;


                await getWeather(
                    latitude,
                    longitude,
                    name,
                    country
                );


            } catch (error) {

                showError();

                console.error(error);

            }

        },


        function(error) {

            console.error(error);

            cityName.textContent =
                "Location unavailable";

            description.textContent =
                "Please allow location access or search for a city.";

            weatherIcon.textContent = "📍";

        }

    );

}


/* =========================
   LOADING STATE
========================= */

function showLoading() {

    cityName.textContent =
        "Loading...";

    temperature.textContent =
        "--°C";

    feelsLike.textContent =
        "--°C";

    description.textContent =
        "Getting weather information...";

    humidity.textContent =
        "--%";

    windSpeed.textContent =
        "-- km/h";

    sunrise.textContent =
        "--:--";

    sunset.textContent =
        "--:--";

    weatherIcon.textContent =
        "⏳";

    forecast.innerHTML = "";

}


/* =========================
   ERROR STATE
========================= */

function showError() {

    cityName.textContent =
        "Error";

    temperature.textContent =
        "--°C";

    feelsLike.textContent =
        "--°C";

    description.textContent =
        "Could not get the weather. Please try again.";

    humidity.textContent =
        "--%";

    windSpeed.textContent =
        "-- km/h";

    sunrise.textContent =
        "--:--";

    sunset.textContent =
        "--:--";

    weatherIcon.textContent =
        "❌";

    forecast.innerHTML = "";

}


/* =========================
   FORMAT TIME
========================= */

function formatTime(dateTime) {

    const date =
        new Date(dateTime);


    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================
   FORECAST
========================= */

function displayForecast(daily) {

    forecast.innerHTML = "";


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            new Date(daily.time[i]);


        const dayName =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );


        const icon =
            getWeatherIcon(
                daily.weather_code[i]
            );


        const maxTemp =
            Math.round(
                daily.temperature_2m_max[i]
            );


        const minTemp =
            Math.round(
                daily.temperature_2m_min[i]
            );


        const forecastCard =
            document.createElement("div");


        forecastCard.className =
            "forecast-card";


        forecastCard.innerHTML = `

            <div class="forecast-day">
                ${dayName}
            </div>

            <div class="forecast-icon">
                ${icon}
            </div>

            <div class="forecast-temp">
                ${maxTemp}°
                <span class="forecast-low">
                    ${minTemp}°
                </span>
            </div>

        `;


        forecast.appendChild(
            forecastCard
        );

    }

}


/* =========================
   WEATHER DESCRIPTION
========================= */

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


/* =========================
   WEATHER ICON
========================= */

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

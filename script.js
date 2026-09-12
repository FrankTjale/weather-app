const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const cityName = document.getElementById("cityName");
const localTime = document.getElementById("localTime");

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
   CLOCK VARIABLES
========================= */

let cityTimeZone = null;


/* =========================
   SEARCH BUTTON
========================= */

searchButton.addEventListener(
    "click",
    searchWeather
);


/* =========================
   ENTER KEY
========================= */

cityInput.addEventListener(
    "keypress",
    function(event) {

        if (event.key === "Enter") {
            searchWeather();
        }

    }
);


/* =========================
   SEARCH WEATHER
========================= */

async function searchWeather() {

    const city =
        cityInput.value.trim();


    if (city === "") {

        alert(
            "Please enter a city name."
        );

        return;

    }


    try {

        showLoading();


        const locationResponse =
            await fetch(

                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`

            );


        const locationData =
            await locationResponse.json();


        if (!locationData.results) {

            throw new Error(
                "City not found"
            );

        }


        const location =
            locationData.results[0];


        await getWeather(

            location.latitude,
            location.longitude,
            location.name,
            location.country

        );

    }


    catch (error) {

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


    const weatherResponse =
        await fetch(

            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=5&timezone=auto`

        );


    const weatherData =
        await weatherResponse.json();


    const currentWeather =
        weatherData.current;


    const dailyWeather =
        weatherData.daily;


    /* =========================
       CITY
    ========================= */

    cityName.textContent =
        `${name}, ${country}`;


    /* =========================
       TIME ZONE
    ========================= */

    cityTimeZone =
        weatherData.timezone;


    updateLocalTime();


    /* =========================
       TEMPERATURE
    ========================= */

    temperature.textContent =
        `${Math.round(
            currentWeather.temperature_2m
        )}°C`;


    /* =========================
       FEELS LIKE
    ========================= */

    feelsLike.textContent =
        `${Math.round(
            currentWeather.apparent_temperature
        )}°C`;


    /* =========================
       HUMIDITY
    ========================= */

    humidity.textContent =
        `${currentWeather.relative_humidity_2m}%`;


    /* =========================
       WIND
    ========================= */

    windSpeed.textContent =
        `${Math.round(
            currentWeather.wind_speed_10m
        )} km/h`;


    /* =========================
       DESCRIPTION
    ========================= */

    description.textContent =
        getWeatherDescription(
            currentWeather.weather_code
        );


    /* =========================
       WEATHER ICON
    ========================= */

    weatherIcon.textContent =
        getWeatherIcon(
            currentWeather.weather_code
        );


    /* =========================
       BACKGROUND
    ========================= */

    setWeatherBackground(
        currentWeather.weather_code
    );


    /* =========================
       SUNRISE
    ========================= */

    sunrise.textContent =
        formatTime(
            dailyWeather.sunrise[0]
        );


    /* =========================
       SUNSET
    ========================= */

    sunset.textContent =
        formatTime(
            dailyWeather.sunset[0]
        );


    /* =========================
       FORECAST
    ========================= */

    displayForecast(
        dailyWeather
    );

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


                const locationResponse =
                    await fetch(

                        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`

                    );


                const locationData =
                    await locationResponse.json();


                let name =
                    "My Location";


                let country =
                    "";


                if (
                    locationData.results &&
                    locationData.results.length > 0
                ) {

                    name =
                        locationData.results[0].name;

                    country =
                        locationData.results[0].country;

                }


                cityInput.value =
                    name;


                await getWeather(

                    latitude,
                    longitude,
                    name,
                    country

                );

            }


            catch (error) {

                showError();

                console.error(error);

            }

        },


        function(error) {

            console.error(error);


            cityName.textContent =
                "Location unavailable";


            localTime.textContent =
                "--:--";


            temperature.textContent =
                "--°C";


            feelsLike.textContent =
                "--°C";


            description.textContent =
                "Please allow location access or search for a city.";


            humidity.textContent =
                "--%";


            windSpeed.textContent =
                "-- km/h";


            sunrise.textContent =
                "--:--";


            sunset.textContent =
                "--:--";


            weatherIcon.textContent =
                "📍";


            forecast.innerHTML =
                "";

        }

    );

}


/* =========================
   UPDATE LOCAL TIME
========================= */

function updateLocalTime() {


    if (!cityTimeZone) {

        return;

    }


    const now =
        new Date();


    const time =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone: cityTimeZone,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        ).format(now);


    localTime.textContent =
        `Local time: ${time}`;

}


/* =========================
   UPDATE CLOCK EVERY SECOND
========================= */

setInterval(
    updateLocalTime,
    1000
);


/* =========================
   LOADING STATE
========================= */

function showLoading() {

    cityName.textContent =
        "Loading...";


    localTime.textContent =
        "--:--";


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


    forecast.innerHTML =
        "";

}


/* =========================
   ERROR STATE
========================= */

function showError() {

    cityName.textContent =
        "Error";


    localTime.textContent =
        "--:--";


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


    forecast.innerHTML =
        "";

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

    forecast.innerHTML =
        "";


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {


        const date =
            new Date(
                daily.time[i]
            );


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
            document.createElement(
                "div"
            );


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


/* =========================
   DYNAMIC BACKGROUND
========================= */

function setWeatherBackground(code) {


    document.body.classList.remove(

        "clear",
        "cloudy",
        "rain",
        "snow",
        "fog",
        "storm"

    );


    if (code === 0) {

        document.body.classList.add(
            "clear"
        );

    }

    else if (
        code === 1 ||
        code === 2 ||
        code === 3
    ) {

        document.body.classList.add(
            "cloudy"
        );

    }

    else if (
        code >= 45 &&
        code <= 48
    ) {

        document.body.classList.add(
            "fog"
        );

    }

    else if (
        code >= 51 &&
        code <= 67
    ) {

        document.body.classList.add(
            "rain"
        );

    }

    else if (
        code >= 71 &&
        code <= 77
    ) {

        document.body.classList.add(
            "snow"
        );

    }

    else if (
        code >= 80 &&
        code <= 82
    ) {

        document.body.classList.add(
            "rain"
        );

    }

    else if (code >= 95) {

        document.body.classList.add(
            "storm"
        );

    }

                                         }

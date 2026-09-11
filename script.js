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

function searchWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name.");
        return;
    }

    cityName.textContent = city;

    temperature.textContent = "--°C";

    description.textContent =
        "Live weather data will be connected soon.";

    humidity.textContent = "--%";

    windSpeed.textContent = "-- km/h";

    weatherIcon.textContent = "🌤️";
}

//Temperature Updates
function mainUpdateEverything(event) {
  event.preventDefault();
  let city = document.querySelector("#search-engine").value;
  if (city === "") {
    alert("Please enter a city.");
  } else {
    axios.get(getApiUrl(city)).then(function (response) {
      updateTemperature(response, "search");
    });
  }
}

function getApiUrl(city) {
  let apiKey = "ec993fa98c77b985fc9c225a40d800db";
  return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&&units=metric`;
}

function updateTemperature(response, origin) {
  changeToCelsius();
  displayTemperature(response.data);
  updateWeatherEmoji(response.data);
  if (origin === "search") {
    changeInnerHTML("#default-city", response.data.name);
  }
  if (origin === "gps") {
    changeInnerHTML("#default-city", "Your location");
  }
  document.querySelector("#search-engine").value = "";
}

function displayTemperature(data) {
  console.log(data);
  let tempMin = Math.round(data.main.temp_min);
  let tempMax = Math.round(data.main.temp_max);
  changeInnerHTML(".minTempNumber", tempMin);
  changeInnerHTML(".maxTempNumber", tempMax);
}

//Unit Updates
function changeUnit(event) {
  event.preventDefault();
  let newUnit = document.querySelector(".unitConverter");
  if (newUnit.innerHTML === "|°C") {
    changeToCelsius();
    celsiusCalculation();
  } else {
    changeToFahrenheit();
    fahrenheitCalculation();
  }
}

function fahrenheitCalculation() {
  let tempMin = document.querySelector(".minTempNumber").innerHTML;
  let fahrenheitConvertionTempMin = Math.round(1.8 * tempMin + 32);
  changeInnerHTML(".minTempNumber", fahrenheitConvertionTempMin);

  let tempMax = document.querySelector(".maxTempNumber").innerHTML;
  let fahrenheitConvertionTempMax = Math.round(1.8 * tempMax + 32);
  changeInnerHTML(".maxTempNumber", fahrenheitConvertionTempMax);
}

function celsiusCalculation() {
  let tempMin = document.querySelector(".minTempNumber").innerHTML;
  let celsiusConvertionTempMin = Math.round(((tempMin - 32) * 5) / 9);
  changeInnerHTML(".minTempNumber", celsiusConvertionTempMin);

  let tempMax = document.querySelector(".maxTempNumber").innerHTML;
  let celsiusConvertionTempMax = Math.round(((tempMax - 32) * 5) / 9);
  changeInnerHTML(".maxTempNumber", celsiusConvertionTempMax);
}

function changeToFahrenheit() {
  changeInnerHTML(".unitConverter", `|°C`);
  changeInnerHTML(".minTemp", `°F`);
  changeInnerHTML(".maxTemp", `°F`);
}

function changeToCelsius() {
  changeInnerHTML(".unitConverter", `|°F`);
  changeInnerHTML(".minTemp", `°C`);
  changeInnerHTML(".maxTemp", `°C`);
}

//Changing the display on the page
function changeInnerHTML(query, innerHTML) {
  let htmlElement = document.querySelector(query);
  htmlElement.innerHTML = innerHTML;
}

function updateWeatherEmoji(data) {
  let weather = data.weather[0].main;
  if ("Drizzle" === weather) {
    document.querySelector("#weather-emoji").className = "fas fa-cloud-rain";
  } else if ("Clouds" === weather) {
    document.querySelector("#weather-emoji").className = "fas fa-cloud";
  } else if ("Clear" === weather) {
    document.querySelector("#weather-emoji").className = "fas fa-sun";
  } else if ("Snow" === weather) {
    document.querySelector("#weather-emoji").className = "fas fa-snowflake";
  } else if ("Rain" === weather) {
    document.querySelector("#weather-emoji").className =
      "fas fa-cloud-showers-heavy";
  } else if ("Storm" === weather) {
    document.querySelector("#weather-emoji").className = "fas fa-bolt";
  } else if ("Fog" === weather) {
    document.querySelector("#weather-emoji").className = "fas fa-smog";
  } else if ("Mist" === weather) {
    document.querySelector("#weather-emoji").className = "fas fa-stream";
  } else {
    document.querySelector("#weather-emoji").className =
      "fas fa-question-circle";
  }
}

//GPS Weather
function handlePositionClick() {
  navigator.geolocation.getCurrentPosition(getWeatherForGps);
}

function getWeatherForGps(position) {
  axios.get(buildGpsApiUrl(position)).then(function (response) {
    updateTemperature(response, "gps");
  });
}

function buildGpsApiUrl(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  let apiKey = "ec993fa98c77b985fc9c225a40d800db";
  return `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&&units=metric`;
}

function defaultContent() {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let day = days[now.getDay()]; // 0, 1, 2

  if (hours < 10) {
    hours = `0${hours}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  axios.get(getApiUrl("Cologne")).then(updateTemperature);
  changeInnerHTML("#current-time", `${day}, ${hours}:${minutes}`);
}

defaultContent();

document
  .querySelector(".searchButton")
  .addEventListener("click", mainUpdateEverything);

document.querySelector(".unitConverter").addEventListener("click", changeUnit);

document
  .querySelector(".gpsButton")
  .addEventListener("click", handlePositionClick);

//window.onload = main();

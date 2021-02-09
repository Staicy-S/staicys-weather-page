//Temperature Updates
function mainUpdateEverything(event) {
  event.preventDefault();
  let city = document.querySelector("#search-engine").value;
  if (city === "") {
    alert("Please enter a city.");
  } else {
    axios
      .get(getApiUrl(city))
      .then(function (response) {
        updateTemperature(response, "search");
      })
      .catch(function () {
        alert(
          `Unfortunately, we don't know the weather for ${city}. Please search for ${city} elsewhere.`
        );
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
    changeInnerHTML(
      "#default-city",
      `${response.data.name}, ${response.data.sys.country}`
    );
  }
  if (origin === "gps") {
    changeInnerHTML("#default-city", "Your location");
  } else {
    changeInnerHTML(
      "#default-city",
      `${response.data.name}, ${response.data.sys.country}`
    );
  }
  document.querySelector("#search-engine").value = "";
  updateToLocalTime(response.data);
}

function updateToLocalTime(data) {
  let localDate = new Date();
  let utcDate = localDate.getUTCDate();
  let utcHours = localDate.getUTCHours();
  let utcMinutes = localDate.getUTCMinutes();
  let offset = data.timezone;

  let minutesToAdd = (offset / 60) % 60;
  let hourCarryOver = Math.floor((utcMinutes + minutesToAdd) / 60);
  let hoursToAdd = Math.floor(offset / 60 / 60);
  let daysCarryOver = Math.floor((utcHours + hoursToAdd) / 24);
  let localMinutes = (utcMinutes + minutesToAdd) % 60;
  let localHours = (utcHours + hoursToAdd + hourCarryOver + 24) % 24;
  let localDays = (utcDate + daysCarryOver) % 7;
  provideTime(localDays, localHours, localMinutes);
}

function displayTemperature(data) {
  console.log(data);
  let tempMin = Math.round(data.main.temp_min);
  let tempMax = Math.round(data.main.temp_max);
  let temp = Math.round(data.main.temp);
  changeInnerHTML(".minTempNumber", tempMin);
  changeInnerHTML(".maxTempNumber", tempMax);
  if (temp > 20) {
    document.getElementById("gradient").style.backgroundImage =
      "linear-gradient(to top, #feada6 0%, #f5efef 100%)";
  } else if (temp < 10) {
    document.getElementById("gradient").style.backgroundImage =
      "linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)";
  } else {
    document.getElementById("gradient").style.backgroundImage =
      "linear-gradient(to top, #dfe9f3 0%, white 100%)";
  }
}

//Unit Updates
function changeUnit(event) {
  event.preventDefault();
  let newUnit = document.querySelector(".unitConverter");
  if (newUnit.innerHTML === " |°C") {
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
  changeInnerHTML(".unitConverter", ` |°C`);
  changeInnerHTML(".minTemp", `°F`);
  changeInnerHTML(".maxTemp", `°F`);
}

function changeToCelsius() {
  changeInnerHTML(".unitConverter", ` |°F`);
  changeInnerHTML(".minTemp", `°C`);
  changeInnerHTML(".maxTemp", `°C`);
}

//Changing the display on the page
function changeInnerHTML(query, innerHTML) {
  let htmlElement = document.querySelector(query);
  htmlElement.innerHTML = innerHTML;
}

function updateWeatherEmoji(data) {
  let iconElement = document.querySelector("#weather-emoji-image");
  iconElement.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
  );
  iconElement.setAttribute("alt", data.weather[0].description);
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

function provideTime(days, hours, minutes) {
  let weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let day = weekDays[days];

  if (hours < 10) {
    hours = `0${hours}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  changeInnerHTML("#current-time", `${day}, ${hours}:${minutes}`);
}

function defaultContent() {
  axios.get(getApiUrl("Cologne")).then(updateTemperature);
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

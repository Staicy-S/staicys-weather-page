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
  updateWeatherEmoji(
    "#weather-emoji-image",
    response.data.weather[0].icon,
    response.data.weather[0].description
  );
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
  let localTime = updateToLocalTime(response.data);
  getWeatherForecast(response.data.name, localTime);
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
  var localTime = new Object();
  localTime.days = localDays;
  localTime.hours = localHours;
  localTime.minutes = localMinutes;
  provideTime(localDays, localHours, localMinutes);
  return localTime;
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

function updateWeatherEmoji(query, icon, description) {
  let iconElement = document.querySelector(query);
  iconElement.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${icon}@2x.png`
  );
  iconElement.setAttribute("alt", description);
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

function provideWeekday(number) {
  let weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return weekDays[number];
}

function provideTime(days, hours, minutes) {
  let day = provideWeekday(days);
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

function findForecastTemp(response, centralIndex) {
  let tempMin = 99;
  let tempMax = -99;
  for (let index = centralIndex - 4; index < centralIndex + 5; index++) {
    let temp = response.data.list[index].main.temp;
    // min temp
    if (temp < tempMin) {
      tempMin = temp;
    }
    if (temp > tempMax) {
      tempMax = temp;
    }
  }
  var completeTemp = new Object();
  completeTemp.tempMin = Math.round(tempMin);
  completeTemp.tempMax = Math.round(tempMax);
  return completeTemp;
}

function displayWeatherForecast(response, localTime) {
  let firstIndex = 11 - Math.floor(localTime.hours / 3);

  let completeTemp0 = findForecastTemp(response, firstIndex);
  changeInnerHTML("#temp-min-0", completeTemp0.tempMin);
  changeInnerHTML("#temp-max-0", completeTemp0.tempMax);

  let secondIndex = firstIndex + 8;
  let completeTemp1 = findForecastTemp(response, secondIndex);
  changeInnerHTML("#temp-min-1", completeTemp1.tempMin);
  changeInnerHTML("#temp-max-1", completeTemp1.tempMax);

  let thirdIndex = secondIndex + 8;
  let completeTemp2 = findForecastTemp(response, thirdIndex);
  changeInnerHTML("#temp-min-2", completeTemp2.tempMin);
  changeInnerHTML("#temp-max-2", completeTemp2.tempMax);

  let fourthIndex = thirdIndex + 8;
  let completeTemp3 = findForecastTemp(response, fourthIndex);
  changeInnerHTML("#temp-min-3", completeTemp3.tempMin);
  changeInnerHTML("#temp-max-3", completeTemp3.tempMax);

  //icon stuff
  let icon0 = response.data.list[firstIndex].weather[0].icon;
  let description0 = response.data.list[firstIndex].weather[0].description;
  updateWeatherEmoji("#forecast-0-icon", icon0, description0);

  let icon1 = response.data.list[firstIndex + 8].weather[0].icon;
  let description1 = response.data.list[firstIndex + 8].weather[0].description;
  updateWeatherEmoji("#forecast-1-icon", icon1, description1);

  let icon2 = response.data.list[firstIndex + 16].weather[0].icon;
  let description2 = response.data.list[firstIndex + 16].weather[0].description;
  updateWeatherEmoji("#forecast-2-icon", icon2, description2);

  let icon3 = response.data.list[firstIndex + 24].weather[0].icon;
  let description3 = response.data.list[firstIndex + 24].weather[0].description;
  updateWeatherEmoji("#forecast-3-icon", icon3, description3);

  //update forecast day
  let localDays = localTime.days;
  let tomorrow = provideWeekday((localDays + 1) % 7);
  let day3 = provideWeekday((localDays + 2) % 7);
  let day4 = provideWeekday((localDays + 3) % 7);
  let day5 = provideWeekday((localDays + 4) % 7);
  //changeInnerHTML("#forecast-day-0", today);
  changeInnerHTML("#forecast-day-0", tomorrow);
  changeInnerHTML("#forecast-day-1", day3);
  changeInnerHTML("#forecast-day-2", day4);
  changeInnerHTML("#forecast-day-3", day5);
}

function getWeatherForecast(city, localTime) {
  let apiKey = "ec993fa98c77b985fc9c225a40d800db";
  let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&&units=metric`;
  axios.get(apiUrl).then(function (response) {
    displayWeatherForecast(response, localTime);
  });
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

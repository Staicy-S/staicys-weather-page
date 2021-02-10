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
  } else {
    changeToFahrenheit();
  }
}

function changeElementToCelsius(element) {
  let temp = element.innerHTML;
  element.innerHTML = Math.round(((temp - 32) * 5) / 9);
}

function changeElementToFahrenheit(element) {
  let temp = element.innerHTML;
  element.innerHTML = Math.round(1.8 * temp + 32);
}

function changeToFahrenheit() {
  changeInnerHTML(".unitConverter", ` |°C`);

  var allTemps = document.querySelectorAll(".allTemp");
  for (let index = 0; index < allTemps.length; index++) {
    changeElementToFahrenheit(allTemps[index]);
  }

  var allUnits = document.querySelectorAll(".allUnits");
  for (let index = 0; index < allUnits.length; index++) {
    allUnits[index].innerHTML = `°F`;
  }
}

function changeToCelsius() {
  changeInnerHTML(".unitConverter", ` |°F`);

  var allTemps = document.querySelectorAll(".allTemp");
  for (let index = 0; index < allTemps.length; index++) {
    changeElementToCelsius(allTemps[index]);
  }

  var allUnits = document.querySelectorAll(".allUnits");
  for (let index = 0; index < allUnits.length; index++) {
    allUnits[index].innerHTML = `°C`;
  }
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

function findForecastTemp(weatherList, centralIndex) {
  let tempMin = 99;
  let tempMax = -99;
  for (let index = centralIndex - 4; index < centralIndex + 5; index++) {
    let temp = weatherList[index].main.temp;
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
  let weatherList = response.data.list;
  let firstIndex = 11 - Math.floor(localTime.hours / 3);

  let completeTemp0 = findForecastTemp(weatherList, firstIndex);
  changeInnerHTML("#temp-min-0", completeTemp0.tempMin);
  changeInnerHTML("#temp-max-0", completeTemp0.tempMax);

  let secondIndex = firstIndex + 8;
  let completeTemp1 = findForecastTemp(weatherList, secondIndex);
  changeInnerHTML("#temp-min-1", completeTemp1.tempMin);
  changeInnerHTML("#temp-max-1", completeTemp1.tempMax);

  let thirdIndex = secondIndex + 8;
  let completeTemp2 = findForecastTemp(weatherList, thirdIndex);
  changeInnerHTML("#temp-min-2", completeTemp2.tempMin);
  changeInnerHTML("#temp-max-2", completeTemp2.tempMax);

  let fourthIndex = thirdIndex + 8;
  let completeTemp3 = findForecastTemp(weatherList, fourthIndex);
  changeInnerHTML("#temp-min-3", completeTemp3.tempMin);
  changeInnerHTML("#temp-max-3", completeTemp3.tempMax);

  updateWeatherEmoji(
    "#forecast-0-icon",
    weatherList[firstIndex].weather[0].icon,
    weatherList[firstIndex].weather[0].description
  );

  updateWeatherEmoji(
    "#forecast-1-icon",
    weatherList[firstIndex + 8].weather[0].icon,
    weatherList[firstIndex + 8].weather[0].description
  );

  updateWeatherEmoji(
    "#forecast-2-icon",
    weatherList[firstIndex + 16].weather[0].icon,
    weatherList[firstIndex + 16].weather[0].description
  );

  updateWeatherEmoji(
    "#forecast-3-icon",
    weatherList[firstIndex + 24].weather[0].icon,
    weatherList[firstIndex + 24].weather[0].description
  );

  //update forecast day
  let localDays = localTime.days;
  changeInnerHTML("#forecast-day-0", provideWeekday((localDays + 1) % 7));
  changeInnerHTML("#forecast-day-1", provideWeekday((localDays + 2) % 7));
  changeInnerHTML("#forecast-day-2", provideWeekday((localDays + 3) % 7));
  changeInnerHTML("#forecast-day-3", provideWeekday((localDays + 4) % 7));
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

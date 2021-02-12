//Main function covering three possible cases. Getting a city either from the search bar, the gps button, or not knowing the searched city.
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

//creates the api url for the weather of the desired city
function getApiUrl(city) {
  let apiKey = "ec993fa98c77b985fc9c225a40d800db";
  return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&&units=metric`;
}

//updates the information on the page depending on the origin - gps button or search bar
function updateTemperature(response, origin) {
  changeToCelsius(); //resets the unit to celsius to avoid steadily increasing temperatures
  displayTemperature(response.data); //displays the temperature of today
  updateWeatherIcon(
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
  updateWeatherDetails(response.data);
  document.querySelector("#search-engine").value = ""; //empties the searchbar
  let localTime = updateToLocalTime(response.data);
  //uses the city and localtime to provide a daily weatherforecast
  getWeatherForecast(response.data.name, localTime);
}

//calculation to get the local time of the place searched
function updateToLocalTime(data) {
  //getting the UTC time and date
  let localDate = new Date();
  let utcDate = localDate.getUTCDate();
  let utcHours = localDate.getUTCHours();
  let utcMinutes = localDate.getUTCMinutes();
  //using the timezone offset of the searched city to find its actual time
  let offset = data.timezone;

  //calculating the local day and time of the searched place
  let minutesToAdd = (offset / 60) % 60;
  let hourCarryOver = Math.floor((utcMinutes + minutesToAdd) / 60);
  let hoursToAdd = Math.floor(offset / 60 / 60);
  let daysCarryOver = Math.floor((utcHours + hoursToAdd) / 24);
  let localMinutes = (utcMinutes + minutesToAdd) % 60;
  let localHours = (utcHours + hoursToAdd + hourCarryOver + 24) % 24;
  let localDays = (utcDate + daysCarryOver) % 7;
  //defining an object to return several information to be later used by getWeatherForecast()
  var localTime = new Object();
  localTime.days = localDays;
  localTime.hours = localHours;
  localTime.minutes = localMinutes;
  provideTime(localDays, localHours, localMinutes);
  return localTime;
}

//displays the temperatures of today
function displayTemperature(data) {
  changeInnerHTML(".minTempNumber", Math.round(data.main.temp_min));
  changeInnerHTML(".maxTempNumber", Math.round(data.main.temp_max));
  let temp = Math.round(data.main.temp);
  //depending on the temperature the background gradient of the box is changed
  if (temp > 20) {
    document.getElementById("gradient").style.backgroundImage =
      "linear-gradient(to top, #feada6 0%, #f5efef 100%)";
  } else if (temp < 10) {
    document.getElementById("gradient").style.backgroundImage =
      "linear-gradient(to top, #5ee7df 0%, #b490ca 100%)";
  } else {
    document.getElementById("gradient").style.backgroundImage =
      "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)";
  }
}

//updating the units
function changeUnit(event) {
  event.preventDefault();
  let newUnit = document.querySelector(".unitConverter");
  //differentiate between which function needs to be called - transformation to celsius or fahrenheit
  //avoids steadily rising temperatures
  if (newUnit.innerHTML === " |°C") {
    changeToCelsius();
  } else {
    changeToFahrenheit();
  }
}

//calculating the temperature to celcius
function changeElementToCelsius(element) {
  let temp = element.innerHTML;
  element.innerHTML = Math.round(((temp - 32) * 5) / 9);
}

//calculating the temperature to fahrenheit
function changeElementToFahrenheit(element) {
  let temp = element.innerHTML;
  element.innerHTML = Math.round(1.8 * temp + 32);
}

//changes all units to fahrenheit
function changeToFahrenheit() {
  changeInnerHTML(".unitConverter", ` |°C`);

  var allTemps = document.querySelectorAll(".allTemp");
  //calls function to calculate all temperatures in fahrenheit
  for (let index = 0; index < allTemps.length; index++) {
    changeElementToFahrenheit(allTemps[index]);
  }

  var allUnits = document.querySelectorAll(".allUnits");
  for (let index = 0; index < allUnits.length; index++) {
    allUnits[index].innerHTML = `°F`;
  }
}

//changes all units (back) to celsius
function changeToCelsius() {
  changeInnerHTML(".unitConverter", ` |°F`);

  var allTemps = document.querySelectorAll(".allTemp");
  //calls function to calculate all temperatures in celsius
  for (let index = 0; index < allTemps.length; index++) {
    changeElementToCelsius(allTemps[index]);
  }

  var allUnits = document.querySelectorAll(".allUnits");
  for (let index = 0; index < allUnits.length; index++) {
    allUnits[index].innerHTML = `°C`;
  }
}

//assigns the correct weather icon to the weather condition
function updateWeatherIcon(query, icon, description) {
  let iconElement = document.querySelector(query);
  iconElement.setAttribute(
    "src",
    `http://openweathermap.org/img/wn/${icon}@2x.png`
  );
  iconElement.setAttribute("alt", description);
}

//displaying further weather details on the page
function updateWeatherDetails(data) {
  changeInnerHTML("#description", data.weather[0].description);
  changeInnerHTML("#wind-speed", Math.round(data.wind.speed));
  changeInnerHTML("#feels-like", Math.round(data.main.feels_like));
  //displaying a warning sign for high wind speeds
  let windSpeed = data.wind.speed;
  if (windSpeed > 39) {
    document.querySelector(".warning").className =
      "fas fa-exclamation-triangle";
  }
}

//GPS Weather
function handlePositionClick() {
  navigator.geolocation.getCurrentPosition(getWeatherForGps);
}

//getting the information for the gps weather
function getWeatherForGps(position) {
  axios.get(buildGpsApiUrl(position)).then(function (response) {
    updateTemperature(response, "gps");
  });
}

//builds the api url for the gps weather depending on the location of the user
function buildGpsApiUrl(position) {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;
  let apiKey = "ec993fa98c77b985fc9c225a40d800db";
  return `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&&units=metric`;
}

//transforming the number of the given day to an actual weekday
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

//displaying the time and day correctly
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

//finding the minimum and maximum temperature of a given day
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
  //creating an object containing the results of the minimum and maximum temperature
  var completeTemp = new Object();
  completeTemp.tempMin = Math.round(tempMin);
  completeTemp.tempMax = Math.round(tempMax);
  return completeTemp;
}

//gets the weather forecast at 12 o clock for the next days
function displayWeatherForecast(response, localTime) {
  let weatherList = response.data.list;
  //calculates where to start the forecast to start at the next day at 12 o clock
  let firstIndex = 11 - Math.floor(localTime.hours / 3);

  let completeTemp0 = findForecastTemp(weatherList, firstIndex);
  changeInnerHTML("#temp-min-0", completeTemp0.tempMin);
  changeInnerHTML("#temp-max-0", completeTemp0.tempMax);

  //+8 because it skips 24 hours to the subsequent day at 12 o clock
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

  //uses the previously found information to update the forecast icon and an emergency in case the images do not load
  updateWeatherIcon(
    "#forecast-0-icon",
    weatherList[firstIndex].weather[0].icon,
    weatherList[firstIndex].weather[0].description
  );

  updateWeatherIcon(
    "#forecast-1-icon",
    weatherList[firstIndex + 8].weather[0].icon,
    weatherList[firstIndex + 8].weather[0].description
  );

  updateWeatherIcon(
    "#forecast-2-icon",
    weatherList[firstIndex + 16].weather[0].icon,
    weatherList[firstIndex + 16].weather[0].description
  );

  updateWeatherIcon(
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

//uses the city and localtime to provide a daily weatherforecast
function getWeatherForecast(city, localTime) {
  let apiKey = "ec993fa98c77b985fc9c225a40d800db";
  let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&&units=metric`;
  axios.get(apiUrl).then(function (response) {
    displayWeatherForecast(response, localTime);
  });
}

//Changing the display on the page
function changeInnerHTML(query, innerHTML) {
  let htmlElement = document.querySelector(query);
  htmlElement.innerHTML = innerHTML;
}

//on load default city
function defaultContent() {
  axios.get(getApiUrl("Cologne")).then(updateTemperature);
}

//on load default city
defaultContent();

//reacting to events on the page
//when clicking on the search button
document
  .querySelector(".searchButton")
  .addEventListener("click", mainUpdateEverything);

//when clicking on the unit converter (°F or °C)
document.querySelector(".unitConverter").addEventListener("click", changeUnit);

//when clicking on the gps button
document
  .querySelector(".gpsButton")
  .addEventListener("click", handlePositionClick);

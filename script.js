/* ================================
   DOM Element Selectors
   ================================ */
const cityInput = document.querySelector('.city-input'); 
// Ye user ka city name lene ke liye hai. Input field me jo user type karega.

const searchBtn = document.querySelector('.search-btn'); 
// Search button select kiya, click hone par weather fetch hoga

/* Sections: weather info, not found, aur search city message */
const weatherInfoSection = document.querySelector('.weather-info'); 
const notFoundSection = document.querySelector('.not-found'); 
const searchCitySection = document.querySelector('.search-city'); 
// JS me in sections ko show/hide karenge

/* Loading Spinner */
const loadingDiv = document.querySelector('.loading'); 
// Data fetch hone tak spinner dikhayege

/* Specific fields to update weather info dynamically */
const countryTxt = document.querySelector('.country-txt'); 
const tempTxt = document.querySelector('.temp-txt'); 
const conditionTxt = document.querySelector('.condition-txt'); 
const humidityValueTxt = document.querySelector('.humidity-value-txt'); 
const windValueTxt = document.querySelector('.wind-value-txt'); 
const weatherSummaryImg = document.querySelector('.weather-summary-img'); 
const currentDateTxt = document.querySelector('.current-date-txt'); 
const forecastContainer = document.querySelector('.forecast-items-container'); 
const mainContainer = document.querySelector('.main-container'); 
// forecastContainer → forecast cards dynamically add karenge
// mainContainer → background change karenge according to weather

/* API Key */
const apiKey = "63be8d791ee20131d0123c20eb7aa8bd"; 
// OpenWeatherMap API key

/* ================================
   Event Listeners
   ================================ */
searchBtn.addEventListener('click', () => searchCity()); 
// Search button click hone par searchCity() function call hoga.

cityInput.addEventListener('keydown', (e) => { 
  if(e.key==='Enter') searchCity(); 
}); 
// Enter key press hone par bhi same function call hota hai.

/* ================================
   Functions
   ================================ */

/* Function to search weather for the city */
async function searchCity(){ 
  const city = cityInput.value.trim(); 
  // Input value le raha hai aur extra spaces remove kar raha hai.

  if(!city) return; 
  // Agar input empty hai → function wapas return kar deta hai.
  
  cityInput.value=''; 
  // Input field clear kar diya.

  showLoading(true);  
  // Spinner show kar diya

  await updateWeatherInfo(city); 
  // Weather API call aur DOM update await karte hain.

  showLoading(false); 
  // API call ke baad spinner hide kar diya
}

/* Function to show/hide loading spinner */
function showLoading(show){
  loadingDiv.style.display = show ? 'block' : 'none';  
  // show=true → spinner visible & show=false → spinner hide
}

/* Function to fetch data from OpenWeatherMap API */
async function getFetchData(endPoint, city){ 
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`; 
  // API URL prepare ki, metric units me temperature

  const res = await fetch(apiUrl); 
  // API call ki

  return res.json(); 
  // Response ko JSON me convert karke return kiya
}

/* Function to get weather icon based on weather ID */
function getWeatherIcon(id){ 
  if (id <= 232) return 'thunderstorm.svg';
  if (id <= 321) return 'drizzle.svg';
  if (id <= 531) return 'rain.svg';
  if (id <= 622) return 'snow.svg';
  if (id <= 781) return 'atmosphere.svg';
  if (id === 800) return 'clear.svg';
  return 'clouds.svg';
}

/* Function to change background gradient according to weather type */
function setBackgroundByWeather(id){ 
  if(id<=232) mainContainer.style.background='linear-gradient(to top,#4e54c8,#8f94fb)'; // thunderstorm
  else if(id<=321) mainContainer.style.background='linear-gradient(to top,#89f7fe,#66a6ff)'; // drizzle
  else if(id<=531) mainContainer.style.background='linear-gradient(to top,#00c6fb,#005bea)'; // rain
  else if(id<=622) mainContainer.style.background='linear-gradient(to top,#e0eafc,#cfdef3)'; // snow
  else if(id<=781) mainContainer.style.background='linear-gradient(to top,#757f9a,#d7dde8)'; // atmosphere
  else if(id===800) mainContainer.style.background='linear-gradient(to top,#fddb92,#d1fdff)'; // clear
  else mainContainer.style.background='linear-gradient(to top,#bdc3c7,#2c3e50)'; // clouds
}

/* Function to get current date in Wed, 30 Aug format */
function getCurrentDate(){ 
  return new Date().toLocaleDateString('en-US',{ weekday:'short', day:'2-digit', month:'short'});
}

/* Function to fetch and update weather info in DOM */
async function updateWeatherInfo(city){  
  const data = await getFetchData('weather', city); 
  // Weather data fetch kiya API se

  if(data.cod!=200){ 
    showDisplaySection(notFoundSection); 
    return; 
  } 
  // Agar city invalid → Not Found section show kar do


  /* Update DOM elements with fetched data */
  countryTxt.textContent = data.name; // set city name
  tempTxt.textContent = Math.round(data.main.temp)+'°C'; // set temperature rounded + °C
  conditionTxt.textContent = data.weather[0].main; // set weather condition (e.g., Clouds)
  humidityValueTxt.textContent = data.main.humidity+'%'; // set humidity value
  windValueTxt.textContent = data.wind.speed+' M/s'; // set wind speed
  currentDateTxt.textContent = getCurrentDate(); // set current date in desired format
  weatherSummaryImg.src = `assets/weather/${getWeatherIcon(data.weather[0].id)}`; // set weather icon
  setBackgroundByWeather(data.weather[0].id); // change main container background based on weather
  
  /* Show weather info section with fade-in */
  showDisplaySection(weatherInfoSection); // show only weather info section
  weatherInfoSection.classList.add('show'); // add class for fade-in animation
  
  /* ================================
     Forecast
     ================================ */
  const forecastData = await getFetchData('forecast', city); // fetch 5-day forecast data
  forecastContainer.innerHTML = ''; // clear previous forecast cards
  
  const forecasts = []; // array to store unique forecasts
  const addedDates = new Set(); // set to keep track of unique dates
  
  for(const item of forecastData.list){ // loop through each 3-hour forecast
    const date = new Date(item.dt*1000); // convert timestamp to Date
    const dateStr = date.toLocaleDateString('en-US',{day:'2-digit',month:'short'}); // format date like "30 Aug"
    
    if(!addedDates.has(dateStr)){ // if this date not already added
      forecasts.push(item); // add forecast to array
      addedDates.add(dateStr); // mark date as added
    }
    
    if(forecasts.length >= 4) break; // stop after 4 unique days
    // Hum 4 unique days ka forecast le rahe hain
  }


  
  /* Create forecast cards dynamically */
  forecasts.forEach(f=>{ // loop over each forecast item
    const date = new Date(f.dt*1000); // convert timestamp to Date
    const dateStr = date.toLocaleDateString('en-US',{day:'2-digit',month:'short'}); // format date like "30 Aug"
    const temp = Math.round(f.main.temp); // round temperature
    const icon = getWeatherIcon(f.weather[0].id); // get weather icon based on id
  
    const forecastItem = document.createElement('div'); // create div for forecast card
    forecastItem.classList.add('forecast-item'); // add CSS class
    forecastItem.innerHTML = `<h5 class="forecast-item-date regular-text">${dateStr}</h5>
      <img src="assets/weather/${icon}" class="forecast-item-img">
      <h5 class="forecast-item-temp">${temp}°C</h5>`; // set inner HTML with date, icon, temp
  
    forecastContainer.appendChild(forecastItem); // add forecast card to container
  });
  
  }


/* Function to show only requested section and hide others */
function showDisplaySection(section){ // function to toggle visible section
  [weatherInfoSection, searchCitySection, notFoundSection].forEach(sec=>sec.style.display='none'); // hide all sections
  section.style.display='flex'; // show only requested section
}




// Weather App JS Flowchart (Step-wise) ::

// Weather App JS Step-by-Step Flow (Text Form)
// Page Load
// User opens the weather app page.
// Input field (.city-input) and search button (.search-btn) visible.
// Weather info section, Not Found section, and Search City message section ready but hidden.
// User Input
// User types city name in input field.
// User clicks search button OR presses Enter key.
// Trigger searchCity() Function
// searchCity() function is called.
// Input value is trimmed (cityInput.value.trim()) to remove extra spaces.
// If input is empty → function exits.
// Input field is cleared (cityInput.value='').
// Loading spinner is shown (showLoading(true)).
// Fetch Current Weather Data
// updateWeatherInfo(city) is called.
// getFetchData('weather', city) makes API call to OpenWeatherMap for current weather.
// If API response cod != 200 → show Not Found section → exit.
// Else → continue.
// Update DOM with Weather Data
// countryTxt.textContent ← city name from API.
// tempTxt.textContent ← temperature (rounded) + "°C".
// conditionTxt.textContent ← weather condition (Clouds, Rain, etc.).
// humidityValueTxt.textContent ← humidity %.
// windValueTxt.textContent ← wind speed in M/s.
// currentDateTxt.textContent ← current date (getCurrentDate()).
// weatherSummaryImg.src ← icon based on weather ID (getWeatherIcon(data.weather[0].id)).
// setBackgroundByWeather(data.weather[0].id) → change background gradient dynamically.
// Show Weather Info Section
// showDisplaySection(weatherInfoSection) → only weather info section visible.
// Add class .show for fade-in effect.
// Fetch Forecast Data
// getFetchData('forecast', city) → API call for 5-day forecast, 3-hour interval.
// Previous forecast cards cleared (forecastContainer.innerHTML='').
// Prepare Forecast Data
// Initialize forecasts = [] array.
// Initialize addedDates = new Set() to store unique dates.
// Loop through forecastData.list:
// Convert timestamp to date object.
// Format date as "dd MMM".
// If date not in addedDates:
// Add forecast item to forecasts.
// Add date to addedDates.
// Stop after 4 unique dates.
// Create Forecast Cards Dynamically
// For each forecast in forecasts:
// Create a div element .forecast-item.
// Set innerHTML with:
// Date
// Weather icon (getWeatherIcon())
// Temperature (rounded °C)
// Append forecast card to forecastContainer.
// Hide Loading Spinner
// showLoading(false) → hide spinner after all data is loaded and DOM updated.
// Section Management Function
// showDisplaySection(section) hides all 3 sections (weatherInfoSection, searchCitySection, notFoundSection) first.
// Only the requested section (section) is displayed.
// Weather Icon Logic (getWeatherIcon(id))
// Weather ID ranges map to icons:
// 200–232 → thunderstorm.svg
// 300–321 → drizzle.svg
// 500–531 → rain.svg
// 600–622 → snow.svg
// 701–781 → atmosphere.svg
// 800 → clear.svg
// Default → clouds.svg
// Background Change Logic (setBackgroundByWeather(id))
// Weather ID ranges map to gradient backgrounds:
// 200–232 → purple gradient
// 300–321 → blue gradient
// 500–531 → dark blue gradient
// 600–622 → light blue gradient
// 701–781 → grey gradient
// 800 → sunny gradient
// Default → cloud gradient
// End of Flow
// Weather app displays current weather + 4-day forecast.
// Spinner hidden.
// Appropriate section visible.



// WORKING FLOW CHART :

// +-----------------------+
// |   Page Load           |
// | - Input field visible |
// | - Sections hidden     |
// +-----------------------+
//             |
//             v
// +-----------------------+
// | User enters city name |
// | - Types in input      |
// | - Clicks search OR    |
// |   presses Enter       |
// +-----------------------+
//             |
//             v
// +-----------------------+
// | searchCity() function |
// | - Trim input          |
// | - If empty → exit     |
// | - Clear input field   |
// | - Show loading spinner|
// +-----------------------+
//             |
//             v
// +-----------------------+
// | Fetch current weather |
// | - getFetchData('weather', city) |
// | - API call            |
// | - If cod!=200 → Not Found |
// +-----------------------+
//             |
//             v
// +-------------------------------+
// | Update DOM with weather data  |
// | - city, temp, condition       |
// | - humidity, wind              |
// | - current date                |
// | - icon & background           |
// +-------------------------------+
//             |
//             v
// +-------------------------------+
// | Show weather info section     |
// | - showDisplaySection(weatherInfoSection) |
// | - Add .show class for fade-in |
// +-------------------------------+
//             |
//             v
// +-------------------------------+
// | Fetch forecast data           |
// | - getFetchData('forecast', city) |
// | - Clear previous forecast     |
// +-------------------------------+
//             |
//             v
// +-------------------------------+
// | Prepare forecast data         |
// | - Initialize forecasts array  |
// | - Initialize addedDates set   |
// | - Loop through forecast list  |
// |   - Convert timestamp to date |
// |   - Format date               |
// |   - Add unique dates only     |
// | - Stop after 4 unique dates   |
// +-------------------------------+
//             |
//             v
// +-------------------------------+
// | Create forecast cards         |
// | - For each forecast:          |
// |   - Create div.forecast-item  |
// |   - Set date, icon, temp      |
// |   - Append to forecastContainer |
// +-------------------------------+
//             |
//             v
// +-------------------------------+
// | Hide loading spinner          |
// | - showLoading(false)          |
// +-------------------------------+
//             |
//             v
// +-------------------------------+
// | Section Management            |
// | - showDisplaySection(section) |
// | - Hide other sections         |
// +-------------------------------+
//             |
//             v
// +-------------------------------+
// | Weather Icons & Background    |
// | - getWeatherIcon(id)          |
// | - setBackgroundByWeather(id)  |
// +-------------------------------+
//             |
//             v
// +-------------------------------+
// | End Flow                       |
// | - Weather info + forecast      |
// | - Spinner hidden               |
// | - Appropriate section visible |
// +-------------------------------+

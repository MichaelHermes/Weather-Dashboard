const currentWeatherRequestUrl =
	"https://api.openweathermap.org/data/2.5/weather";
const oneCallAPIRequestUrl = "https://api.openweathermap.org/data/2.5/onecall";
const APIKey = "89b52cb1c296e2d8fed4b1b377ceb088";
const weatherIconUrl = "http://openweathermap.org/img/wn/{icon}.png";
const searchHistoryStorageKey = "WeatherDashboard-SearchHistory";

const testWeatherData = {
	Today: {
		Name: "Seattle",
		Date: "7/22/2021",
		IconUrl: weatherIconUrl.replace("{icon}", "01d"),
		Temperature: 74.01,
		Wind: 6.67,
		Humidity: 46,
		UVIndex: 0.47,
	},
	Forecast: [
		{
			Date: "7/23/2021",
			IconUrl: weatherIconUrl.replace("{icon}", "09d"),
			Temperature: 73.72,
			Wind: 9.53,
			Humidity: 66,
		},
		{
			Date: "7/24/2021",
			IconUrl: weatherIconUrl.replace("{icon}", "09d"),
			Temperature: 73.72,
			Wind: 9.53,
			Humidity: 66,
		},
		{
			Date: "7/25/2021",
			IconUrl: weatherIconUrl.replace("{icon}", "09d"),
			Temperature: 73.72,
			Wind: 9.53,
			Humidity: 66,
		},
		{
			Date: "7/26/2021",
			IconUrl: weatherIconUrl.replace("{icon}", "09d"),
			Temperature: 73.72,
			Wind: 9.53,
			Humidity: 66,
		},
		{
			Date: "7/27/2021",
			IconUrl: weatherIconUrl.replace("{icon}", "09d"),
			Temperature: 73.72,
			Wind: 9.53,
			Humidity: 66,
		},
	],
};

let searchHistoryList = $("#search-history");
let currentCity;

// Initialize the application on page load. This will populate persistent search history and start off with a query for Seattle weather by default.
function initialize() {
	generateSearchHistoryItems();

	displayWeather(testWeatherData);
	//queryCurrentWeather("Seattle");
}

// Retrieve search history from localStorage and populate the search history.
function generateSearchHistoryItems() {
	let searchHistory = JSON.parse(localStorage.getItem(searchHistoryStorageKey));
	if (typeof searchHistory !== "undefined" && searchHistory !== null) {
		searchHistory.forEach(citySearch => {
			searchHistoryList.append(
				$("<li>")
					.text(citySearch.Name)
					.addClass("btn w-100 mb-2 city-btn")
					.attr({
						"data-latitude": citySearch.Latitude,
						"data-longitude": citySearch.Longitude,
					})
			);
		});
	}
}

// The handler for the "Search" button. Obtains the city name input and begins the query for current weather.
function searchCityWeather(event) {
	event.preventDefault();

	let cityInputEl = $("#city-input");
	let cityInputVal = cityInputEl.val();
	// Make sure they entered a city value.
	if (!cityInputVal) {
		alert("A city input is required!");
		return;
	}
	// Clear the input after "Search" is clicked.
	cityInputEl.val("");
	// Kick-off the weather retrieval process using the supplied city name.
	queryCurrentWeather(cityInputVal);
}

// Query the OneWeather API for current weather in the target city. On success, follow-up with the weather forecast API query.
function queryCurrentWeather(cityInputVal) {
	let requestQueryURL = `${currentWeatherRequestUrl}?q=${cityInputVal}&appid=${APIKey}&units=imperial`;

	// Query the API and handle the response.
	fetch(requestQueryURL)
		.then(response => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then(data => {
			queryForecastWeather(data.name, data.coord.lat, data.coord.lon);
		})
		.catch(error => {
			console.error(
				"There has been a problem with the fetch operation: ",
				error
			);
		});
}

// Query the OneWeather API for daily forecast information. On success, populate the weather display on-screen.
function queryForecastWeather(cityName, latitude, longitude) {
	let requestQueryURL = `${oneCallAPIRequestUrl}?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${APIKey}&units=imperial`;
	let oneCallWeather;

	// Query the API and handle the response.
	fetch(requestQueryURL)
		.then(response => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then(data => {
			// Build an object that contains all the weather data necessary for display.
			oneCallWeather = {
				Today: {
					Name: cityName,
					Date: moment.unix(data.current.dt).format("M/D/YYYY"),
					IconUrl: weatherIconUrl.replace(
						"{icon}",
						data.current.weather[0].icon
					),
					Temperature: data.current.temp,
					Wind: data.current.wind_speed,
					Humidity: data.current.humidity,
					UVIndex: data.current.uvi,
				},
				Forecast: [],
			};
			// Loop through the daily results to build the forecast details.
			for (let index = 1; index < 6; index++) {
				let dailyForecast = {
					Date: moment.unix(data.daily[index].dt).format("M/D/YYYY"),
					IconUrl: weatherIconUrl.replace(
						"{icon}",
						data.daily[index].weather[0].icon
					),
					Temperature: data.daily[index].temp.max,
					Wind: data.daily[index].wind_speed,
					Humidity: data.daily[index].humidity,
				};
				oneCallWeather.Forecast.push(dailyForecast);
			}

			// Set the current city Name, Lat & Lon into localStorage to be recalled later.
			updateSearchHistory(oneCallWeather.Today.Name, latitude, longitude);

			// Update the UI with current weather and forecast.
			displayWeather(oneCallWeather);
		})
		.catch(error => {
			console.error(
				"There has been a problem with the fetch operation: ",
				error
			);
		});
}

// Updates the search history results both on-screen and in localStorage.
function updateSearchHistory(name, latitude, longitude) {
	// Prepend a new search history item to the top of the list.
	searchHistoryList.prepend(
		$("<li>").text(name).addClass("btn w-100 mb-2 city-btn").attr({
			"data-latitude": latitude,
			"data-longitude": longitude,
		})
	);

	// Persist this city search into localStorage.
	let searchHistory = JSON.parse(localStorage.getItem(searchHistoryStorageKey));
	let currentCitySearch = {
		Name: name,
		Latitude: latitude,
		Longitude: longitude,
	};
	if (typeof searchHistory === "undefined" || searchHistory === null) {
		searchHistory = [currentCitySearch];
	} else {
		for (let index = 0; index < searchHistory.length; index++) {
			// Remove any stored city searches that match the current city being searched.
			if (searchHistory[index].Name === name) {
				searchHistory.splice(index, 1);
			}
		}
		// Add the current city search to the top of the stored searches.
		searchHistory.unshift(currentCitySearch);
	}
	localStorage.setItem(searchHistoryStorageKey, JSON.stringify(searchHistory));
}

// Updates the UI with the weather details obtained for the target city.
function displayWeather(oneCallWeather) {
	// Update the current weather
	let currentWeatherEl = $("#current-weather");
	// Before adding the new current weather elements, remove any existing ones first.
	currentWeatherEl.children().remove();
	// Append the new current weather details.
	currentWeatherEl
		.append(
			$("<li>").append(
				$("<div>")
					.append(
						$("<h2>").text(
							`${oneCallWeather.Today.Name} (${oneCallWeather.Today.Date})`
						)
					)
					.append(
						$("<img>").attr({
							src: oneCallWeather.Today.IconUrl,
							alt: "Weather Icon",
						})
					)
			)
		)
		.append(
			$("<li>").html(`<b>Temp:</b> ${oneCallWeather.Today.Temperature} \u00B0F`)
		)
		.append($("<li>").html(`<b>Wind:</b> ${oneCallWeather.Today.Wind} MPH`))
		.append(
			$("<li>").html(`<b>Humidity:</b> ${oneCallWeather.Today.Humidity} %`)
		)
		.append(
			$("<li>").html(
				`<b>UV Index:</b> <span class="uv-index">${oneCallWeather.Today.UVIndex}</span>`
			)
		);

	// Update the 5-day forecast, one day at a time.
	for (let index = 0; index < oneCallWeather.Forecast.length; index++) {
		const dailyForecast = oneCallWeather.Forecast[index];
		const forecastEl = $(`.forecast[data-day=${index + 1}]`);
		// Before adding any new forecast elements, remove any existing ones first.
		forecastEl.children().remove();
		// Append the new forecast details.
		forecastEl.append(
			$("<ul>")
				.append($("<li>").append($("<h4>").text(`${dailyForecast.Date}`)))
				.append(
					$("<li>").append(
						$("<img>").attr({ src: dailyForecast.IconUrl, alt: "Weather Icon" })
					)
				)
				.append(
					$("<li>").html(`<b>Temp:</b> ${dailyForecast.Temperature} \u00B0F`)
				)
				.append($("<li>").html(`<b>Wind:</b> ${dailyForecast.Wind} MPH`))
				.append($("<li>").html(`<b>Humidity:</b> ${dailyForecast.Humidity} %`))
		);
	}

	currentCity = oneCallWeather.Today.Name;
}

// Click handler for search history items.
searchHistoryList.on("click", "li", event => {
	let itemClicked = $(event.target);
	// Only remove the search history button and re-query the weather if a different city is selected or an item other than the top search history item is clicked.
	if (
		itemClicked.text() !== searchHistoryList.children().first().text() ||
		itemClicked.text() !== currentCity
	) {
		// Remove the clicked search history item. It will be added back to the top of the search history list when the 'queryForecastWeather' finishes.
		itemClicked.remove();
		// Kick-off a query to get the weather information for the requested city's Lat/lon.
		queryForecastWeather(
			itemClicked.text(),
			itemClicked.attr("data-latitude"),
			itemClicked.attr("data-longitude")
		);
	} else {
		console.log("First item clicked!");
	}
});

// Click handler for Clear History button.
$("#clear-btn").on("click", () => {
	localStorage.removeItem(searchHistoryStorageKey);
	searchHistoryList.children().remove();
});

// Submit handler for the Search button.
$("#city-search-form").on("submit", searchCityWeather);
initialize();

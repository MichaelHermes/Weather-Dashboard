const currentWeatherRequestUrl =
	"https://api.openweathermap.org/data/2.5/weather";
const oneCallAPIRequestUrl = "https://api.openweathermap.org/data/2.5/onecall";
const APIKey = "89b52cb1c296e2d8fed4b1b377ceb088";
const weatherIconUrl = "http://openweathermap.org/img/wn/{icon}@2x.png";

let searchHistoryList = $("#search-history");

function generateSearchHistoryBtns() {
	searchHistoryList.append(
		$("<li>").text("Austin").addClass("btn w-100 mb-2 city-btn")
	);
	searchHistoryList.append(
		$("<li>").text("Chicago").addClass("btn w-100 mb-2 city-btn")
	);
	searchHistoryList.append(
		$("<li>").text("New York").addClass("btn w-100 mb-2 city-btn")
	);
	searchHistoryList.append(
		$("<li>").text("Orlando").addClass("btn w-100 mb-2 city-btn")
	);
}

function searchCityWeather(event) {
	event.preventDefault();

	let cityInputVal = $("#city-input").val();

	// Make sure they entered a city value.
	if (!cityInputVal) {
		alert("A city input is required!");
		return;
	}

	queryCurrentWeather(cityInputVal);
}

function queryCurrentWeather(cityInputVal) {
	let requestQueryURL = `${currentWeatherRequestUrl}?q=${cityInputVal}&appid=${APIKey}&units=imperial`;

	fetch(requestQueryURL)
		.then(response => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then(data => {
			console.log(data);
			queryForecastWeather(data.name, data.coord.lat, data.coord.lon);
		})
		.catch(error => {
			console.error(
				"There has been a problem with the fetch operation: ",
				error
			);
		});
}

function queryForecastWeather(cityName, latitude, longitude) {
	let requestQueryURL = `${oneCallAPIRequestUrl}?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=${APIKey}&units=imperial`;
	let oneCallWeather;

	fetch(requestQueryURL)
		.then(response => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then(data => {
			console.log(data);
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
			console.log(oneCallWeather);

			// TODO: Set the current city Name, Lat & Lon into localStorage to be recalled later.
			// TODO: Update the UI with weather information.
		})
		.catch(error => {
			console.error(
				"There has been a problem with the fetch operation: ",
				error
			);
		});
}

generateSearchHistoryBtns();

$("#city-search-form").on("submit", searchCityWeather);

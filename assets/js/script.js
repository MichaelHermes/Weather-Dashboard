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

			// TODO: Use the Latitude/Longitude data values to query the daily weather forecast.
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

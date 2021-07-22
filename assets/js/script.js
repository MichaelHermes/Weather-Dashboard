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

generateSearchHistoryBtns();


// development, set to http://localhost:8080, for production, leave empty
//  need to use to redirect to port 8080 since dev server runs on 5173 and cant bind to both during dev
const production = false;
const baseURL = "http://localhost:8080";

// urls for all our api endpoints
// /api is the original endpoints
// /api2 is the newer endpoints and part of the api redo

export const UrlApiMonth = "/api/month";
export const UrlApiImportDaily = "/api/import/daily";
export const UrlApiImportControl = "/api/import/control";
export const UrlApiImportWISR = "/api/import/wisr";
export const UrlApiImportHockeySchedule = "/api/import/hockey";

export const UrlApi2DayEdit = "/api2/day/edit";
export const UrlApi2DayUpdate = "/api2/day/update";

export const UrlApi2ImportList = "/api2/import/list";   // get list of all files we can import

export const UrlApiWeekly = "/api/weekly/view";
export const UrlApi2WeeklyExport = "/api2/weekly/export";

export const UrlApi2AUVView = "/api2/auv/view";
export const UrlApi2AUVUpdate = "/api2/auv/update";

export const UrlApiWasteView = "/api/waste/view";
export const UrlApiWasteExport = "/api/waste/export";
export const UrlApiWasteNames = "/api/waste/names";

export const UrlApiWasteRemoveUnused = "/api/waste/unused";

export const UrlApiWasteHolding = "/api/waste/holding";
export const UrlApiWasteHoldingAdd = "/api/waste/holding/add";
export const UrlApiWasteHoldingConfirm = "/api/waste/holding/confirm";
export const UrlApiWasteHoldingDelete = "/api/waste/holding/delete";

export const UrlApiWasteSettingsGet = "/api/waste/settings";
export const UrlApiWasteItem = "/api/waste/item";   // retreive a single wastage item information
export const UrlApiWasteItemUpdate = "/api/waste/item/update";
export const UrlApiWasteItemNew = "/api/waste/item/new";

export const UrlApiGetTags = "/api/tags/view";
export const UrlApiGetTagId = "/api/tags/data";

export const UrlApiTop5 = "/api/top5";
export const UrlApiTop5Data = "/api/top5/data";

// export const UrlApiGetBackupTable = "/api/backup/get";
// export const UrlApiDailyUndo = "/api/backup/undo";          // undo 
// export const UrlApiDailyRevert = "/api/backup/revert";          // retrieve the daily data undo list
export const UrlApiDailyUndoList = "/api/backup/daydata/get";
export const UrlApiDailyUndoAction = "/api/backup/daydata/action";
export const UrlApiDailyUndoClear = "/api/backup/daydata/clear";

export const UrlApiCommentSearch = "/api/comment/search"; 		// search for all comments containing the search term

export const UrlApiHockeyData = "/api/hockey/data";
export const UrlApiHockeyDataYear = "/api/hockey/data/years";	// used to get range of years we have data for

export const UrlApi2AverageStats = "/api/stats/average";

export const UrlApiGetNotifications = "/api/notifications/get";
export const UrlApiClearNotifications = "/api/notifications/clear";

export const UrlApiTestFunction = "/api/test";

export function UrlGet(name) {
	var base = "";
	if(production === false) {
		base = baseURL;
	}

    return base+name;
}


// headers sent when doing a POST operation
const headers = {
	'Content-Type': 'application/json',
}

// returns the default options used when sending a post request
// NOTE: body is sent as is, make sure JSONify if required first
export function GetPostOptions(body) {
	return {
		method: 'POST',
		headers: headers,
		body: body,
	};
}

export default UrlGet;

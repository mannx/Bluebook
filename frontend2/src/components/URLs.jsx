
// development, set to http://localhost:8080, for production, leave empty
const production = false;
const baseURL = "http://localhost:9080";

// urls for all our api endpoints
// /api is the original endpoints
// /api2 is the newer endpoints and part of the api redo

export const UrlApiMonth = "/api/month";
export const UrlApiImportDaily = "/api/import/daily";
export const UrlApiImportControl = "/api/import/control";
export const UrlApiImportWISR = "/api/import/wisr";

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
export const UrlApiWasteHolding = "/api/waste/holding";

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

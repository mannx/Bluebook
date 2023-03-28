
// development, set to http://localhost:8080, for production, leave empty
const production = false;
const baseURL = "http://localhost:8080";

// urls for all our api endpoints
// /api is the original endpoints
// /api2 is the newer endpoints and part of the api redo
// const urls = {
// 	"AUV": "/api/auv/view",
// 	"AUVUpdate": "/api/auv/update",

// 	"Daily": "/api/import/daily",
// 	"Control": "/api/import/control",
// 	"WISR": "/api/import/wisr",
// 	"Waste": "/api/import/waste",

// 	"Month": "/api/month",
// 	"Comment": "/api/update/comment",

//     "DayEdit": "/api2/day/edit",                            // edit a single day, comment & tags
//     "DayUpdate": "/api2/day/update",                        // update the edited day data

// 	"Tags": "/api/tags/view",
// 	"TagData": "/api/tags/data",							// get data about a single tag
// 	"TagEditPost": "/api/tags/update",						// update the tags for a given day
// 	"TagEdit": "/api/tags/edit",							// edit a tag name
// 	"TagClean": "/api/tags/clean",							// clean up unused tags

// 	"WasteView": "/api/waste/view",
// 	"WasteSettings": "/api/waste/settings",
// 	"WasteUpdate":"/api/waste/update",						// update waste settings
// 	"DeleteWasteItem": "/api/waste/delete", 				// delete a wastage item
// 	"AddNewWasteItem": "/api/waste/new",					// add a new waste item
// 	"CombineWasteItem": "/api/waste/combine",				// combine wastage items
// 	"WasteNames": "/api/waste/names",						// get the list of all wastage items in the db
// 	"WasteUnusedRemove":"/api/waste/unused",				// remove unused wastage items

// 	"WasteInputGet": "/api/waste/holding",					// get list of wastage input currently saved
// 	"WasteInputAdd": "/api/waste/holding/add",				// add an entry to the wastage input holding table
// 	"WasteInputConfirm": "/api/waste/holding/confirm",		// merge holding table to main waste table
// 	"WasteInputDelete": "/api/waste/holding/delete",		// delete holding entry
// 	"WasteExport": "/api/waste/export",

// 	"Weekly": "/api/weekly/view",
// 	"Export": "/api/export/weekly",							// Export Weekly

// 	"Top5": "/api/top5/view",

// 	"ImportBackupDev": "/api/import/backup",
// 	"ImportBackupRevert" : "/api/import/backup/revert",		// Revert entries to previous state
// 	"ImportBackupUndo" : "/api/import/backup/undo",			// undo imports that didnt update any records
// 	"ImportBackupEmpty" : "/api/import/backup/empty",		// empty backup tables

//     "DBBackupList": "/api/backup/list",
//     "DBBackupRemove": "/api/backup/remove",
// }

export const UrlApiMonth = "/api/month";
export const UrlApiImportDaily = "/api/import/daily";
export const UrlApiImportControl = "/api/import/control";
export const UrlApiImportWISR = "/api/import/wisr";

export const UrlApi2DayEdit = "/api2/day/edit";
export const UrlApi2DayUpdate = "/api2/day/update";

export const UrlApi2ImportList = "/api2/import/list";   // get list of all files we can import

export const UrlApiWeekly = "/api/weekly/view";
export const UrlApi2WeeklyExport = "/api2/weekly/export";

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

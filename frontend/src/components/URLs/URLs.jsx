
// development, set to http://localhost:8080, for production, leave empty
const production = false;
const baseURL = "http://localhost:8080";

const urls = {
	"AUV": "/api/auv/view",
	"AUVUpdate": "/api/auv/update",

	"Daily": "/api/import/daily",
	"Control": "/api/import/control",
	"WISR": "/api/import/wisr",
	"Waste": "/api/import/waste",

	"Month": "/api/month",
	"Comment": "/api/update/comment",

	"Tags": "/api/tags/view",
	"TagData": "/api/tags/data",							// get data about a single tag
	"TagEditPost": "/api/tags/update",						// update the tags for a given day
	"TagEdit": "/api/tags/edit",							// edit a tag name

	"WasteView": "/api/waste/view",
	"WasteSettings": "/api/waste/settings",
	"WasteUpdate":"/api/waste/update",						// update waste settings
	"DeleteWasteItem": "/api/waste/delete", 				// delete a wastage item
	"AddNewWasteItem": "/api/waste/new",					// add a new waste item
	"CombineWasteItem": "/api/waste/combine",				// combine wastage items
	"WasteNames": "/api/waste/names",						// get the list of all wastage items in the db
	"WasteUnusedRemove":"/api/waste/unused",				// remove unused wastage items

	"WasteInputGet": "/api/waste/holding",					// get list of wastage input currently saved
	"WasteInputAdd": "/api/waste/holding/add",				// add an entry to the wastage input holding table
	"WasteInputConfirm": "/api/waste/holding/confirm",		// merge holding table to main waste table
	"WasteInputDelete": "/api/waste/holding/delete",		// delete holding entry

	"Weekly": "/api/weekly/view",
	"Export": "/api/export/weekly",							// Export Weekly

	"Top5": "/api/top5/view",

	"ImportBackupDev": "/api/import/backup",
	"ImportBackupRevert" : "/api/import/backup/revert",		// Revert entries to previous state
	"ImportBackupUndo" : "/api/import/backup/undo",			// undo imports that didnt update any records
	"ImportBackupEmpty" : "/api/import/backup/empty",		// empty backup tables
}

export function UrlGet(name) {
	var base = "";
	if(production === false) {
		base = baseURL;
	}
	return base+urls[name];
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

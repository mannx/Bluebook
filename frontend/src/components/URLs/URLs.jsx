
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
		"TagData": "/api/tags/data",		// get data about a single tag

		"WasteView": "/api/waste/view",
		"Weekly": "/api/weekly/view",

}

function UrlGet(name) {
		var base = "";
		if(production === false) {
				base = baseURL;
		}
		return base+urls[name];
}

export default UrlGet;

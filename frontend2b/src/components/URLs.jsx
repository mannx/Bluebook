// urls for all our api endpoints
// /api is the original endpoints
// /api2 is the newer endpoints and part of the api redo

export const UrlApiMonth = "http://localhost:8080/api/month";

export const UrlApi2DayEdit = "http://localhost:8080/api2/day/edit";
export const UrlApi2DayUpdate = "http://localhost:8080/api2/day/update";

export const UrlApi2ImportList = "http://localhost:8080/api2/import/list"; // get list of all files we can import
export const UrlApiImportDaily = "http://localhost:8080/api/import/daily";
export const UrlApiImportControl = "http://localhost:8080/api/import/control";
export const UrlApiImportWISR = "http://localhost:8080/api/import/wisr";

export const UrlApiWeekly = "http://localhost:8080/api/weekly/view";
export const UrlApi2WeeklyExport = "http://localhost:8080/api/weekly/export";

export const UrlApi2AUVView = "http://localhost:8080/api/auv/view";
export const UrlApi2AUVUpdate = "http://localhost:8080/api/auv/update";

export const UrlApiGetTags = "http://localhost:8080/api/tags/view";
export const UrlApiGetTagId = "http://localhost:8080/api/tags/data";

export const UrlApiTop5 = "http://localhost:8080/api/top5";
export const UrlApiTop5Data = "http://localhost:8080/api/top5/data";

// TODO:
export const UrlApiManualArchive = "http://localhost:8080/api/backup/archive";

// export const UrlApiCommentSearch = "http://localhost:8080/api/comment/search"; // search for all comments containing the search term

export const UrlApiSettingsGet = "http://localhost:8080/api/settings/get"; // get the global settings
export const UrlApiSettingsSet = "http://localhost:8080/api/settings/set"; // update the global settings

// export const UrlAbout = "http://localhost:8080/api/about";

// headers sent when doing a POST operation
const headers = {
  "Content-Type": "application/json",
};

// returns the default options used when sending a post request
// NOTE: body is sent as is, make sure JSONify if required first
export function GetPostOptions(body) {
  return {
    method: "POST",
    headers: headers,
    body: body,
  };
}

// default export function
// if we remove unable to import any fucntions even if noted default
export default function UrlDefFunc() {
  return "";
}

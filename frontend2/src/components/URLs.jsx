// urls for all our api endpoints
// /api is the original endpoints
// /api2 is the newer endpoints and part of the api redo

export const UrlApiMonth = "http://localhost:8080/api/month";
export const UrlApiImportDaily = "http://localhost:8080/api/import/daily";
export const UrlApiImportControl = "http://localhost:8080/api/import/control";
export const UrlApiImportWISR = "http://localhost:8080/api/import/wisr";

export const UrlApi2DayEdit = "http://localhost:8080/api2/day/edit";
export const UrlApi2DayUpdate = "http://localhost:8080/api2/day/update";

export const UrlApi2ImportList = "http://localhost:8080/api2/import/list"; // get list of all files we can import

export const UrlApiWeekly = "http://localhost:8080/api/weekly/view";
export const UrlApi2WeeklyExport = "http://localhost:8080/api2/weekly/export";

// export const UrlApi2AUVView = "http://localhost:8080/api2/auv/view";
export const UrlApi2AUVView = "http://localhost:8080/api/auv/view";
// export const UrlApi2AUVUpdate = "http://localhost:8080/api2/auv/update";
export const UrlApi2AUVUpdate = "http://localhost:8080/api/auv/update";

export const UrlApiWasteView = "http://localhost:8080/api/waste/view";
export const UrlApiWasteExport = "http://localhost:8080/api/waste/export";
export const UrlApiWasteNames = "http://localhost:8080/api/waste/names";

export const UrlApiWasteRemoveUnused = "http://localhost:8080/api/waste/unused";

export const UrlApiWasteHolding = "http://localhost:8080/api/waste/holding";
export const UrlApiWasteHoldingAdd =
  "http://localhost:8080/api/waste/holding/add";
export const UrlApiWasteHoldingConfirm =
  "http://localhost:8080/api/waste/holding/confirm";
export const UrlApiWasteHoldingDelete =
  "http://localhost:8080/api/waste/holding/delete";

export const UrlApiWasteSettingsGet =
  "http://localhost:8080/api/waste/settings";
export const UrlApiWasteItem = "http://localhost:8080/api/waste/item"; // retreive a single wastage item information
export const UrlApiWasteItemUpdate =
  "http://localhost:8080/api/waste/item/update";
export const UrlApiWasteItemNew = "http://localhost:8080/api/waste/item/new";

export const UrlApiGetTags = "http://localhost:8080/api/tags/view";
export const UrlApiGetTagId = "http://localhost:8080/api/tags/data";

export const UrlApiTop5 = "http://localhost:8080/api/top5";
export const UrlApiTop5Data = "http://localhost:8080/api/top5/data";

export const UrlApiDailyUndoList =
  "http://localhost:8080/api/backup/daydata/get";
export const UrlApiDailyUndoAction =
  "http://localhost:8080/api/backup/daydata/action";
export const UrlApiDailyUndoClear =
  "http://localhost:8080/api/backup/daydata/clear";

export const UrlApiManualArchive = "http://localhost:8080/api/backup/archive";

export const UrlApiCommentSearch = "http://localhost:8080/api/comment/search"; // search for all comments containing the search term

export const UrlApiHockeyData = "http://localhost:8080/api/hockey/data";
export const UrlApiHockeyDataYear =
  "http://localhost:8080/api/hockey/data/years"; // used to get range of years we have data for
export const UrlApiHockeyRaw = "http://localhost:8080/api/hockey/raw"; // get the raw json of the hockey data
export const UrlApiHockeyImport = "http://localhost:8080/api/hockey/import";

export const UrlApi2AverageStats = "http://localhost:8080/api/stats/average";

export const UrlApiGetNotifications =
  "http://localhost:8080/api/notifications/get";
export const UrlApiClearNotifications =
  "http://localhost:8080/api/notifications/clear";

export const UrlApiSettingsGet = "http://localhost:8080/api/settings/get"; // get the global settings
export const UrlApiSettingsSet = "http://localhost:8080/api/settings/set"; // update the global settings

export const UrlApi2RawDayData = "http://localhost:8080/api/raw/daydata";

export const UrlAbout = "http://localhost:8080/api/about";

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

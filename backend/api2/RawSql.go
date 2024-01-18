package api2

import (
	"github.com/labstack/echo/v4"
	"github.com/mannx/Bluebook/api"
	"gorm.io/gorm"
)

// client sends a raw sql query parameter 'query' to be run
// results are stored int he results table, cleared before each run
func HandleRawSql(e echo.Context, db *gorm.DB) error {
	return api.ReturnServerMessage(e, "NYI", true)
}

// return the raw sql result, stored in the db in json format already
func HandleRawSqlResult(e echo.Context, db *gorm.DB) error {
	return api.ReturnServerMessage(e, "NYI", true)
}

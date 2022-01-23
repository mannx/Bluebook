module github.com/mannx/Bluebook

go 1.17

require (
	github.com/kelseyhightower/envconfig v1.4.0
	github.com/labstack/echo/v4 v4.6.3
	github.com/rs/zerolog v1.15.0
	github.com/xuri/excelize/v2 v2.5.0
	gorm.io/datatypes v1.0.5
	gorm.io/driver/sqlite v1.2.6
	gorm.io/gorm v1.22.5
)

require (
	github.com/go-sql-driver/mysql v1.6.0 // indirect
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.4 // indirect
	github.com/labstack/gommon v0.3.1 // indirect
	github.com/mattn/go-colorable v0.1.11 // indirect
	github.com/mattn/go-isatty v0.0.14 // indirect
	github.com/mattn/go-sqlite3 v1.14.9 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826 // indirect
	github.com/richardlehane/mscfb v1.0.3 // indirect
	github.com/richardlehane/msoleps v1.0.1 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.1 // indirect
	github.com/xuri/efp v0.0.0-20210322160811-ab561f5b45e3 // indirect
	golang.org/x/crypto v0.0.0-20210921155107-089bfa567519 // indirect
	golang.org/x/net v0.0.0-20210913180222-943fd674d43e // indirect
	golang.org/x/sys v0.0.0-20211103235746-7861aae1554b // indirect
	golang.org/x/text v0.3.7 // indirect
	golang.org/x/time v0.0.0-20201208040808-7e3f01d25324 // indirect
	gorm.io/driver/mysql v1.2.2 // indirect
	gorm.io/driver/postgres v1.2.3 // indirect
	gorm.io/driver/sqlserver v1.2.1 // indirect
)

replace (
	github.com/mannx/Bluebook/api => ../api
	github.com/mannx/Bluebook/environ => ../environ
	github.com/mannx/Bluebook/import => ../import
	github.com/mannx/Bluebook/models => ../models
)

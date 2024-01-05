module github.com/mannx/Bluebook

go 1.17

require (
	github.com/kelseyhightower/envconfig v1.4.0
	// github.com/labstack/echo/v4 v4.9.0
	github.com/labstack/echo/v4 v4.11.4
	github.com/rs/zerolog v1.31.0
	github.com/xuri/excelize/v2 v2.8.0
	gorm.io/datatypes v1.2.0
	gorm.io/driver/sqlite v1.5.4
	gorm.io/gorm v1.25.5
)

require (
	github.com/go-sql-driver/mysql v1.7.1 // indirect
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/labstack/gommon v0.4.2 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-sqlite3 v1.14.19 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826 // indirect
	github.com/richardlehane/mscfb v1.0.4 // indirect
	github.com/richardlehane/msoleps v1.0.3 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.2 // indirect
	github.com/xuri/efp v0.0.0-20231025114914-d1ff6096ae53 // indirect
	github.com/xuri/nfp v0.0.0-20230919160717-d98342af3f05 // indirect
	// golang.org/x/crypto v0.14.0 // indirect
	golang.org/x/crypto v0.17.0 // indirect
	golang.org/x/net v0.19.0 // indirect
	golang.org/x/sys v0.16.0 // indirect
	golang.org/x/text v0.14.0 // indirect
	golang.org/x/time v0.5.0 // indirect
	gorm.io/driver/mysql v1.5.2 // indirect
)

replace (
	github.com/mannx/Bluebook/api => ../api
	github.com/mannx/Bluebook/api2 => ../api2
	github.com/mannx/Bluebook/environ => ../environ
	github.com/mannx/Bluebook/import => ../import
	github.com/mannx/Bluebook/models => ../models
)

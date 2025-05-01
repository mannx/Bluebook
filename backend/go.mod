module github.com/mannx/Bluebook

go 1.23.0

toolchain go1.24.2

require (
	github.com/kelseyhightower/envconfig v1.4.0
	// github.com/labstack/echo/v4 v4.9.0
	github.com/labstack/echo/v4 v4.13.3
	github.com/rs/zerolog v1.34.0
	github.com/xuri/excelize/v2 v2.9.0
	gorm.io/datatypes v1.2.5
	gorm.io/driver/sqlite v1.5.7
	gorm.io/gorm v1.26.0
)

require (
	github.com/go-sql-driver/mysql v1.9.2 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/labstack/gommon v0.4.2 // indirect
	github.com/mattn/go-colorable v0.1.14 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-sqlite3 v1.14.28 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826 // indirect
	github.com/richardlehane/mscfb v1.0.4 // indirect
	github.com/richardlehane/msoleps v1.0.4 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.2 // indirect
	github.com/xuri/efp v0.0.0-20250227110027-3491fafc2b79 // indirect
	github.com/xuri/nfp v0.0.0-20250226145837-86d5fc24b2ba // indirect
	// golang.org/x/crypto v0.14.0 // indirect
	golang.org/x/crypto v0.37.0 // indirect
	golang.org/x/net v0.39.0 // indirect
	golang.org/x/sys v0.32.0 // indirect
	golang.org/x/text v0.24.0 // indirect
	golang.org/x/time v0.11.0 // indirect
	gorm.io/driver/mysql v1.5.7 // indirect
)

require (
	filippo.io/edwards25519 v1.1.0 // indirect
	github.com/google/uuid v1.6.0 // indirect
)

replace (
	github.com/mannx/Bluebook/api => ../api
	github.com/mannx/Bluebook/api2 => ../api2
	github.com/mannx/Bluebook/environ => ../environ
	github.com/mannx/Bluebook/import => ../import
	github.com/mannx/Bluebook/models => ../models
)

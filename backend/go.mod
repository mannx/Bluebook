module github.com/mannx/Bluebook

go 1.17

require (
	github.com/kelseyhightower/envconfig v1.4.0
	// github.com/labstack/echo/v4 v4.9.0
	github.com/labstack/echo/v4 v4.12.0
	github.com/rs/zerolog v1.32.0
	github.com/xuri/excelize/v2 v2.8.1
	gorm.io/datatypes v1.2.0
	gorm.io/driver/sqlite v1.5.5
	gorm.io/gorm v1.25.10
)

require (
	github.com/go-sql-driver/mysql v1.8.1 // indirect
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/labstack/gommon v0.4.2 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-sqlite3 v1.14.22 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826 // indirect
	github.com/richardlehane/mscfb v1.0.4 // indirect
	github.com/richardlehane/msoleps v1.0.3 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.2 // indirect
	github.com/xuri/efp v0.0.0-20240408161823-9ad904a10d6d // indirect
	github.com/xuri/nfp v0.0.0-20240318013403-ab9948c2c4a7 // indirect
	// golang.org/x/crypto v0.14.0 // indirect
	golang.org/x/crypto v0.22.0 // indirect
	golang.org/x/net v0.24.0 // indirect
	golang.org/x/sys v0.19.0 // indirect
	golang.org/x/text v0.14.0 // indirect
	golang.org/x/time v0.5.0 // indirect
	gorm.io/driver/mysql v1.5.6 // indirect
)

require github.com/robfig/cron/v3 v3.0.1

require (
	filippo.io/edwards25519 v1.1.0 // indirect
	github.com/mitranim/gg v0.1.19 // indirect
	github.com/mitranim/gow v0.0.0-20231026105220-af11a6e1e9eb // indirect
	github.com/rjeczalik/notify v0.9.3 // indirect
)

replace (
	github.com/mannx/Bluebook/api => ../api
	github.com/mannx/Bluebook/api2 => ../api2
	github.com/mannx/Bluebook/environ => ../environ
	github.com/mannx/Bluebook/import => ../import
	github.com/mannx/Bluebook/models => ../models
)

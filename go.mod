module github.com/mannx/Bluebook

go 1.17

require (
	github.com/kelseyhightower/envconfig v1.4.0
	// github.com/labstack/echo/v4 v4.9.0
	github.com/labstack/echo/v4 v4.10.1
	github.com/rs/zerolog v1.29.0
	github.com/xuri/excelize/v2 v2.7.0
	gorm.io/datatypes v1.1.0
	gorm.io/driver/sqlite v1.4.4
	gorm.io/gorm v1.24.5
)

require (
	github.com/go-sql-driver/mysql v1.7.0 // indirect
	github.com/golang-jwt/jwt v3.2.2+incompatible // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/labstack/gommon v0.4.0 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.17 // indirect
	github.com/mattn/go-sqlite3 v1.14.16 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826 // indirect
	github.com/richardlehane/mscfb v1.0.4 // indirect
	github.com/richardlehane/msoleps v1.0.3 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.2 // indirect
	github.com/xuri/efp v0.0.0-20220603152613-6918739fd470 // indirect
	github.com/xuri/nfp v0.0.0-20220409054826-5e722a1d9e22 // indirect
	golang.org/x/crypto v0.6.0 // indirect
	golang.org/x/net v0.7.0 // indirect
	golang.org/x/sys v0.5.0 // indirect
	golang.org/x/text v0.7.0 // indirect
	golang.org/x/time v0.3.0 // indirect
	gorm.io/driver/mysql v1.4.7 // indirect
)

replace (
	github.com/mannx/Bluebook/api => ../api
	github.com/mannx/Bluebook/environ => ../environ
	github.com/mannx/Bluebook/import => ../import
	github.com/mannx/Bluebook/models => ../models
)

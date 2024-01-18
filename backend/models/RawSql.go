package models

import "gorm.io/gorm"

type RawSqlResult struct {
	gorm.Model

	Result string
}

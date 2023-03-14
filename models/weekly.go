package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Contains various bit of data for a given week
type WeeklyInfo struct {
	gorm.Model

	Date       datatypes.Date `gorm:"column:Date"`
	BreadCount int            `gorm:"column:BreadCount"`

	FoodCostAmount  float64 `gorm:"column:FoodCostAmount"`
	FoodCostPercent float64 `gorm:"column:FoodCostPercent"`

	LabourCostAmount  float64 `gorm:"column:LabourCostAmount"`
	LabourCostPercent float64 `gorm:"column:LabourCostPercent"`

	NetSales float64 `gorm:"column:NetSales"`

	PartySales float64 `gorm:"column:PartySales"`
}

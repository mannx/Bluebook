-- Your SQL goes here
CREATE TABLE IF NOT EXISTS weekly_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  Date DATE NOT NULL,

  BreadCount INTEGER,

  FoodCostAmount REAL,
  FoodCostPercent REAL,

  LabourCostAmount REAL,
  LabourCostPercent REAL,

  NetSales REAL,
  PartySales REAL,
  Productivity REAL
)

-- type WeeklyInfo struct {
-- 	gorm.Model
-- 
-- 	Date       datatypes.Date `gorm:"column:Date"`
-- 	BreadCount int            `gorm:"column:BreadCount"`
-- 
-- 	FoodCostAmount  float64 `gorm:"column:FoodCostAmount"`
-- 	FoodCostPercent float64 `gorm:"column:FoodCostPercent"`
-- 
-- 	LabourCostAmount  float64 `gorm:"column:LabourCostAmount"`
-- 	LabourCostPercent float64 `gorm:"column:LabourCostPercent"`
-- 
-- 	NetSales float64 `gorm:"column:NetSales"`
-- 
-- 	PartySales   float64 `gorm:"column:PartySales"`
-- 	Productivity float64 // total productivity for the week
-- }

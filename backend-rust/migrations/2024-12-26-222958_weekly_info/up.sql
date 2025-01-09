CREATE TABLE IF NOT EXISTS weekly_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  DayDate DATE NOT NULL,

  BreadCount INTEGER,

  FoodCostAmount REAL,
  FoodCostPercent REAL,

  LabourCostAmount REAL,
  LabourCostPercent REAL,

  NetSales REAL,
  PartySales REAL,
  Productivity REAL
)

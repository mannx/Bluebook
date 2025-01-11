CREATE TABLE IF NOT EXISTS weekly_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,

  DayDate DATE NOT NULL,

  BreadCount INTEGER NOT NULL,

  FoodCostAmount REAL NOT NULL,
  FoodCostPercent REAL NOT NULL,

  LabourCostAmount REAL NOT NULL,
  LabourCostPercent REAL NOT NULL,

  NetSales REAL NOT NULL,
  PartySales REAL NOT NULL,
  Productivity REAL NOT NULL
)

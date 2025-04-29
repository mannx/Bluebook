CREATE TABLE IF NOT EXISTS weekly_info (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,

  WeekEnding DATE NOT NULL,

  -- FoodCostAmount REAL NOT NULL,
  -- FoodCostPercent REAL NOT NULL,
  FoodCostAmount INTEGER NOT NULL,
  FoodCostPercent INTEGER NOT NULL,


  -- LabourCostAmount REAL NOT NULL,
  -- LabourCostPercent REAL NOT NULL,
  LabourCostAmount INTEGER NOT NULL,
  LabourCostPercent INTEGER NOT NULL,

  -- NetSales REAL NOT NULL,
  -- PartySales REAL NOT NULL,
  -- Productivity REAL NOT NULL
  NetSales INTEGER NOT NULL,
  PartySales INTEGER NOT NULL,
  Productivity INTEGER NOT NULL
)

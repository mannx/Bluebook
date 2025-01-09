INSERT INTO weekly_info (
  id, DayDate,
  BreadCount,
  FoodCostAmount, FoodCostPercent, LabourCostAmount,LabourCostPercent,NetSales,PartySales,
  Productivity
)
SELECT id,Date,BreadCount,FoodCostAmount,FoodCostPercent,LabourCostAmount,LabourCostPercent,NetSales,PartySales,
Productivity FROM weekly_infos;

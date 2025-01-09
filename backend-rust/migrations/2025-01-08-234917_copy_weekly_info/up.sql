-- Your SQL goes here
INSERT INTO weekly_info (
  id,DayDate,BreadCount,FoodCostAmount,FoodCostPercent,LabourCostPercent,LabourCostAmount,NetSales,
  PartySales,Productivity
)
SELECT id,Date,BreadCount,FoodCostAmount,FoodCostPercent,LabourCostPercent,LabourCostAmount,NetSales,PartySales,
Productivity FROM weekly_infos;

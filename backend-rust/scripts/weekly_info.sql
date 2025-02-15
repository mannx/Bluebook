-- Clean up the weekly_infos table and copy into a newer weekly_info table
--
-- Run once to migrate data over into the newer tables for the rust backend
--
-- 1) convert all null fields into not null fields and set to 0
UPDATE weekly_infos SET FoodCostAmount=0 WHERE FoodCostAmount IS NULL;
UPDATE weekly_infos SET FoodCostPercent=0 WHERE FoodCostPercent IS NULL;
UPDATE weekly_infos SET LabourCostAmount=0 WHERE LabourCostAmount IS NULL;
UPDATE weekly_infos SET LabourCostPercent=0 WHERE LabourCostPercent IS NULL;
UPDATE weekly_infos SET PartySales=0 WHERE PartySales IS NULL;
UPDATE weekly_infos SET NetSales=0 WHERE NetSales IS NULL;
UPDATE weekly_infos SET productivity=0 WHERE productivity IS NULL;

UPDATE weekly_infos set Date=substr(Date,0,11);
-- 2) copy the data over

ATTACH DATABASE 'db.db' AS db;

INSERT INTO db.weekly_info (
  id, DayDate,
  FoodCostAmount, FoodCostPercent, LabourCostAmount,LabourCostPercent,NetSales,PartySales,
  Productivity
)
SELECT id,Date,FoodCostAmount,FoodCostPercent,LabourCostAmount,LabourCostPercent,NetSales,PartySales,
Productivity FROM weekly_infos;

-- make sure all fields are not null
UPDATE auv_entry2 SET week1_auv=0 WHERE week1_auv IS NULL;
UPDATE auv_entry2 SET week2_auv=0 WHERE week2_auv IS NULL;
UPDATE auv_entry2 SET week3_auv=0 WHERE week3_auv IS NULL;
UPDATE auv_entry2 SET week4_auv=0 WHERE week4_auv IS NULL;
-- UPDATE auv_entry2 SET week5_auv=0 WHERE week5_auv IS NULL;

UPDATE auv_entry2 SET week1_hours=0 WHERE week1_hours IS NULL;
UPDATE auv_entry2 SET week2_hours=0 WHERE week2_hours IS NULL;
UPDATE auv_entry2 SET week3_hours=0 WHERE week3_hours IS NULL;
UPDATE auv_entry2 SET week4_hours=0 WHERE week4_hours IS NULL;
-- UPDATE auv_entry2 SET week5_hours=0 WHERE week5_hours IS NULL;

UPDATE auv_entry2 SET week1_prod=0 WHERE week1_prod IS NULL;
UPDATE auv_entry2 SET week2_prod=0 WHERE week2_prod IS NULL;
UPDATE auv_entry2 SET week3_prod=0 WHERE week3_prod IS NULL;
UPDATE auv_entry2 SET week4_prod=0 WHERE week4_prod IS NULL;
-- UPDATE auv_entry2 SET week5_prod=0 WHERE week5_prod IS NULL;

-- attach to new db and copy everything over
ATTACH DATABASE 'db.db' AS db;

-- copy data over
INSERT INTO db.auv_data (
  id, month, year,
  week_1_auv,
  week_1_hours,
  week_1_productivity,

  week_2_auv,
  week_2_hours,
  week_2_productivity,

  week_3_auv,
  week_3_hours,
  week_3_productivity,

  week_4_auv,
  week_4_hours,
  week_4_productivity,

  week_5_auv,
  week_5_hours,
  week_5_productivity

)
SELECT id, month, year, 
  week1_auv,
  week1_hours,
  week1_prod * 100,

  week2_auv,
  week2_hours,
  week2_prod * 100,

  week3_auv,
  week3_hours,
  week3_prod * 100,

  week4_auv,
  week4_hours,
  week4_prod * 100,

  week5_auv,
  week5_hours,
  week5_prod * 100
FROM auv_entry2;

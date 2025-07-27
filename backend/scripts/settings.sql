-- delete any deleted entries before copying over

DELETE FROM bluebook_settings WHERE deleted_at IS NOT NULL;

-- attach the new db and copy over our data
ATTACH DATABASE 'db.db' AS db;

INSERT INTO db.settings (
  id, HockeyUrl, DisplayHockeyWeekly,
  PrintHockeyWeekly, HockeyHomeTeam, ManagerName, StoreNumber
) SELECT 
  id, hockey_url, display_hockey_weekly,
  print_hockey_weekly, hockey_home_team, manager_name, store_number
  FROM bluebook_settings;

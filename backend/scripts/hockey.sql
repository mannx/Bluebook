-- copy the hockey schedule data to the new table
ATTACH DATABASE 'db.db' AS db;

-- update the date field to strip off the useless time component
UPDATE hockey_schedules set Date=substr(Date,0,11);

INSERT INTO db.hockey_schedule (
  id, DayDate, Away, Home, GFAway, GFHome, Attendance, Arena, HomeImage,AwayImage
)
SELECT id,Date,Away,Home,gf_away,gf_home,Attendance,Arena,home_image,away_image
FROM hockey_schedules;

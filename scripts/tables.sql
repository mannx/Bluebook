-- convert table names to what we are now using. fields are auto updated on server launch
ALTER TABLE bbhelper_daydata RENAME TO day_data;
ALTER TABLE bbhelper_auvtargets RENAME TO auv_entries;
ALTER TABLE bbhelper_comments RENAME TO comments;
ALTER TABLE bbhelper_wastageentry RENAME TO wastage_entries;
ALTER TABLE bbhelper_wastageitem RENAME TO wastage_items;
ALTER TABLE bbhelper_weeklyinfo RENAME TO weekly_infos;

ALTER TABLE bbhelper_tagdata RENAME TO tag_data;
ALTER TABLE bbhelper_taglist RENAME TO tag_lists;

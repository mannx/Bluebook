-- remove all deleted entries from the database for several tables

DELETE FROM auv_entries WHERE deleted_at IS NOT NULL;
DELETE FROM comments WHERE deleted_at IS NOT NULL;
DELETE FROM day_data WHERE deleted_at IS NOT NULL;
DELETE FROM day_data_backups WHERE deleted_at IS NOT NULL;
DELETE FROM day_data_import_lists WHERE deleted_at IS NOT NULL;
DELETE FROM tag_data WHERE deleted_at IS NOT NULL;
DELETE FROM tag_lists WHERE deleted_at IS NOT NULL;
DELETE FROM wastage_entries WHERE deleted_at IS NOT NULL;
DELETE FROM wastage_entry_holdings WHERE deleted_at IS NOT NULL;
DELETE FROM wastage_items WHERE deleted_at IS NOT NULL;
DELETE FROM weekly_infos WHERE deleted_at IS NOT NULL;


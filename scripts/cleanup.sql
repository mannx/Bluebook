-- this script is used to remove tables that were only used by django
-- and no longer needed

DROP TABLE auth_group;
DROP TABLE auth_group_permissions;
DROP TABLE auth_permission;
DROP TABLE auth_user;
DROP TABLE auth_user_groups;
DROP TABLE auth_user_user_permissions;
DROP TABLE bbhelper_settingsmodel;
DROP TABLE bbhelper_wastageundoentry;
DROP TABLE django_admin_log;
DROP TABLE django_content_type;
DROP TABLE django_migrations;
DROP TABLE django_session;


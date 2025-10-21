/*
  # Seed Permissions
  This migration seeds the `Permissions` table with a default set of granular permissions
  that will be used to build roles for the application.
*/

INSERT INTO Permissions (permission_name) VALUES
('users:create'),
('users:read'),
('users:update'),
('users:delete'),
('roles:create'),
('roles:read'),
('roles:update'),
('roles:delete'),
('devices:create'),
('devices:read'),
('devices:update'),
('devices:delete'),
('homes:read'),
('homes:update');

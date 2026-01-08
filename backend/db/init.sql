-- Comprehensive DDL Script for Smart Home Application
-- Version 4.0
-- This script is idempotent and can be run safely multiple times.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in reverse order of dependency to ensure clean slate
DROP TABLE IF EXISTS "home_parameters", "home_parameter_types", "device_functionalities", "functionality_types", "devices", "rooms", "homemembers", "homes", "role_permissions", "permissions", "roles", "users" CASCADE;

-- User and Access Control Tables
CREATE TABLE "roles" (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE "users" (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles (role_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "permissions" (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE "role_permissions" (
    role_id INTEGER NOT NULL REFERENCES "roles"(role_id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES "permissions"(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Home, Room, and Device Management Tables
CREATE TABLE "homes" (
    home_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_by UUID NOT NULL REFERENCES "users"(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "homemembers" (
    home_id UUID NOT NULL REFERENCES "homes"(home_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "users"(user_id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES "roles"(role_id) ON DELETE RESTRICT,
    PRIMARY KEY (home_id, user_id)
);

CREATE TABLE "rooms" (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_id UUID NOT NULL REFERENCES "homes"(home_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50)
);

CREATE TABLE "devices" (
    device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_id UUID NOT NULL REFERENCES "homes"(home_id) ON DELETE CASCADE,
    room_id UUID REFERENCES "rooms"(room_id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    UNIQUE(home_id, name) -- Device name should be unique within a home
);

-- Dynamic Schemas for Devices and Homes
CREATE TABLE "functionality_types" (
    functionality_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parameters_definition JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE "device_functionalities" (
    device_functionality_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES "devices"(device_id) ON DELETE CASCADE,
    functionality_type_id UUID NOT NULL REFERENCES "functionality_types"(functionality_type_id) ON DELETE RESTRICT,
    configured_parameters JSONB
);

CREATE TABLE "home_parameter_types" (
    parameter_type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parameters_definition JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE "home_parameters" (
    home_parameter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_id UUID NOT NULL REFERENCES "homes"(home_id) ON DELETE CASCADE,
    parameter_type_id UUID NOT NULL REFERENCES "home_parameter_types"(parameter_type_id) ON DELETE RESTRICT,
    configured_parameters JSONB
);


-- Seed Data
INSERT INTO "roles" (role_name) VALUES ('System Admin'), ('Home Admin'), ('Home Member'), ('Home Guest') ON CONFLICT (role_name) DO NOTHING;

INSERT INTO "permissions" (permission_name, description) VALUES
    -- User Permissions
    ('users:create', 'Allow creating new users'),
    ('users:read', 'Allow viewing user list and details'),
    ('users:update', 'Allow updating any user profile'),
    ('users:delete', 'Allow deleting any user'),
    -- Role & Permission Management
    ('roles:create', 'Allow creating new roles'),
    ('roles:read', 'Allow viewing roles and their permissions'),
    ('roles:update', 'Allow editing roles and assigning permissions'),
    ('roles:delete', 'Allow deleting roles'),
    ('permissions:read', 'Allow viewing all available system permissions'),
    -- Home Management
    ('homes:create', 'Allow creating a new home'),
    ('homes:read', 'Allow viewing homes the user is a member of'),
    ('homes:update', 'Allow updating home settings'),
    ('homes:delete', 'Allow deleting a home'),
    -- Room Management
    ('rooms:create', 'Allow creating rooms within a home'),
    ('rooms:read', 'Allow viewing rooms within a home'),
    ('rooms:update', 'Allow updating rooms within a home'),
    ('rooms:delete', 'Allow deleting rooms within a home'),
    -- Device Management
    ('devices:create', 'Allow adding new devices to a home'),
    ('devices:read', 'Allow viewing devices in a home'),
    ('devices:update', 'Allow updating devices in a home'),
    ('devices:delete', 'Allow deleting devices from a home'),
    -- Functionality Management
    ('functionalities:read', 'Allow viewing available functionality types'),
    -- Home Parameter Management
    ('homeparametertypes:read', 'Allow viewing available home parameter types')
ON CONFLICT (permission_name) DO NOTHING;

-- Assign all permissions to System Admin
INSERT INTO "role_permissions" (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM "roles" r, "permissions" p WHERE r.role_name = 'System Admin'
ON CONFLICT DO NOTHING;

-- Grant Home Admin permissions
INSERT INTO "role_permissions" (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM "roles" r, "permissions" p
WHERE r.role_name = 'Home Admin'
  AND p.permission_name IN (
    'homes:read', 'homes:update',
    'rooms:create', 'rooms:read', 'rooms:update', 'rooms:delete',
    'devices:create', 'devices:read', 'devices:update', 'devices:delete',
    'functionalities:read', 'homeparametertypes:read'
  )
ON CONFLICT DO NOTHING;

-- Grant Home Member permissions
INSERT INTO "role_permissions" (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM "roles" r, "permissions" p
WHERE r.role_name = 'Home Member'
  AND p.permission_name IN (
    'homes:read',
    'rooms:read',
    'devices:read',
    'functionalities:read', 'homeparametertypes:read'
  )
ON CONFLICT DO NOTHING;

-- Seed Functionality Types
INSERT INTO "public"."functionality_types" ("name", "description", "parameters_definition") VALUES
 ('Switch', 'Switch outputs management ', '[{"name":"switch_1","pins":["GPIO0","GPIO1","GPIO2","GPIO3","GPIO4","GPIO14","GPIO27","GPIO26","GPIO25","GPIO33","GPIO32"],"required":false,"data_type":"list","default_value":""},{"name":"switch_2","pins":["GPIO0","GPIO1","GPIO2","GPIO3","GPIO4","GPIO14","GPIO27","GPIO26","GPIO25","GPIO33","GPIO32"],"required":false,"data_type":"list","default_value":""},{"name":"switch_3","pins":["GPIO0","GPIO1","GPIO2","GPIO3","GPIO4","GPIO14","GPIO27","GPIO26","GPIO25","GPIO33","GPIO32"],"required":false,"data_type":"list","default_value":""},{"name":"switch_4","pins":["GPIO0","GPIO1","GPIO2","GPIO3","GPIO4","GPIO14","GPIO27","GPIO26","GPIO25","GPIO33","GPIO32"],"required":false,"data_type":"list","default_value":""},{"name":"switch_5","pins":["GPIO0","GPIO1","GPIO2","GPIO3","GPIO4","GPIO14","GPIO27","GPIO26","GPIO25","GPIO33","GPIO32"],"required":false,"data_type":"list","default_value":""}]'), 
 ( 'LED Stripe', 'ws8212 led strip  management', '[{"name":"LED_number","required":true,"data_type":"integer","default_value":0},{"name":"data_pin","required":true,"data_type":"integer","default_value":15}]')
 ON CONFLICT (name) DO NOTHING;

-- Seed Home Parameter Types
INSERT INTO "home_parameter_types" (name, description, parameters_definition) VALUES
INSERT INTO "public"."home_parameter_types" ("parameter_type_id", "name", "description", "parameters_definition") VALUES 
('Server configuration ', 'Device webserver configuration', '[{"name":"auth","required":true,"data_type":"boolean"},{"name":"user","required":false,"data_type":"string"},{"name":"pass","required":false,"data_type":"string"}]'), 
('Misc configuration', 'Home misc configuration', '[{"name":"ntp","required":false,"data_type":"string"},{"name":"NTPperiod","required":false,"data_type":"integer"},{"name":"timeZone","required":true,"data_type":"integer"},{"name":"daylight","required":true,"data_type":"integer"},{"name":"deviceName","required":true,"data_type":"string"},{"name":"debug","required":false,"data_type":"integer"},{"name":"ota","required":true,"data_type":"boolean"},{"name":"otaPassword","required":true,"data_type":"string"}]'), 
('Network configuration', 'Network and Wifi configuration', '[{"name":"ssid","required":true,"data_type":"string"},{"name":"pass","required":true,"data_type":"string"},{"name":"ip","required":false,"data_type":"string"},{"name":"netmask","required":false,"data_type":"string"},{"name":"gateway","required":false,"data_type":"string"},{"name":"dns","required":true,"data_type":"string"},{"name":"dhcp","required":false,"data_type":"boolean"}]')
ON CONFLICT (name) DO NOTHING;

-- Add a default admin user (password: supersecret)
INSERT INTO "users" (username, email, password_hash, role_id) VALUES
('admin', 'admin@smarthome.app', '$2a$10$tAUzMZwngLR9vEyHfh.8de6edUkpWOESBEiDcXRRYJ4H441j9XMNG', 1)
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role_id = EXCLUDED.role_id;

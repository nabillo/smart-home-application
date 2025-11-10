-- Comprehensive DDL Script for Smart Home Application
-- Version 2.0
-- This script is idempotent and can be run safely multiple times.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in reverse order of dependency to ensure clean slate
DROP TABLE IF EXISTS "homemembers", "homes", "role_permissions", "permissions", "roles", "users" CASCADE;



CREATE TABLE "roles" (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- User and Access Control Tables
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

-- Home and Room Management Tables
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



-- Seed Data
INSERT INTO "roles" (role_name) VALUES ('System Admin'), ('Home Admin'), ('Home Member'), ('Home Guest');

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
    ('homes:delete', 'Allow deleting a home');

-- Assign all permissions to System Admin
INSERT INTO "role_permissions" (role_id, permission_id)
SELECT 1, p.permission_id FROM "permissions" p;



-- Add a default admin user (password: supersecret)
INSERT INTO "users" (username, email, password_hash) VALUES
('admin', 'admin@smarthome.app', '$2a$10$tAUzMZwngLR9vEyHfh.8de6edUkpWOESBEiDcXRRYJ4H441j9XMNG');

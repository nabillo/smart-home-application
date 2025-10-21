-- DDL Script for Smart Home Application
-- Database: PostgreSQL

-- Enable pgcrypto extension for gen_random_uuid() if not already enabled.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table to manage home locations.
CREATE TABLE Homes (
    home_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to manage user profiles.
CREATE TABLE Users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to define different user roles.
CREATE TABLE Roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Table to define granular permissions.
CREATE TABLE Permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL
);

-- Join table to link Roles to Permissions (many-to-many relationship).
CREATE TABLE Role_Permissions (
    role_id INTEGER NOT NULL REFERENCES Roles(role_id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES Permissions(permission_id) ON DELETE CASCADE,
    CONSTRAINT role_permission_pk PRIMARY KEY (role_id, permission_id)
);

-- Table to link users to homes and assign them a specific role.
CREATE TABLE HomeMembers (
    home_member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_id UUID NOT NULL REFERENCES Homes(home_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES Roles(role_id) ON DELETE RESTRICT,
    CONSTRAINT unique_home_user UNIQUE (home_id, user_id)
);

-- Table for managing physical smart devices.
CREATE TABLE Devices (
    device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_name VARCHAR(100) NOT NULL,
    home_id UUID NOT NULL REFERENCES Homes(home_id) ON DELETE CASCADE,
    device_type VARCHAR(50) NOT NULL, -- e.g., 'Thermostat', 'Light', 'Door Lock'
    model_number VARCHAR(100),
    firmware_version VARCHAR(50),
    status VARCHAR(20) NOT NULL, -- e.g., 'Online', 'Offline', 'Pending'
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store real-time and historical sensor data.
-- For TimescaleDB, you would run: SELECT create_hypertable('DeviceData', 'time');
CREATE TABLE DeviceData (
    time TIMESTAMP WITH TIME ZONE NOT NULL,
    device_id UUID NOT NULL REFERENCES Devices(device_id) ON DELETE CASCADE,
    data JSONB NOT NULL
);

-- Table to define automation rules.
CREATE TABLE AutomationRules (
    rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_id UUID NOT NULL REFERENCES Homes(home_id) ON DELETE CASCADE,
    rule_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    rule_logic JSONB NOT NULL,
    created_by UUID REFERENCES Users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial data for roles and the first admin user
-- This is crucial for the first-time setup
INSERT INTO Roles (role_name) VALUES ('Admin'), ('Member'), ('Guest');

-- Create the first admin user.
-- In a real application, this would be done via a secure setup wizard.
-- For development, we'll pre-insert it.
-- The password is 'admin_password'
INSERT INTO Users (username, email, password_hash, is_admin) VALUES
('admin', 'admin@smarthome.app', '$2b$10$g.lVz8Bw2AYyo22j0958a.CgB/xJjN/N5wzBq3b.7g5zQ.l9q3b5e', TRUE);

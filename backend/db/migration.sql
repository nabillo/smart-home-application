/*
  # Link Users to Roles
  This migration updates the users table to support role-based access control.

  1.  **Modify `users` table**:
      - Removes the boolean `is_admin` column.
      - Adds a `role_id` column to establish a foreign key relationship with the `roles` table.
  2.  **Foreign Key**:
      - The `role_id` references `roles(role_id)`.
      - `ON DELETE SET NULL`: If a role is deleted, users assigned to it will have their role set to NULL instead of being deleted.
*/

-- Remove the old is_admin column if it exists
ALTER TABLE public.users
DROP COLUMN IF EXISTS is_admin;

-- Add the role_id column to link to the roles table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES public.roles(role_id) ON DELETE SET NULL;

-- Add an index for faster lookups on role_id
CREATE INDEX IF NOT EXISTS idx_users_role_id ON public.users(role_id);

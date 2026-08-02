-- Migration: Update RBAC to 4 system roles
-- This migration:
--   1. Updates the role table to include Founder, Admin, User (and Guest as virtual)
--   2. Updates the admin table role column to support 'founder'
--   3. Seeds proper permissions for each role
--   4. Preserves backward compatibility with existing data

-- Update existing Admin role level
UPDATE "role" SET "level" = '2', "description" = 'Administrator — email/password authentication, database-driven permissions' WHERE "name" = 'Admin';

-- Update existing User role level
UPDATE "role" SET "level" = '1', "description" = 'Standard user — capabilities depend on subscription, credits, and permissions' WHERE "name" = 'User';

-- Insert Founder role if it doesn't exist
INSERT INTO "role" ("id", "name", "description", "level", "is_system", "created_at", "updated_at")
SELECT 
  'role founder-' || gen_random_uuid(),
  'Founder',
  'Platform founder — created during installation, cannot be deleted or demoted',
  '3',
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM "role" WHERE "name" = 'Founder');

-- Update admin table to support founder role
-- The admin table uses text for role, so no schema change needed
-- Just ensure existing admins have proper roles

-- Update any 'super_admin' roles to 'admin'
UPDATE "admin" SET "role" = 'admin' WHERE "role" = 'super_admin';

-- Seed comprehensive permissions
INSERT INTO "permission" ("id", "key", "description", "category", "created_at")
SELECT 
  'perm-' || gen_random_uuid(),
  p.key,
  p.description,
  p.category,
  NOW()
FROM (VALUES
  ('admin:read', 'Read admin panel data', 'admin'),
  ('admin:write', 'Write admin panel data', 'admin'),
  ('admin:users', 'Manage users', 'admin'),
  ('admin:workspaces', 'Manage workspaces', 'admin'),
  ('admin:ai_providers', 'Manage AI providers', 'admin'),
  ('admin:jobs', 'Manage jobs', 'admin'),
  ('admin:queues', 'Manage queues', 'admin'),
  ('admin:billing', 'Manage billing', 'admin'),
  ('admin:subscriptions', 'Manage subscriptions', 'admin'),
  ('admin:coupons', 'Manage coupons', 'admin'),
  ('admin:analytics', 'View analytics', 'admin'),
  ('admin:audit_logs', 'View audit logs', 'admin'),
  ('admin:feature_flags', 'Manage feature flags', 'admin'),
  ('admin:system', 'System settings', 'admin'),
  ('admin:email', 'Manage email', 'admin'),
  ('admin:commerce', 'Manage commerce', 'admin'),
  ('admin:workflows', 'Manage workflows', 'admin'),
  ('admin:pricing', 'Manage pricing', 'admin'),
  ('admin:landing_builder', 'Manage landing pages', 'admin'),
  ('admin:stats', 'View statistics', 'admin')
) AS p(key, description, category)
WHERE NOT EXISTS (SELECT 1 FROM "permission" WHERE "key" = p.key);

-- Assign permissions to Founder role
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at")
SELECT 
  'rp-' || gen_random_uuid(),
  r.id,
  p.id,
  NOW()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.name = 'Founder'
  AND p.category = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Assign permissions to Admin role
INSERT INTO "role_permission" ("id", "role_id", "permission_id", "created_at")
SELECT 
  'rp-' || gen_random_uuid(),
  r.id,
  p.id,
  NOW()
FROM "role" r
CROSS JOIN "permission" p
WHERE r.name = 'Admin'
  AND p.category = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM "role_permission" rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

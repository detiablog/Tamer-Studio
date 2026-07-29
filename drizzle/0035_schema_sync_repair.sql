-- Migration 0035: Schema synchronization repair
-- Sprint: DB-02 — Database Repair
-- Adds missing columns that Drizzle schema defines but DB doesn't have
-- Never drops tables or data

-- 1. Account table — Better Auth schema update
-- Drizzle defines: account_id, provider_id, access_token_expires_at, refresh_token_expires_at, password, created_at, updated_at
-- DB has: type, provider, providerAccountId, expires_at, token_type, session_state
-- Add missing new columns (old columns remain untouched)
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "account_id" text;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "provider_id" text;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "access_token_expires_at" timestamp;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refresh_token_expires_at" timestamp;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" text;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

-- 2. Admin table — Add last_login_ip, login_attempts, locked_until if missing
ALTER TABLE "admin" ADD COLUMN IF NOT EXISTS "last_login_ip" text;
ALTER TABLE "admin" ADD COLUMN IF NOT EXISTS "login_attempts" integer DEFAULT 0;
ALTER TABLE "admin" ADD COLUMN IF NOT EXISTS "locked_until" timestamp;

-- 3. Admin session — Add last_active_at, is_valid if missing
ALTER TABLE "admin_session" ADD COLUMN IF NOT EXISTS "last_active_at" timestamp;
ALTER TABLE "admin_session" ADD COLUMN IF NOT EXISTS "is_valid" boolean DEFAULT true;

-- 4. AI provider — Add missing columns
ALTER TABLE "ai_provider" ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'openai';
ALTER TABLE "ai_provider" ADD COLUMN IF NOT EXISTS "display_name" text DEFAULT '';
ALTER TABLE "ai_provider" ADD COLUMN IF NOT EXISTS "is_enabled" boolean DEFAULT false;
ALTER TABLE "ai_provider" ADD COLUMN IF NOT EXISTS "credentials_encrypted" text;
ALTER TABLE "ai_provider" ADD COLUMN IF NOT EXISTS "last_health_check" timestamp;
ALTER TABLE "ai_provider" ADD COLUMN IF NOT EXISTS "health_status" text DEFAULT 'unknown';

-- 5. AI provider model — Add missing columns
ALTER TABLE "ai_provider_model" ADD COLUMN IF NOT EXISTS "model" text DEFAULT '';
ALTER TABLE "ai_provider_model" ADD COLUMN IF NOT EXISTS "display_name" text DEFAULT '';
ALTER TABLE "ai_provider_model" ADD COLUMN IF NOT EXISTS "context_length" integer DEFAULT 4096;
ALTER TABLE "ai_provider_model" ADD COLUMN IF NOT EXISTS "max_output" integer DEFAULT 4096;
ALTER TABLE "ai_provider_model" ADD COLUMN IF NOT EXISTS "capabilities" jsonb DEFAULT '[]';
ALTER TABLE "ai_provider_model" ADD COLUMN IF NOT EXISTS "pricing" jsonb DEFAULT '{}';
ALTER TABLE "ai_provider_model" ADD COLUMN IF NOT EXISTS "is_default" boolean DEFAULT false;
ALTER TABLE "ai_provider_model" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true;
ALTER TABLE "ai_provider_model" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;

-- 6. API key — Add rate_limit if missing
ALTER TABLE "api_key" ADD COLUMN IF NOT EXISTS "rate_limit" integer DEFAULT 100;

-- 7. Remove duplicate FK on admin_session.admin_id
ALTER TABLE "admin_session" DROP CONSTRAINT IF EXISTS "admin_session_admin_id_admin_id_fk";

-- 8. Add missing FK indexes
CREATE INDEX IF NOT EXISTS "email_log_queue_id_idx" ON "email_log" USING btree ("queue_id");
CREATE INDEX IF NOT EXISTS "invitation_invited_by_idx" ON "invitation" USING btree ("invited_by");
CREATE INDEX IF NOT EXISTS "workspace_transfer_from_owner_idx" ON "workspace_transfer" USING btree ("from_owner_id");
CREATE INDEX IF NOT EXISTS "workspace_transfer_to_owner_idx" ON "workspace_transfer" USING btree ("to_owner_id");

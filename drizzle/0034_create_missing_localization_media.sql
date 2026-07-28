-- Migration 0034: Create missing localization and media tables
-- Sprint: DBSYNC-01 — Database Synchronization
-- Tables: localization_profile, region, pricing_profile, pricing_rule,
--         payment_profile, payment_method, currency_profile, user_media

-- 1. Localization Profile
CREATE TABLE IF NOT EXISTS "localization_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "locale" text NOT NULL DEFAULT 'en',
  "currency" text NOT NULL DEFAULT 'USD',
  "country" text,
  "timezone" text NOT NULL DEFAULT 'UTC',
  "is_default" boolean NOT NULL DEFAULT false,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "pricing_profile" text DEFAULT 'default',
  "payment_profile" text DEFAULT 'default',
  "country_code" text,
  "supported_currencies" jsonb DEFAULT '["USD"]'::jsonb,
  "supported_languages" jsonb DEFAULT '["en"]'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "localization_profile_code_idx" ON "localization_profile" USING btree ("code");
CREATE INDEX IF NOT EXISTS "localization_profile_enabled_idx" ON "localization_profile" USING btree ("is_enabled");
CREATE INDEX IF NOT EXISTS "localization_profile_default_idx" ON "localization_profile" USING btree ("is_default");

-- 2. Region
CREATE TABLE IF NOT EXISTS "region" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "native_name" text,
  "profile_code" text NOT NULL REFERENCES "localization_profile"("code") ON DELETE restrict,
  "enabled" boolean NOT NULL DEFAULT true,
  "priority" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "region_code_idx" ON "region" USING btree ("code");
CREATE INDEX IF NOT EXISTS "region_profile_idx" ON "region" USING btree ("profile_code");

-- 3. Pricing Profile
CREATE TABLE IF NOT EXISTS "pricing_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text,
  "currency" text NOT NULL DEFAULT 'USD',
  "is_enabled" boolean NOT NULL DEFAULT true,
  "config" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "pricing_profile_code_idx" ON "pricing_profile" USING btree ("code");
CREATE INDEX IF NOT EXISTS "pricing_profile_enabled_idx" ON "pricing_profile" USING btree ("is_enabled");

-- 4. Pricing Rule
CREATE TABLE IF NOT EXISTS "pricing_rule" (
  "id" text PRIMARY KEY NOT NULL,
  "profile_id" text NOT NULL REFERENCES "pricing_profile"("id") ON DELETE cascade,
  "plan_id" text NOT NULL,
  "display_price" text NOT NULL,
  "amount" text NOT NULL,
  "currency" text NOT NULL DEFAULT 'USD',
  "billing_cycle" text NOT NULL DEFAULT 'monthly',
  "is_visible" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "pricing_rule_profile_idx" ON "pricing_rule" USING btree ("profile_id");
CREATE INDEX IF NOT EXISTS "pricing_rule_plan_idx" ON "pricing_rule" USING btree ("plan_id");
CREATE UNIQUE INDEX IF NOT EXISTS "pricing_rule_profile_plan_cycle_unique" ON "pricing_rule" ("profile_id", "plan_id", "billing_cycle");

-- 5. Payment Profile
CREATE TABLE IF NOT EXISTS "payment_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "config" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "payment_profile_code_idx" ON "payment_profile" USING btree ("code");
CREATE INDEX IF NOT EXISTS "payment_profile_enabled_idx" ON "payment_profile" USING btree ("is_enabled");

-- 6. Payment Method
CREATE TABLE IF NOT EXISTS "payment_method" (
  "id" text PRIMARY KEY NOT NULL,
  "profile_id" text NOT NULL REFERENCES "payment_profile"("id") ON DELETE cascade,
  "provider" text NOT NULL,
  "name" text NOT NULL,
  "is_enabled" boolean NOT NULL DEFAULT true,
  "priority" integer NOT NULL DEFAULT 0,
  "config" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "payment_method_profile_idx" ON "payment_method" USING btree ("profile_id");
CREATE UNIQUE INDEX IF NOT EXISTS "payment_method_profile_provider_unique" ON "payment_method" ("profile_id", "provider");

-- 7. Currency Profile
CREATE TABLE IF NOT EXISTS "currency_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "symbol" text NOT NULL,
  "locale" text NOT NULL,
  "minimum_fraction_digits" integer NOT NULL DEFAULT 2,
  "maximum_fraction_digits" integer NOT NULL DEFAULT 2,
  "exchange_rate_to_usd" text NOT NULL DEFAULT '1',
  "is_enabled" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "currency_profile_code_idx" ON "currency_profile" USING btree ("code");
CREATE INDEX IF NOT EXISTS "currency_profile_enabled_idx" ON "currency_profile" USING btree ("is_enabled");

-- 8. User Media
CREATE TABLE IF NOT EXISTS "user_media" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "filename" text NOT NULL,
  "mime_type" text NOT NULL,
  "size_bytes" bigint NOT NULL,
  "kind" text NOT NULL,
  "storage_key" text NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "user_media_user_id_idx" ON "user_media" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "user_media_kind_idx" ON "user_media" USING btree ("kind");
CREATE INDEX IF NOT EXISTS "user_media_status_idx" ON "user_media" USING btree ("status");
CREATE INDEX IF NOT EXISTS "user_media_created_at_idx" ON "user_media" USING btree ("created_at");

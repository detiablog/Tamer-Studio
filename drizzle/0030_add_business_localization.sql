CREATE TABLE IF NOT EXISTS "localization_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "locale" text NOT NULL DEFAULT 'en',
  "currency" text NOT NULL DEFAULT 'USD',
  "country" text,
  "timezone" text NOT NULL DEFAULT 'UTC',
  "is_default" boolean DEFAULT false NOT NULL,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "pricing_profile" text DEFAULT 'default',
  "payment_profile" text DEFAULT 'default',
  "country_code" text,
  "supported_currencies" jsonb DEFAULT '["USD"]' NOT NULL,
  "supported_languages" jsonb DEFAULT '["en"]' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "region" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "native_name" text,
  "profile_code" text NOT NULL REFERENCES "localization_profile"("code") ON DELETE RESTRICT,
  "enabled" boolean DEFAULT true NOT NULL,
  "priority" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pricing_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text,
  "currency" text NOT NULL DEFAULT 'USD',
  "is_enabled" boolean DEFAULT true NOT NULL,
  "config" jsonb DEFAULT '{}' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pricing_rule" (
  "id" text PRIMARY KEY NOT NULL,
  "profile_id" text NOT NULL REFERENCES "pricing_profile"("id") ON DELETE CASCADE,
  "plan_id" text NOT NULL,
  "display_price" text NOT NULL,
  "amount" text NOT NULL,
  "currency" text NOT NULL DEFAULT 'USD',
  "billing_cycle" text NOT NULL DEFAULT 'monthly',
  "is_visible" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payment_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "config" jsonb DEFAULT '{}' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "payment_method" (
  "id" text PRIMARY KEY NOT NULL,
  "profile_id" text NOT NULL REFERENCES "payment_profile"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "name" text NOT NULL,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "priority" integer DEFAULT 0 NOT NULL,
  "config" jsonb DEFAULT '{}' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "currency_profile" (
  "id" text PRIMARY KEY NOT NULL,
  "code" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "symbol" text NOT NULL,
  "locale" text NOT NULL,
  "minimum_fraction_digits" integer DEFAULT 2 NOT NULL,
  "maximum_fraction_digits" integer DEFAULT 2 NOT NULL,
  "exchange_rate_to_usd" text DEFAULT '1' NOT NULL,
  "is_enabled" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "localization_profile_code_idx" ON "localization_profile" USING btree ("code");
CREATE INDEX IF NOT EXISTS "localization_profile_enabled_idx" ON "localization_profile" USING btree ("is_enabled");
CREATE INDEX IF NOT EXISTS "localization_profile_default_idx" ON "localization_profile" USING btree ("is_default");

CREATE INDEX IF NOT EXISTS "region_code_idx" ON "region" USING btree ("code");
CREATE INDEX IF NOT EXISTS "region_profile_idx" ON "region" USING btree ("profile_code");

CREATE INDEX IF NOT EXISTS "pricing_profile_code_idx" ON "pricing_profile" USING btree ("code");
CREATE INDEX IF NOT EXISTS "pricing_profile_enabled_idx" ON "pricing_profile" USING btree ("is_enabled");

CREATE INDEX IF NOT EXISTS "pricing_rule_profile_idx" ON "pricing_rule" USING btree ("profile_id");
CREATE INDEX IF NOT EXISTS "pricing_rule_plan_idx" ON "pricing_rule" USING btree ("plan_id");
CREATE UNIQUE INDEX IF NOT EXISTS "pricing_rule_profile_plan_cycle_unique" ON "pricing_rule" ("profile_id", "plan_id", "billing_cycle");

CREATE INDEX IF NOT EXISTS "payment_profile_code_idx" ON "payment_profile" USING btree ("code");
CREATE INDEX IF NOT EXISTS "payment_profile_enabled_idx" ON "payment_profile" USING btree ("is_enabled");

CREATE INDEX IF NOT EXISTS "payment_method_profile_idx" ON "payment_method" USING btree ("profile_id");
CREATE UNIQUE INDEX IF NOT EXISTS "payment_method_profile_provider_unique" ON "payment_method" ("profile_id", "provider");

CREATE INDEX IF NOT EXISTS "currency_profile_code_idx" ON "currency_profile" USING btree ("code");
CREATE INDEX IF NOT EXISTS "currency_profile_enabled_idx" ON "currency_profile" USING btree ("is_enabled");

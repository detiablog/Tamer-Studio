-- Migration 0033: Commerce plans tables
-- Creates plan, billing_option, plan_pricing, and commerce_order tables

-- 1. Plans - exactly 3 tiers
CREATE TABLE IF NOT EXISTS "plan" (
  "id" text PRIMARY KEY,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text,
  "tier" integer NOT NULL DEFAULT 1,
  "features" jsonb NOT NULL DEFAULT '[]',
  "storage_limit_mb" integer NOT NULL DEFAULT 500,
  "project_limit" integer NOT NULL DEFAULT 3,
  "workspace_limit" integer NOT NULL DEFAULT 1,
  "ai_capabilities" jsonb NOT NULL DEFAULT '[]',
  "permissions" jsonb NOT NULL DEFAULT '[]',
  "is_active" boolean NOT NULL DEFAULT true,
  "display_order" integer NOT NULL DEFAULT 0,
  "badge" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "plan_slug_unique" ON "plan" ("slug");
CREATE INDEX IF NOT EXISTS "plan_tier_idx" ON "plan" ("tier");
CREATE INDEX IF NOT EXISTS "plan_is_active_idx" ON "plan" ("is_active");

-- 2. Billing Options - independent from plans
CREATE TABLE IF NOT EXISTS "billing_option" (
  "id" text PRIMARY KEY,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text,
  "frequency" text NOT NULL,
  "renewal_behavior" text NOT NULL DEFAULT 'auto',
  "is_active" boolean NOT NULL DEFAULT true,
  "display_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "billing_option_slug_unique" ON "billing_option" ("slug");
CREATE INDEX IF NOT EXISTS "billing_option_frequency_idx" ON "billing_option" ("frequency");

-- 3. Plan Pricing - connects plan + billing_option + price
CREATE TABLE IF NOT EXISTS "plan_pricing" (
  "id" text PRIMARY KEY,
  "plan_id" text NOT NULL REFERENCES "plan"("id") ON DELETE CASCADE,
  "billing_option_id" text NOT NULL REFERENCES "billing_option"("id") ON DELETE CASCADE,
  "price" numeric(10, 2) NOT NULL,
  "currency" text NOT NULL DEFAULT 'USD',
  "credits_included" integer NOT NULL DEFAULT 0,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "plan_pricing_plan_option_unique" ON "plan_pricing" ("plan_id", "billing_option_id");
CREATE INDEX IF NOT EXISTS "plan_pricing_plan_id_idx" ON "plan_pricing" ("plan_id");
CREATE INDEX IF NOT EXISTS "plan_pricing_billing_option_id_idx" ON "plan_pricing" ("billing_option_id");

-- 4. Orders - purchase source of truth
CREATE TABLE IF NOT EXISTS "commerce_order" (
  "id" text PRIMARY KEY,
  "workspace_id" text NOT NULL,
  "user_id" text NOT NULL,
  "plan_id" text,
  "billing_option_id" text,
  "status" text NOT NULL DEFAULT 'pending',
  "subtotal" numeric(10, 2) NOT NULL DEFAULT '0',
  "tax" numeric(10, 2) NOT NULL DEFAULT '0',
  "discount" numeric(10, 2) NOT NULL DEFAULT '0',
  "total" numeric(10, 2) NOT NULL DEFAULT '0',
  "currency" text NOT NULL DEFAULT 'USD',
  "credits_granted" integer NOT NULL DEFAULT 0,
  "items" jsonb NOT NULL DEFAULT '[]',
  "metadata" jsonb DEFAULT '{}',
  "expires_at" timestamp,
  "paid_at" timestamp,
  "cancelled_at" timestamp,
  "refunded_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "commerce_order_workspace_id_idx" ON "commerce_order" ("workspace_id");
CREATE INDEX IF NOT EXISTS "commerce_order_user_id_idx" ON "commerce_order" ("user_id");
CREATE INDEX IF NOT EXISTS "commerce_order_status_idx" ON "commerce_order" ("status");
CREATE INDEX IF NOT EXISTS "commerce_order_plan_id_idx" ON "commerce_order" ("plan_id");

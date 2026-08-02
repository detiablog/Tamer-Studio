CREATE TABLE IF NOT EXISTS "product_kpi" (
	"id" text PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"category" varchar(100) NOT NULL,
	"target_value" real,
	"current_value" real,
	"previous_value" real,
	"unit" varchar(50),
	"status" varchar(50) DEFAULT 'unknown' NOT NULL,
	"trend" varchar(50) DEFAULT 'stable' NOT NULL,
	"change_percent" real,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pki_name_idx" ON "product_kpi" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pki_category_idx" ON "product_kpi" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pki_recorded_idx" ON "product_kpi" ("recorded_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_metric" (
	"id" text PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"category" varchar(100) NOT NULL,
	"value" real NOT NULL,
	"dimensions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"date" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pm_name_idx" ON "product_metric" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pm_category_idx" ON "product_metric" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pm_date_idx" ON "product_metric" ("date");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_segment" (
	"id" text PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"description" text,
	"criteria" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"user_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_calculated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ps_name_idx" ON "product_segment" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ps_active_idx" ON "product_segment" ("is_active");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_cohort" (
	"id" text PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"type" varchar(50) NOT NULL,
	"period" varchar(20) NOT NULL,
	"user_count" integer DEFAULT 0 NOT NULL,
	"retention_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pc_type_idx" ON "product_cohort" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pc_period_idx" ON "product_cohort" ("period");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_funnel" (
	"id" text PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_users" integer DEFAULT 0 NOT NULL,
	"conversion_rate" real,
	"period" varchar(20),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pf_name_idx" ON "product_funnel" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pf_period_idx" ON "product_funnel" ("period");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_forecast" (
	"id" text PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"category" varchar(100) NOT NULL,
	"metric" varchar(200) NOT NULL,
	"period" varchar(20) NOT NULL,
	"predicted_value" real NOT NULL,
	"confidence_lower" real,
	"confidence_upper" real,
	"confidence_level" real DEFAULT 0.95,
	"methodology" varchar(100),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pfc_name_idx" ON "product_forecast" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pfc_category_idx" ON "product_forecast" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pfc_metric_idx" ON "product_forecast" ("metric");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pfc_period_idx" ON "product_forecast" ("period");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_report" (
	"id" text PRIMARY KEY,
	"type" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" text,
	"period" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pr_type_idx" ON "product_report" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pr_period_idx" ON "product_report" ("period");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pr_generated_idx" ON "product_report" ("generated_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_dashboard" (
	"id" text PRIMARY KEY,
	"user_id" text,
	"name" varchar(200) NOT NULL,
	"widgets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pd_user_idx" ON "product_dashboard" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pd_default_idx" ON "product_dashboard" ("is_default");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_decision" (
	"id" text PRIMARY KEY,
	"category" varchar(100) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"recommendation" text,
	"confidence" real,
	"rationale" text,
	"impact" varchar(50),
	"priority" varchar(50) DEFAULT 'medium' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pd_category_idx" ON "product_decision" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pd_status_idx" ON "product_decision" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pd_priority_idx" ON "product_decision" ("priority");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_export" (
	"id" text PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"type" varchar(50) NOT NULL,
	"format" varchar(20) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"file_url" text,
	"file_size" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"generated_at" timestamp,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pe_type_idx" ON "product_export" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pe_status_idx" ON "product_export" ("status");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_settings" (
	"id" text PRIMARY KEY,
	"key" varchar(200) NOT NULL,
	"value" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ps_key_idx" ON "product_settings" ("key");

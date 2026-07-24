CREATE TABLE IF NOT EXISTS "production_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"production_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"status" text NOT NULL,
	"ai_model" text,
	"input_tokens" integer DEFAULT 0,
	"output_tokens" integer DEFAULT 0,
	"cost_usd" text DEFAULT '0',
	"execution_time_ms" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_activity_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"action" text NOT NULL,
	"resource_id" text,
	"resource_type" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"date" timestamp NOT NULL,
	"productions_run" integer DEFAULT 0,
	"productions_succeeded" integer DEFAULT 0,
	"productions_failed" integer DEFAULT 0,
	"media_generated" integer DEFAULT 0,
	"total_cost_usd" text DEFAULT '0',
	"total_tokens_used" bigint DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "production_metrics_workspace_idx" ON "production_metrics" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "production_metrics_status_idx" ON "production_metrics" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "production_metrics_created_at_idx" ON "production_metrics" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_activity_metrics_user_idx" ON "user_activity_metrics" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_activity_metrics_workspace_idx" ON "user_activity_metrics" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_activity_metrics_action_idx" ON "user_activity_metrics" USING btree ("action");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_metrics_workspace_idx" ON "workspace_metrics" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_metrics_date_idx" ON "workspace_metrics" USING btree ("date");

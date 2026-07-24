CREATE TABLE IF NOT EXISTS "feature_flag" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"description" text NOT NULL DEFAULT '',
	"enabled" boolean NOT NULL DEFAULT false,
	"scope" text NOT NULL DEFAULT 'global',
	"target_id" text,
	"rollout_percentage" integer,
	"scheduled_at" timestamp,
	"expires_at" timestamp,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_flag_history" (
	"id" text PRIMARY KEY NOT NULL,
	"flag_id" text NOT NULL,
	"action" text NOT NULL,
	"previous_value" jsonb DEFAULT '{}' NOT NULL,
	"new_value" jsonb DEFAULT '{}' NOT NULL,
	"changed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feature_flag_key_idx" ON "feature_flag" USING btree ("key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feature_flag_scope_idx" ON "feature_flag" USING btree ("scope");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feature_flag_enabled_idx" ON "feature_flag" USING btree ("enabled");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feature_flag_history_flag_idx" ON "feature_flag_history" USING btree ("flag_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feature_flag_history_created_at_idx" ON "feature_flag_history" USING btree ("created_at");
--> statement-breakpoint
ALTER TABLE "feature_flag_history" ADD CONSTRAINT "feature_flag_history_flag_id_feature_flag_id_fk" FOREIGN KEY ("flag_id") REFERENCES "public"."feature_flag"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "feature_flag_key_unique" ON "feature_flag" USING btree ("key");

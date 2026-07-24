CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text NOT NULL,
	"actor_id" text,
	"actor_type" text,
	"resource_type" text,
	"resource_id" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_action_idx" ON "audit_log" USING btree ("action");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_actorId_idx" ON "audit_log" USING btree ("actor_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_log_createdAt_idx" ON "audit_log" USING btree ("created_at");

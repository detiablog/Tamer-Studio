CREATE TABLE IF NOT EXISTS "billing" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"plan" text NOT NULL,
	"price" text NOT NULL,
	"currency" text NOT NULL DEFAULT 'USD',
	"billing_cycle" text NOT NULL DEFAULT 'monthly',
	"status" text NOT NULL DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "billing_workspace_idx" ON "billing" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "billing_status_idx" ON "billing" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "billing_plan_idx" ON "billing" USING btree ("plan");

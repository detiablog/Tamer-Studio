CREATE TABLE IF NOT EXISTS "workflow" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"version" text NOT NULL DEFAULT '1.0.0',
	"steps" jsonb DEFAULT '[]' NOT NULL,
	"variables" jsonb DEFAULT '[]' NOT NULL,
	"tags" jsonb DEFAULT '[]' NOT NULL,
	"status" text NOT NULL DEFAULT 'draft',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_execution" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"status" text NOT NULL DEFAULT 'queued',
	"context" jsonb DEFAULT '{}' NOT NULL,
	"result" jsonb,
	"error" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_status_idx" ON "workflow" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_name_idx" ON "workflow" USING btree ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_execution_workflow_idx" ON "workflow_execution" USING btree ("workflow_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_execution_status_idx" ON "workflow_execution" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workflow_execution_created_at_idx" ON "workflow_execution" USING btree ("created_at");
--> statement-breakpoint
ALTER TABLE "workflow_execution" ADD CONSTRAINT "workflow_execution_workflow_id_workflow_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflow"("id") ON DELETE cascade ON UPDATE no action;

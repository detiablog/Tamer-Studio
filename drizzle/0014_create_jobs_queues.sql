CREATE TABLE IF NOT EXISTS "job" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"status" text NOT NULL DEFAULT 'queued',
	"priority" text NOT NULL DEFAULT 'normal',
	"progress" integer NOT NULL DEFAULT 0,
	"attempts" integer NOT NULL DEFAULT 0,
	"max_attempts" integer NOT NULL DEFAULT 3,
	"result" jsonb,
	"error" text,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "queue" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"depth" integer NOT NULL DEFAULT 0,
	"throughput" text,
	"avg_wait" text,
	"status" text NOT NULL DEFAULT 'active',
	"failed" integer NOT NULL DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_status_idx" ON "job" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_type_idx" ON "job" USING btree ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_priority_idx" ON "job" USING btree ("priority");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_created_at_idx" ON "job" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "queue_status_idx" ON "queue" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "queue_name_idx" ON "queue" USING btree ("name");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "queue_name_unique" ON "queue" USING btree ("name");

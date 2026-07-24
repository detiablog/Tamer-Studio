CREATE TABLE IF NOT EXISTS "notification_template" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"channel" text NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"variables" jsonb DEFAULT '[]' NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_template_version" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"version" text NOT NULL,
	"subject" text,
	"body" text NOT NULL,
	"variables" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"channel" text NOT NULL,
	"category" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"channel" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb DEFAULT '{}' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"read_at" timestamp,
	"archived_at" timestamp,
	"deleted_at" timestamp,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"next_attempt_at" timestamp,
	"last_error" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp,
	"failed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_template_category_idx" ON "notification_template" USING btree ("category");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_template_channel_idx" ON "notification_template" USING btree ("channel");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_template_version_template_idx" ON "notification_template_version" USING btree ("template_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_preference_user_id_idx" ON "notification_preference" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_user_id_idx" ON "notification" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_status_idx" ON "notification" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_category_idx" ON "notification" USING btree ("category");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_created_at_idx" ON "notification" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_queue_status_idx" ON "event_queue" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_queue_next_attempt_idx" ON "event_queue" USING btree ("next_attempt_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "event_queue_event_type_idx" ON "event_queue" USING btree ("event_type");
--> statement-breakpoint
ALTER TABLE "notification_template_version" ADD CONSTRAINT "notification_template_version_template_id_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."notification_template"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_preference_unique" ON "notification_preference" USING btree ("user_id", "channel", "category");

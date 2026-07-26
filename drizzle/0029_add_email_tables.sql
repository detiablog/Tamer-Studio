CREATE TABLE IF NOT EXISTS "email_provider" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"routing_mode" text DEFAULT 'priority' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"credentials_encrypted" text,
	"sender_name" text,
	"sender_email" text NOT NULL,
	"reply_to" text,
	"daily_limit" integer DEFAULT 0 NOT NULL,
	"monthly_limit" integer DEFAULT 0 NOT NULL,
	"timeout" integer DEFAULT 30 NOT NULL,
	"retry_count" integer DEFAULT 3 NOT NULL,
	"webhook_secret" text,
	"domain" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_tested_at" timestamp,
	"last_test_status" text,
	"last_test_error" text,
	CONSTRAINT "email_provider_name_unique" UNIQUE("name"),
	CONSTRAINT "email_provider_priority_unique" UNIQUE("priority")
);

CREATE TABLE IF NOT EXISTS "email_provider_health" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"status" text DEFAULT 'healthy' NOT NULL,
	"latency_ms" integer,
	"last_success_at" timestamp,
	"last_failure_at" timestamp,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"error_code" text,
	"checked_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"html" text,
	"text" text,
	"from" text,
	"replyTo" text,
	"cc" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bcc" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"headers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"failed_at" timestamp,
	"error" text,
	"response" jsonb,
	"provider_id" text,
	"provider_name" text,
	"latency_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_log" (
	"id" text PRIMARY KEY NOT NULL,
	"queue_id" text,
	"type" text NOT NULL,
	"to" text NOT NULL,
	"subject" text NOT NULL,
	"from" text,
	"replyTo" text,
	"provider_id" text,
	"provider_name" text,
	"status" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer,
	"response_code" integer,
	"response_message" text,
	"error_code" text,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_token" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"user_id" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_token_token_unique" UNIQUE("token")
);

CREATE TABLE IF NOT EXISTS "email_template" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"subject" text NOT NULL,
	"html" text NOT NULL,
	"text" text,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	"updated_by" text,
	CONSTRAINT "email_template_key_unique" UNIQUE("key")
);

CREATE TABLE IF NOT EXISTS "email_statistics" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text,
	"date" timestamp NOT NULL,
	"sent" integer DEFAULT 0 NOT NULL,
	"delivered" integer DEFAULT 0 NOT NULL,
	"failed" integer DEFAULT 0 NOT NULL,
	"retry" integer DEFAULT 0 NOT NULL,
	"bounce" integer DEFAULT 0 NOT NULL,
	"avg_latency_ms" integer,
	"quota_used" integer DEFAULT 0 NOT NULL,
	"quota_total" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_statistics_provider_date_unique" UNIQUE("provider_id","date")
);

ALTER TABLE "email_provider_health" ADD CONSTRAINT "email_provider_health_provider_id_email_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."email_provider"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "email_queue" ADD CONSTRAINT "email_queue_provider_id_email_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."email_provider"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_queue_id_email_queue_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."email_queue"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_provider_id_email_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."email_provider"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "email_statistics" ADD CONSTRAINT "email_statistics_provider_id_email_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."email_provider"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "email_provider_active_idx" ON "email_provider" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "email_provider_priority_idx" ON "email_provider" USING btree ("priority");
CREATE INDEX IF NOT EXISTS "email_provider_type_idx" ON "email_provider" USING btree ("type");
CREATE INDEX IF NOT EXISTS "email_provider_health_provider_idx" ON "email_provider_health" USING btree ("provider_id");
CREATE INDEX IF NOT EXISTS "email_provider_health_status_idx" ON "email_provider_health" USING btree ("status");
CREATE INDEX IF NOT EXISTS "email_provider_health_checked_idx" ON "email_provider_health" USING btree ("checked_at");
CREATE INDEX IF NOT EXISTS "email_queue_status_idx" ON "email_queue" USING btree ("status");
CREATE INDEX IF NOT EXISTS "email_queue_type_idx" ON "email_queue" USING btree ("type");
CREATE INDEX IF NOT EXISTS "email_queue_priority_idx" ON "email_queue" USING btree ("priority");
CREATE INDEX IF NOT EXISTS "email_queue_provider_idx" ON "email_queue" USING btree ("provider_id");
CREATE INDEX IF NOT EXISTS "email_queue_created_idx" ON "email_queue" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "email_queue_scheduled_idx" ON "email_queue" USING btree ("scheduled_at");
CREATE INDEX IF NOT EXISTS "email_log_status_idx" ON "email_log" USING btree ("status");
CREATE INDEX IF NOT EXISTS "email_log_type_idx" ON "email_log" USING btree ("type");
CREATE INDEX IF NOT EXISTS "email_log_provider_idx" ON "email_log" USING btree ("provider_id");
CREATE INDEX IF NOT EXISTS "email_log_created_idx" ON "email_log" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "email_log_to_idx" ON "email_log" USING btree ("to");
CREATE INDEX IF NOT EXISTS "email_token_email_idx" ON "email_token" USING btree ("email");
CREATE INDEX IF NOT EXISTS "email_token_type_idx" ON "email_token" USING btree ("type");
CREATE INDEX IF NOT EXISTS "email_token_expires_idx" ON "email_token" USING btree ("expires_at");
CREATE INDEX IF NOT EXISTS "email_token_user_idx" ON "email_token" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "email_template_type_idx" ON "email_template" USING btree ("type");
CREATE INDEX IF NOT EXISTS "email_template_active_idx" ON "email_template" USING btree ("is_active");
CREATE INDEX IF NOT EXISTS "email_statistics_provider_idx" ON "email_statistics" USING btree ("provider_id");
CREATE INDEX IF NOT EXISTS "email_statistics_date_idx" ON "email_statistics" USING btree ("date");

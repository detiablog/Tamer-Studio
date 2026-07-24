CREATE TABLE IF NOT EXISTS "webhook_log" (
  "id" text PRIMARY KEY NOT NULL,
  "event_type" text NOT NULL,
  "endpoint" text NOT NULL,
  "payload" jsonb NOT NULL DEFAULT '{}',
  "response_status" integer,
  "response_body" jsonb,
  "error_message" text,
  "attempts" integer NOT NULL DEFAULT 1,
  "max_attempts" integer NOT NULL DEFAULT 3,
  "next_attempt_at" timestamp,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "webhook_log_event_idx" ON "webhook_log" USING btree ("event_type");
CREATE INDEX IF NOT EXISTS "webhook_log_status_idx" ON "webhook_log" USING btree ("status");
CREATE INDEX IF NOT EXISTS "webhook_log_endpoint_idx" ON "webhook_log" USING btree ("endpoint");
CREATE INDEX IF NOT EXISTS "webhook_log_created_idx" ON "webhook_log" USING btree ("created_at");
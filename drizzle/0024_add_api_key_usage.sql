CREATE TABLE IF NOT EXISTS "api_key_usage" (
  "id" text PRIMARY KEY NOT NULL,
  "api_key_id" text NOT NULL REFERENCES "api_key"("id") ON DELETE CASCADE,
  "workspace_id" text NOT NULL,
  "endpoint" text NOT NULL,
  "method" text NOT NULL,
  "status_code" integer NOT NULL,
  "response_time_ms" integer,
  "ip_address" text,
  "user_agent" text,
  "request_size" integer,
  "response_size" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "api_key_usage_api_key_idx" ON "api_key_usage" USING btree ("api_key_id");
CREATE INDEX IF NOT EXISTS "api_key_usage_workspace_idx" ON "api_key_usage" USING btree ("workspace_id");
CREATE INDEX IF NOT EXISTS "api_key_usage_endpoint_idx" ON "api_key_usage" USING btree ("endpoint");
CREATE INDEX IF NOT EXISTS "api_key_usage_created_idx" ON "api_key_usage" USING btree ("created_at");
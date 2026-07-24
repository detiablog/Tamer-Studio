CREATE TABLE IF NOT EXISTS "system_settings" (
  "id" text PRIMARY KEY NOT NULL,
  "key" text NOT NULL UNIQUE,
  "value" jsonb NOT NULL DEFAULT '{}',
  "type" text NOT NULL DEFAULT 'string',
  "category" text NOT NULL DEFAULT 'general',
  "description" text,
  "is_sensitive" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "system_settings_category_idx" ON "system_settings" USING btree ("category");
CREATE INDEX IF NOT EXISTS "system_settings_key_idx" ON "system_settings" USING btree ("key");
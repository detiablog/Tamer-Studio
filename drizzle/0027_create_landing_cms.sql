CREATE TABLE IF NOT EXISTS "landing_section" (
  "id" text PRIMARY KEY NOT NULL,
  "key" text NOT NULL UNIQUE,
  "type" text NOT NULL DEFAULT 'hero',
  "title" text NOT NULL DEFAULT '',
  "subtitle" text,
  "content" jsonb NOT NULL DEFAULT '{}',
  "order" integer NOT NULL DEFAULT 0,
  "is_visible" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "landing_media" (
  "id" text PRIMARY KEY NOT NULL,
  "section_key" text NOT NULL REFERENCES "landing_section" ("key") ON DELETE CASCADE,
  "url" text NOT NULL,
  "alt" text DEFAULT '',
  "type" text NOT NULL DEFAULT 'image',
  "order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "landing_section_key_idx" ON "landing_section" ("key");
CREATE INDEX IF NOT EXISTS "landing_section_order_idx" ON "landing_section" ("order");
CREATE INDEX IF NOT EXISTS "landing_section_type_idx" ON "landing_section" ("type");
CREATE INDEX IF NOT EXISTS "landing_section_visible_idx" ON "landing_section" ("is_visible");

CREATE INDEX IF NOT EXISTS "landing_media_section_key_idx" ON "landing_media" ("section_key");
CREATE INDEX IF NOT EXISTS "landing_media_type_idx" ON "landing_media" ("type");
CREATE INDEX IF NOT EXISTS "landing_media_order_idx" ON "landing_media" ("order");

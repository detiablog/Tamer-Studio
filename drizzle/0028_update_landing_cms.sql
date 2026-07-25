ALTER TABLE "landing_section" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "landing_section" ADD COLUMN IF NOT EXISTS "component" text NOT NULL DEFAULT '';
ALTER TABLE "landing_section" ADD COLUMN IF NOT EXISTS "locked" boolean NOT NULL DEFAULT false;
ALTER TABLE "landing_section" ADD COLUMN IF NOT EXISTS "config" jsonb NOT NULL DEFAULT '{}';
ALTER TABLE "landing_section" ADD COLUMN IF NOT EXISTS "styles" jsonb NOT NULL DEFAULT '{}';

ALTER TABLE "landing_section" RENAME COLUMN IF EXISTS "key" TO "section_key";
ALTER TABLE "landing_section" RENAME COLUMN IF EXISTS "is_visible" TO "visible";

ALTER TABLE "landing_section" ALTER COLUMN "section_key" SET NOT NULL;
ALTER TABLE "landing_section" ALTER COLUMN "title" SET NOT NULL;

ALTER TABLE "landing_section" ALTER COLUMN "section_key" DROP DEFAULT;
ALTER TABLE "landing_section" ALTER COLUMN "section_key" SET DEFAULT '';

CREATE UNIQUE INDEX IF NOT EXISTS "landing_section_section_key_unique" ON "landing_section" ("section_key");
CREATE INDEX IF NOT EXISTS "landing_section_section_key_idx" ON "landing_section" ("section_key");
CREATE INDEX IF NOT EXISTS "landing_section_order_idx" ON "landing_section" ("order");
CREATE INDEX IF NOT EXISTS "landing_section_type_idx" ON "landing_section" ("type");
CREATE INDEX IF NOT EXISTS "landing_section_visible_idx" ON "landing_section" ("visible");
CREATE INDEX IF NOT EXISTS "landing_section_locked_idx" ON "landing_section" ("locked");

ALTER TABLE "landing_media" ALTER COLUMN "section_key" DROP DEFAULT;
ALTER TABLE "landing_media" ALTER COLUMN "section_key" SET DEFAULT '';

CREATE INDEX IF NOT EXISTS "landing_media_section_key_idx" ON "landing_media" ("section_key");
CREATE INDEX IF NOT EXISTS "landing_media_type_idx" ON "landing_media" ("type");
CREATE INDEX IF NOT EXISTS "landing_media_order_idx" ON "landing_media" ("order");

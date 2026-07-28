-- Migration: Create CMS Engine tables
-- Sprint: CMS-01 B8 — Landing Builder Runtime

-- CMS Pages
CREATE TABLE IF NOT EXISTS "cms_page" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL DEFAULT '',
  "slug" text NOT NULL DEFAULT '',
  "status" varchar(20) NOT NULL DEFAULT 'draft',
  "content_type" varchar(20) NOT NULL DEFAULT 'page',
  "parent_id" text,
  "seo_title" text,
  "seo_description" text,
  "seo_og_image" text,
  "seo_canonical" text,
  "seo_robots" text,
  "localization_locale" varchar(10) NOT NULL DEFAULT 'en',
  "localization_fallback_locale" varchar(10) NOT NULL DEFAULT 'en',
  "localization_translations" jsonb NOT NULL DEFAULT '{}',
  "permissions_read" jsonb NOT NULL DEFAULT '["admin","editor","author","viewer"]',
  "permissions_write" jsonb NOT NULL DEFAULT '["admin","editor"]',
  "permissions_publish" jsonb NOT NULL DEFAULT '["admin"]',
  "version" integer NOT NULL DEFAULT 1,
  "published_version" integer,
  "scheduled_at" timestamp,
  "published_at" timestamp,
  "author_id" text NOT NULL,
  "deleted_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "cms_page_slug_unique" ON "cms_page" ("slug");
CREATE INDEX IF NOT EXISTS "cms_page_slug_idx" ON "cms_page" ("slug");
CREATE INDEX IF NOT EXISTS "cms_page_status_idx" ON "cms_page" ("status");
CREATE INDEX IF NOT EXISTS "cms_page_content_type_idx" ON "cms_page" ("content_type");
CREATE INDEX IF NOT EXISTS "cms_page_parent_id_idx" ON "cms_page" ("parent_id");
CREATE INDEX IF NOT EXISTS "cms_page_author_id_idx" ON "cms_page" ("author_id");

-- CMS Sections
CREATE TABLE IF NOT EXISTS "cms_section" (
  "id" text PRIMARY KEY,
  "page_id" text NOT NULL REFERENCES "cms_page" ("id") ON DELETE CASCADE,
  "section_key" text NOT NULL DEFAULT '',
  "type" text NOT NULL DEFAULT 'hero',
  "title" text NOT NULL DEFAULT '',
  "description" text,
  "component" text DEFAULT '',
  "order" integer NOT NULL DEFAULT 0,
  "visible" boolean NOT NULL DEFAULT true,
  "locked" boolean NOT NULL DEFAULT false,
  "config" jsonb NOT NULL DEFAULT '{}',
  "styles" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "cms_section_section_key_unique" ON "cms_section" ("section_key");
CREATE INDEX IF NOT EXISTS "cms_section_page_id_idx" ON "cms_section" ("page_id");
CREATE INDEX IF NOT EXISTS "cms_section_section_key_idx" ON "cms_section" ("section_key");
CREATE INDEX IF NOT EXISTS "cms_section_order_idx" ON "cms_section" ("order");
CREATE INDEX IF NOT EXISTS "cms_section_type_idx" ON "cms_section" ("type");
CREATE INDEX IF NOT EXISTS "cms_section_visible_idx" ON "cms_section" ("visible");

-- CMS Blocks
CREATE TABLE IF NOT EXISTS "cms_block" (
  "id" text PRIMARY KEY,
  "section_id" text NOT NULL REFERENCES "cms_section" ("id") ON DELETE CASCADE,
  "type" text NOT NULL DEFAULT 'text',
  "properties" jsonb NOT NULL DEFAULT '{}',
  "order" integer NOT NULL DEFAULT 0,
  "visible" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "cms_block_section_id_idx" ON "cms_block" ("section_id");
CREATE INDEX IF NOT EXISTS "cms_block_order_idx" ON "cms_block" ("order");

-- CMS Components
CREATE TABLE IF NOT EXISTS "cms_component" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL DEFAULT '',
  "type" text NOT NULL DEFAULT 'custom',
  "schema" jsonb NOT NULL DEFAULT '{}',
  "preview" text,
  "localization" boolean NOT NULL DEFAULT true,
  "permissions" jsonb NOT NULL DEFAULT '[]',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "cms_component_type_idx" ON "cms_component" ("type");

-- CMS Media
CREATE TABLE IF NOT EXISTS "cms_media" (
  "id" text PRIMARY KEY,
  "filename" text NOT NULL DEFAULT '',
  "url" text NOT NULL DEFAULT '',
  "alt" text,
  "type" text NOT NULL DEFAULT 'image',
  "size" integer NOT NULL DEFAULT 0,
  "folder" text,
  "metadata" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "cms_media_type_idx" ON "cms_media" ("type");
CREATE INDEX IF NOT EXISTS "cms_media_folder_idx" ON "cms_media" ("folder");

-- CMS Versions
CREATE TABLE IF NOT EXISTS "cms_version" (
  "id" text PRIMARY KEY,
  "content_id" text NOT NULL,
  "content_type" varchar(20) NOT NULL DEFAULT 'page',
  "version" integer NOT NULL DEFAULT 1,
  "data" jsonb NOT NULL DEFAULT '{}',
  "author_id" text NOT NULL,
  "message" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "cms_version_content_id_idx" ON "cms_version" ("content_id");
CREATE INDEX IF NOT EXISTS "cms_version_content_type_idx" ON "cms_version" ("content_type");
CREATE INDEX IF NOT EXISTS "cms_version_created_at_idx" ON "cms_version" ("created_at");

-- CMS Publish Pipeline
CREATE TABLE IF NOT EXISTS "cms_publish_pipeline" (
  "id" text PRIMARY KEY,
  "content_id" text NOT NULL,
  "content_type" varchar(20) NOT NULL DEFAULT 'page',
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "cms_publish_pipeline_content_id_idx" ON "cms_publish_pipeline" ("content_id");
CREATE INDEX IF NOT EXISTS "cms_publish_pipeline_status_idx" ON "cms_publish_pipeline" ("status");

-- CMS Publish Steps
CREATE TABLE IF NOT EXISTS "cms_publish_step" (
  "id" text PRIMARY KEY,
  "pipeline_id" text NOT NULL REFERENCES "cms_publish_pipeline" ("id") ON DELETE CASCADE,
  "name" text NOT NULL DEFAULT '',
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "started_at" timestamp,
  "completed_at" timestamp,
  "error" text
);

CREATE INDEX IF NOT EXISTS "cms_publish_step_pipeline_id_idx" ON "cms_publish_step" ("pipeline_id");
CREATE INDEX IF NOT EXISTS "cms_publish_step_status_idx" ON "cms_publish_step" ("status");

-- CMS Audit Entries
CREATE TABLE IF NOT EXISTS "cms_audit_entry" (
  "id" text PRIMARY KEY,
  "action" varchar(20) NOT NULL DEFAULT 'edit',
  "content_type" varchar(20) NOT NULL DEFAULT 'page',
  "content_id" text NOT NULL,
  "author_id" text NOT NULL,
  "timestamp" timestamp NOT NULL DEFAULT now(),
  "metadata" jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS "cms_audit_entry_content_id_idx" ON "cms_audit_entry" ("content_id");
CREATE INDEX IF NOT EXISTS "cms_audit_entry_content_type_idx" ON "cms_audit_entry" ("content_type");
CREATE INDEX IF NOT EXISTS "cms_audit_entry_timestamp_idx" ON "cms_audit_entry" ("timestamp");
CREATE INDEX IF NOT EXISTS "cms_audit_entry_author_id_idx" ON "cms_audit_entry" ("author_id");

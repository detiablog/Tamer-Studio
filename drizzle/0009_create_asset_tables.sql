CREATE TABLE IF NOT EXISTS "asset" (
	"asset_id" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"status" text NOT NULL DEFAULT 'draft',
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"source_execution_id" text,
	"source_workflow_id" text,
	"source_gateway_id" text,
	"source_prompt_id" text,
	"source_capability_id" text,
	"current_version" text NOT NULL DEFAULT '1.0.0',
	"storage_ref" jsonb DEFAULT '{}' NOT NULL,
	"preview" jsonb DEFAULT '{}' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asset_version" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"version" text NOT NULL,
	"changelog" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"storage_ref" jsonb DEFAULT '{}' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asset_lineage" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"parent_id" text NOT NULL,
	"relationship" text NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asset_collection" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"visibility" text NOT NULL DEFAULT 'private',
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asset_collection_item" (
	"id" text PRIMARY KEY NOT NULL,
	"collection_id" text NOT NULL,
	"asset_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asset_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asset_lifecycle_event" (
	"id" text PRIMARY KEY NOT NULL,
	"asset_id" text NOT NULL,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"trigger" text NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_kind_idx" ON "asset" USING btree ("kind");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_status_idx" ON "asset" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_created_by_idx" ON "asset" USING btree ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_source_execution_idx" ON "asset" USING btree ("source_execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_source_workflow_idx" ON "asset" USING btree ("source_workflow_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_version_asset_id_idx" ON "asset_version" USING btree ("asset_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_lineage_asset_id_idx" ON "asset_lineage" USING btree ("asset_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_lineage_parent_id_idx" ON "asset_lineage" USING btree ("parent_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_collection_created_by_idx" ON "asset_collection" USING btree ("created_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_collection_item_collection_id_idx" ON "asset_collection_item" USING btree ("collection_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_collection_item_asset_id_idx" ON "asset_collection_item" USING btree ("asset_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_tag_asset_id_idx" ON "asset_tag" USING btree ("asset_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_tag_tag_idx" ON "asset_tag" USING btree ("tag");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_lifecycle_asset_id_idx" ON "asset_lifecycle_event" USING btree ("asset_id");
--> statement-breakpoint
ALTER TABLE "asset_version" ADD CONSTRAINT "asset_version_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("asset_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "asset_lineage" ADD CONSTRAINT "asset_lineage_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("asset_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "asset_lineage" ADD CONSTRAINT "asset_lineage_parent_id_asset_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."asset"("asset_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "asset_collection_item" ADD CONSTRAINT "asset_collection_item_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."asset_collection"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "asset_collection_item" ADD CONSTRAINT "asset_collection_item_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("asset_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "asset_tag" ADD CONSTRAINT "asset_tag_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("asset_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "asset_lifecycle_event" ADD CONSTRAINT "asset_lifecycle_event_asset_id_asset_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."asset"("asset_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "asset_version_unique" ON "asset" USING btree ("asset_id", "current_version");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "asset_collection_unique" ON "asset_collection_item" USING btree ("collection_id", "asset_id");

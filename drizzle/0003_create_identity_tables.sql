CREATE TABLE IF NOT EXISTS "user_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"avatar" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"country" text,
	"status" text NOT NULL DEFAULT 'active',
	"verification_status" text NOT NULL DEFAULT 'unverified',
	"suspended_at" timestamp,
	"suspended_by" text,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "external_identity" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"linked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"preferences" jsonb DEFAULT '{}' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"level" text NOT NULL DEFAULT '0',
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "permission" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"description" text,
	"category" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permission_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "role_permission" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"permission_id" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_profile_status_idx" ON "user_profile" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_profile_userId_idx" ON "user_profile" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "external_identity_userId_idx" ON "external_identity" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "external_identity_provider_idx" ON "external_identity" USING btree ("provider");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_level_idx" ON "role" USING btree ("level");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "permission_key_idx" ON "permission" USING btree ("key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "permission_category_idx" ON "permission" USING btree ("category");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_permission_roleId_idx" ON "role_permission" USING btree ("role_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_permission_permissionId_idx" ON "role_permission" USING btree ("permission_id");
--> statement-breakpoint
ALTER TABLE "external_identity" ADD CONSTRAINT "external_identity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permission"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "role_permission_unique" ON "role_permission" USING btree ("role_id", "permission_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "external_identity_user_provider_unique" ON "external_identity" USING btree ("user_id", "provider");

CREATE TABLE IF NOT EXISTS "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"owner_id" text NOT NULL,
	"settings" jsonb DEFAULT '{}' NOT NULL,
	"status" text NOT NULL DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"type" text NOT NULL DEFAULT 'personal',
	"owner_id" text NOT NULL,
	"organization_id" text,
	"settings" jsonb DEFAULT '{}' NOT NULL,
	"limits" jsonb DEFAULT '{}' NOT NULL,
	"status" text NOT NULL DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workspace_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_member" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role_id" text,
	"status" text NOT NULL DEFAULT 'active',
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"invited_by" text,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role_id" text,
	"status" text NOT NULL DEFAULT 'active',
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"workspace_id" text,
	"organization_id" text,
	"role_id" text,
	"token" text NOT NULL,
	"invited_by" text NOT NULL,
	"status" text NOT NULL DEFAULT 'pending',
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "api_key" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text,
	"name" text NOT NULL,
	"key_prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"scopes" jsonb DEFAULT '[]' NOT NULL,
	"expires_at" timestamp,
	"last_used_at" timestamp,
	"usage_count" text NOT NULL DEFAULT '0',
	"is_revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspace_transfer" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"from_owner_id" text NOT NULL,
	"to_owner_id" text NOT NULL,
	"transferred_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_ownerId_idx" ON "organization" USING btree ("owner_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_slug_idx" ON "organization" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_status_idx" ON "organization" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_ownerId_idx" ON "workspace" USING btree ("owner_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_organizationId_idx" ON "workspace" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_slug_idx" ON "workspace" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_status_idx" ON "workspace" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_member_workspaceId_idx" ON "workspace_member" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_member_userId_idx" ON "workspace_member" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_member_status_idx" ON "workspace_member" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_member_organizationId_idx" ON "organization_member" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_member_userId_idx" ON "organization_member" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organization_member_status_idx" ON "organization_member" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitation_workspaceId_idx" ON "invitation" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitation_email_idx" ON "invitation" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitation_status_idx" ON "invitation" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invitation_token_idx" ON "invitation" USING btree ("token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_key_userId_idx" ON "api_key" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_key_workspaceId_idx" ON "api_key" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_key_keyPrefix_idx" ON "api_key" USING btree ("key_prefix");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "api_key_isRevoked_idx" ON "api_key" USING btree ("is_revoked");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_transfer_workspaceId_idx" ON "workspace_transfer" USING btree ("workspace_id");
--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workspace_transfer" ADD CONSTRAINT "workspace_transfer_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workspace_transfer" ADD CONSTRAINT "workspace_transfer_from_owner_id_user_id_fk" FOREIGN KEY ("from_owner_id") REFERENCES "public"."user"("id") ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "workspace_transfer" ADD CONSTRAINT "workspace_transfer_to_owner_id_user_id_fk" FOREIGN KEY ("to_owner_id") REFERENCES "public"."user"("id") ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "workspace_member_unique" ON "workspace_member" USING btree ("workspace_id", "user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "organization_member_unique" ON "organization_member" USING btree ("organization_id", "user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invitation_token_unique" ON "invitation" USING btree ("token");

CREATE TABLE IF NOT EXISTS "admin" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL DEFAULT 'admin',
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_session" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"admin_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_email_idx" ON "admin" USING btree ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_role_idx" ON "admin" USING btree ("role");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_session_token_idx" ON "admin_session" USING btree ("token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "admin_session_adminId_idx" ON "admin_session" USING btree ("admin_id");
--> statement-breakpoint
ALTER TABLE "admin_session" ADD CONSTRAINT "admin_session_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admin_email_unique" ON "admin" USING btree ("email");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admin_session_token_unique" ON "admin_session" USING btree ("token");

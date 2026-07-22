CREATE TABLE "failed_login_attempt" (
    "id" text PRIMARY KEY NOT NULL,
    "email" text NOT NULL,
    "identifier" text NOT NULL,
    "reason" text NOT NULL,
    "user_agent" text,
    "ip_address" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "failed_login_email_idx" ON "failed_login_attempt" USING btree ("email");
--> statement-breakpoint
CREATE INDEX "failed_login_identifier_idx" ON "failed_login_attempt" USING btree ("identifier");
--> statement-breakpoint
CREATE INDEX "failed_login_created_at_idx" ON "failed_login_attempt" USING btree ("created_at");

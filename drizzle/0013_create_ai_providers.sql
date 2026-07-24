CREATE TABLE IF NOT EXISTS "ai_provider" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"provider_type" text NOT NULL,
	"status" text NOT NULL DEFAULT 'active',
	"priority" integer NOT NULL DEFAULT 0,
	"enabled" boolean NOT NULL DEFAULT true,
	"api_key_configured" boolean NOT NULL DEFAULT false,
	"capabilities" jsonb DEFAULT '[]' NOT NULL,
	"models" jsonb DEFAULT '[]' NOT NULL,
	"rate_limit" jsonb,
	"cost_configuration" jsonb,
	"config" jsonb,
	"health" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_provider_model" (
	"id" text PRIMARY KEY NOT NULL,
	"provider_id" text NOT NULL,
	"model_id" text NOT NULL,
	"capability" text NOT NULL,
	"available" boolean NOT NULL DEFAULT true,
	"deprecated" boolean NOT NULL DEFAULT false,
	"deprecation_date" timestamp,
	"replacement_model" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_provider_name_idx" ON "ai_provider" USING btree ("name");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_provider_status_idx" ON "ai_provider" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_provider_enabled_idx" ON "ai_provider" USING btree ("enabled");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_provider_model_provider_idx" ON "ai_provider_model" USING btree ("provider_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_provider_model_model_idx" ON "ai_provider_model" USING btree ("model_id");
--> statement-breakpoint
ALTER TABLE "ai_provider_model" ADD CONSTRAINT "ai_provider_model_provider_id_ai_provider_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_provider"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ai_provider_name_unique" ON "ai_provider" USING btree ("name");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ai_provider_model_unique" ON "ai_provider_model" USING btree ("provider_id", "model_id");

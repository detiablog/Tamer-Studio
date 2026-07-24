CREATE TABLE IF NOT EXISTS "wallet" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"available_credits" text NOT NULL DEFAULT '0',
	"reserved_credits" text NOT NULL DEFAULT '0',
	"pending_credits" text NOT NULL DEFAULT '0',
	"currency" text NOT NULL DEFAULT 'USD',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"type" text NOT NULL,
	"amount" text NOT NULL,
	"balance_before" text NOT NULL,
	"balance_after" text NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credit_reservation" (
	"id" text PRIMARY KEY NOT NULL,
	"wallet_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"execution_id" text NOT NULL,
	"amount" text NOT NULL,
	"status" text NOT NULL DEFAULT 'active',
	"converted_transaction_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"released_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usage_record" (
	"id" text PRIMARY KEY NOT NULL,
	"execution_id" text NOT NULL,
	"workflow_id" text,
	"request_id" text,
	"user_id" text,
	"workspace_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"model_id" text NOT NULL,
	"capability_id" text NOT NULL,
	"tokens" text,
	"images" text,
	"video_seconds" text,
	"audio_seconds" text,
	"storage_bytes" text,
	"execution_time_ms" text,
	"estimated_cost" text NOT NULL,
	"actual_cost" text,
	"currency" text NOT NULL DEFAULT 'USD',
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cost_record" (
	"id" text PRIMARY KEY NOT NULL,
	"execution_id" text NOT NULL,
	"usage_record_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"capability_id" text NOT NULL,
	"input_units" text NOT NULL DEFAULT '0',
	"output_units" text NOT NULL DEFAULT '0',
	"input_cost" text NOT NULL DEFAULT '0',
	"output_cost" text NOT NULL DEFAULT '0',
	"total_cost" text NOT NULL DEFAULT '0',
	"currency" text NOT NULL DEFAULT 'USD',
	"pricing_used" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"plan_id" text NOT NULL,
	"status" text NOT NULL DEFAULT 'active',
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" text NOT NULL DEFAULT 'false',
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"subscription_id" text,
	"status" text NOT NULL DEFAULT 'draft',
	"currency" text NOT NULL DEFAULT 'USD',
	"subtotal" text NOT NULL DEFAULT '0',
	"tax" text NOT NULL DEFAULT '0',
	"total" text NOT NULL DEFAULT '0',
	"line_items" jsonb DEFAULT '[]' NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "wallet_workspace_idx" ON "wallet" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_transaction_wallet_idx" ON "credit_transaction" USING btree ("wallet_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_transaction_workspace_idx" ON "credit_transaction" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_transaction_type_idx" ON "credit_transaction" USING btree ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "credit_transaction_created_at_idx" ON "credit_transaction" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservation_wallet_idx" ON "credit_reservation" USING btree ("wallet_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservation_workspace_idx" ON "credit_reservation" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reservation_status_idx" ON "credit_reservation" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_workspace_idx" ON "usage_record" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_provider_idx" ON "usage_record" USING btree ("provider_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "usage_created_at_idx" ON "usage_record" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cost_record_execution_idx" ON "cost_record" USING btree ("execution_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cost_record_usage_idx" ON "cost_record" USING btree ("usage_record_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cost_record_provider_idx" ON "cost_record" USING btree ("provider_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_workspace_idx" ON "subscription" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subscription_status_idx" ON "subscription" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_workspace_idx" ON "invoice" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_status_idx" ON "invoice" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_created_at_idx" ON "invoice" USING btree ("created_at");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "wallet_workspace_unique" ON "wallet" USING btree ("workspace_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "subscription_workspace_unique" ON "subscription" USING btree ("workspace_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "reservation_execution_unique" ON "credit_reservation" USING btree ("execution_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "usage_execution_unique" ON "usage_record" USING btree ("execution_id");
--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_wallet_id_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallet"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "credit_reservation" ADD CONSTRAINT "credit_reservation_wallet_id_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallet"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON UPDATE no action;

CREATE TABLE IF NOT EXISTS "order" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL DEFAULT 'draft',
	"currency" text NOT NULL DEFAULT 'USD',
	"subtotal" text NOT NULL DEFAULT '0',
	"tax" text NOT NULL DEFAULT '0',
	"discount" text NOT NULL DEFAULT '0',
	"total" text NOT NULL DEFAULT '0',
	"items" jsonb DEFAULT '[]' NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"expires_at" timestamp,
	"paid_at" timestamp,
	"cancelled_at" timestamp,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checkout_session" (
	"id" text PRIMARY KEY NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"order_id" text NOT NULL,
	"status" text NOT NULL DEFAULT 'open',
	"payment_provider" text,
	"payment_intent_id" text,
	"currency" text NOT NULL DEFAULT 'USD',
	"amount" text NOT NULL DEFAULT '0',
	"expires_at" timestamp NOT NULL,
	"completed_at" timestamp,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_intent" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"checkout_session_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL DEFAULT 'pending',
	"provider" text NOT NULL,
	"provider_reference" text,
	"amount" text NOT NULL DEFAULT '0',
	"currency" text NOT NULL DEFAULT 'USD',
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"last_attempt_at" timestamp,
	"succeeded_at" timestamp,
	"failed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_intent_id" text NOT NULL,
	"provider" text NOT NULL,
	"status" text NOT NULL DEFAULT 'pending',
	"request_payload" jsonb DEFAULT '{}' NOT NULL,
	"response_payload" jsonb DEFAULT '{}' NOT NULL,
	"provider_reference" text,
	"amount" text NOT NULL DEFAULT '0',
	"currency" text NOT NULL DEFAULT 'USD',
	"error_code" text,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "voucher" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"currency" text NOT NULL DEFAULT 'USD',
	"min_purchase" text,
	"max_discount" text,
	"expires_at" timestamp NOT NULL,
	"usage_limit" text NOT NULL DEFAULT '0',
	"user_limit" text NOT NULL DEFAULT '0',
	"workspace_limit" text NOT NULL DEFAULT '0',
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "voucher_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"voucher_id" text NOT NULL,
	"order_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"discount_amount" text NOT NULL,
	"currency" text NOT NULL DEFAULT 'USD',
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupon" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" text NOT NULL,
	"value" text NOT NULL,
	"currency" text NOT NULL DEFAULT 'USD',
	"min_purchase" text,
	"max_discount" text,
	"expires_at" timestamp NOT NULL,
	"usage_limit" text NOT NULL DEFAULT '0',
	"is_active" boolean DEFAULT true NOT NULL,
	"applicable_products" jsonb DEFAULT '[]' NOT NULL,
	"applicable_plans" jsonb DEFAULT '[]' NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupon_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"coupon_id" text NOT NULL,
	"order_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"discount_amount" text NOT NULL,
	"currency" text NOT NULL DEFAULT 'USD',
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tax_rule" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region" text NOT NULL,
	"rate" text NOT NULL,
	"type" text NOT NULL,
	"currency" text NOT NULL DEFAULT 'USD',
	"min_amount" text,
	"max_amount" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" text NOT NULL DEFAULT '0',
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refund" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"payment_intent_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text NOT NULL DEFAULT 'pending',
	"amount" text NOT NULL DEFAULT '0',
	"currency" text NOT NULL DEFAULT 'USD',
	"reason" text NOT NULL,
	"refund_type" text NOT NULL,
	"external_refund_id" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_workspace_idx" ON "order" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_user_idx" ON "order" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_status_idx" ON "order" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_created_at_idx" ON "order" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkout_session_workspace_idx" ON "checkout_session" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkout_session_order_idx" ON "checkout_session" USING btree ("order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "checkout_session_status_idx" ON "checkout_session" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_intent_order_idx" ON "payment_intent" USING btree ("order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_intent_workspace_idx" ON "payment_intent" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_intent_status_idx" ON "payment_intent" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_intent_provider_idx" ON "payment_intent" USING btree ("provider");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_attempt_intent_idx" ON "payment_attempt" USING btree ("payment_intent_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_attempt_status_idx" ON "payment_attempt" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "voucher_code_idx" ON "voucher" USING btree ("code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "voucher_active_idx" ON "voucher" USING btree ("is_active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "voucher_usage_voucher_idx" ON "voucher_usage" USING btree ("voucher_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "voucher_usage_workspace_idx" ON "voucher_usage" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupon_code_idx" ON "coupon" USING btree ("code");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupon_active_idx" ON "coupon" USING btree ("is_active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupon_usage_coupon_idx" ON "coupon_usage" USING btree ("coupon_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "coupon_usage_workspace_idx" ON "coupon_usage" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tax_rule_region_idx" ON "tax_rule" USING btree ("region");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tax_rule_active_idx" ON "tax_rule" USING btree ("is_active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refund_order_idx" ON "refund" USING btree ("order_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refund_workspace_idx" ON "refund" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "refund_status_idx" ON "refund" USING btree ("status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "voucher_code_unique" ON "voucher" USING btree ("code");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coupon_code_unique" ON "coupon" USING btree ("code");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "voucher_usage_order_unique" ON "voucher_usage" USING btree ("order_id", "voucher_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coupon_usage_order_unique" ON "coupon_usage" USING btree ("order_id", "coupon_id");
--> statement-breakpoint
ALTER TABLE "checkout_session" ADD CONSTRAINT "checkout_session_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_intent" ADD CONSTRAINT "payment_intent_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_intent" ADD CONSTRAINT "payment_intent_checkout_session_id_checkout_session_id_fk" FOREIGN KEY ("checkout_session_id") REFERENCES "public"."checkout_session"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_attempt" ADD CONSTRAINT "payment_attempt_payment_intent_id_payment_intent_id_fk" FOREIGN KEY ("payment_intent_id") REFERENCES "public"."payment_intent"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "voucher_usage" ADD CONSTRAINT "voucher_usage_voucher_id_voucher_id_fk" FOREIGN KEY ("voucher_id") REFERENCES "public"."voucher"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_coupon_id_coupon_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupon"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "refund" ADD CONSTRAINT "refund_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE cascade ON UPDATE no action;

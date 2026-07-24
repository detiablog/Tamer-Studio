CREATE TABLE IF NOT EXISTS "support_ticket" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"workspace_id" text,
	"category" text NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"assigned_to" text,
	"resolved_at" timestamp,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_ticket_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_knowledge_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_knowledge_article" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"related_articles" jsonb DEFAULT '[]' NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"ticket_id" text,
	"type" text NOT NULL,
	"rating" integer,
	"comment" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_customer_timeline" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_sla_policy" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"priority" text NOT NULL,
	"response_time_minutes" integer NOT NULL,
	"resolution_time_minutes" integer NOT NULL,
	"escalation_rules" jsonb DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_sla_violation" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"policy_id" text NOT NULL,
	"type" text NOT NULL,
	"violated_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_attachment" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"storage_path" text NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_internal_note" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_id" text NOT NULL,
	"content" text NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_ticket_user_id_idx" ON "support_ticket" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_ticket_status_idx" ON "support_ticket" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_ticket_priority_idx" ON "support_ticket" USING btree ("priority");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_ticket_assigned_to_idx" ON "support_ticket" USING btree ("assigned_to");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_ticket_created_at_idx" ON "support_ticket" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_ticket_comment_ticket_id_idx" ON "support_ticket_comment" USING btree ("ticket_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_ticket_comment_user_id_idx" ON "support_ticket_comment" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_knowledge_category_parent_id_idx" ON "support_knowledge_category" USING btree ("parent_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_knowledge_article_category_id_idx" ON "support_knowledge_article" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_knowledge_article_status_idx" ON "support_knowledge_article" USING btree ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_feedback_user_id_idx" ON "support_feedback" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_feedback_ticket_id_idx" ON "support_feedback" USING btree ("ticket_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_feedback_type_idx" ON "support_feedback" USING btree ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_customer_timeline_user_id_idx" ON "support_customer_timeline" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_customer_timeline_type_idx" ON "support_customer_timeline" USING btree ("type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_customer_timeline_created_at_idx" ON "support_customer_timeline" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_sla_policy_priority_idx" ON "support_sla_policy" USING btree ("priority");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_sla_policy_is_active_idx" ON "support_sla_policy" USING btree ("is_active");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_sla_violation_ticket_id_idx" ON "support_sla_violation" USING btree ("ticket_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_sla_violation_policy_id_idx" ON "support_sla_violation" USING btree ("policy_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_attachment_ticket_id_idx" ON "support_attachment" USING btree ("ticket_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_attachment_uploaded_by_idx" ON "support_attachment" USING btree ("uploaded_by");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_internal_note_ticket_id_idx" ON "support_internal_note" USING btree ("ticket_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "support_internal_note_created_by_idx" ON "support_internal_note" USING btree ("created_by");
--> statement-breakpoint
ALTER TABLE "support_ticket" ADD CONSTRAINT "support_ticket_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_ticket" ADD CONSTRAINT "support_ticket_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_ticket_comment" ADD CONSTRAINT "support_ticket_comment_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_ticket_comment" ADD CONSTRAINT "support_ticket_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_knowledge_category" ADD CONSTRAINT "support_knowledge_category_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."support_knowledge_category"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_knowledge_article" ADD CONSTRAINT "support_knowledge_article_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."support_knowledge_category"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_feedback" ADD CONSTRAINT "support_feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_feedback" ADD CONSTRAINT "support_feedback_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_customer_timeline" ADD CONSTRAINT "support_customer_timeline_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_sla_violation" ADD CONSTRAINT "support_sla_violation_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_sla_violation" ADD CONSTRAINT "support_sla_violation_policy_id_support_sla_policy_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."support_sla_policy"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_attachment" ADD CONSTRAINT "support_attachment_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_attachment" ADD CONSTRAINT "support_attachment_uploaded_by_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_internal_note" ADD CONSTRAINT "support_internal_note_ticket_id_support_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_ticket"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "support_internal_note" ADD CONSTRAINT "support_internal_note_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;

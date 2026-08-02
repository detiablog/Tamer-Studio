CREATE TABLE IF NOT EXISTS "hypercare_incident" (
	"id" text PRIMARY KEY,
	"title" varchar(500) NOT NULL,
	"description" text,
	"severity" varchar(50) DEFAULT 'medium' NOT NULL,
	"priority" varchar(50) DEFAULT 'medium' NOT NULL,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"affected_module" varchar(100),
	"affected_users" integer DEFAULT 0 NOT NULL,
	"owner_id" text,
	"detection_time" timestamp DEFAULT now() NOT NULL,
	"resolution_time" timestamp,
	"root_cause" text,
	"technical_cause" text,
	"business_impact" text,
	"corrective_action" text,
	"preventive_action" text,
	"verification" text,
	"lessons_learned" text,
	"related_hotfix_id" text,
	"linked_deployment_id" text,
	"linked_version" varchar(100),
	"timeline" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"affected_services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"closed_at" timestamp,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hci_status_idx" ON "hypercare_incident" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hci_severity_idx" ON "hypercare_incident" ("severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hci_priority_idx" ON "hypercare_incident" ("priority");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hci_module_idx" ON "hypercare_incident" ("affected_module");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hci_created_idx" ON "hypercare_incident" ("created_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hypercare_hotfix" (
	"id" text PRIMARY KEY,
	"incident_id" text,
	"branch_name" varchar(200) NOT NULL,
	"commit_hash" varchar(100),
	"title" varchar(500) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"target_version" varchar(100),
	"deployed_at" timestamp,
	"rolled_back_at" timestamp,
	"verified_at" timestamp,
	"verified_by" text,
	"regression_tests_passed" boolean DEFAULT false NOT NULL,
	"validation_results" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hfh_incident_idx" ON "hypercare_hotfix" ("incident_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hfh_status_idx" ON "hypercare_hotfix" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hfh_branch_idx" ON "hypercare_hotfix" ("branch_name");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hypercare_health_check" (
	"id" text PRIMARY KEY,
	"service_name" varchar(100) NOT NULL,
	"service_type" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'unknown' NOT NULL,
	"latency_ms" integer,
	"health_score" real,
	"uptime" text,
	"last_checked_at" timestamp DEFAULT now() NOT NULL,
	"last_healthy_at" timestamp,
	"last_error_at" timestamp,
	"error_message" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hhc_service_idx" ON "hypercare_health_check" ("service_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hhc_status_idx" ON "hypercare_health_check" ("status");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hypercare_kpi" (
	"id" text PRIMARY KEY,
	"name" varchar(200) NOT NULL,
	"category" varchar(100) NOT NULL,
	"target_value" real,
	"current_value" real,
	"unit" varchar(50),
	"status" varchar(50) DEFAULT 'unknown' NOT NULL,
	"trend" varchar(50) DEFAULT 'stable' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hkpi_name_idx" ON "hypercare_kpi" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hkpi_category_idx" ON "hypercare_kpi" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hkpi_recorded_idx" ON "hypercare_kpi" ("recorded_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hypercare_feedback" (
	"id" text PRIMARY KEY,
	"user_id" text,
	"category" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"content" text,
	"rating" integer,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"linked_incident_id" text,
	"module" varchar(100),
	"priority" varchar(50) DEFAULT 'medium' NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" text,
	"response" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hfb_category_idx" ON "hypercare_feedback" ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hfb_type_idx" ON "hypercare_feedback" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hfb_status_idx" ON "hypercare_feedback" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hfb_module_idx" ON "hypercare_feedback" ("module");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hypercare_report" (
	"id" text PRIMARY KEY,
	"type" varchar(50) NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" text,
	"period" varchar(100),
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hrpt_type_idx" ON "hypercare_report" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hrpt_period_idx" ON "hypercare_report" ("period");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hrpt_generated_idx" ON "hypercare_report" ("generated_at");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hypercare_root_cause" (
	"id" text PRIMARY KEY,
	"incident_id" text NOT NULL,
	"problem_description" text,
	"detection_time" timestamp,
	"affected_services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"root_cause" text,
	"technical_cause" text,
	"business_impact" text,
	"corrective_action" text,
	"preventive_action" text,
	"verification" text,
	"lessons_learned" text,
	"completed_at" timestamp,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hrc_incident_idx" ON "hypercare_root_cause" ("incident_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hypercare_settings" (
	"id" text PRIMARY KEY,
	"key" varchar(200) NOT NULL,
	"value" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hset_key_idx" ON "hypercare_settings" ("key");

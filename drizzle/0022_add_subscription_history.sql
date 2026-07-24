CREATE TABLE IF NOT EXISTS "subscription_history" (
  "id" text PRIMARY KEY NOT NULL,
  "subscription_id" text NOT NULL REFERENCES "subscription"("id") ON DELETE CASCADE,
  "workspace_id" text NOT NULL,
  "action" text NOT NULL,
  "previous_value" jsonb,
  "new_value" jsonb,
  "changed_by" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "subscription_history_subscription_idx" ON "subscription_history" USING btree ("subscription_id");
CREATE INDEX IF NOT EXISTS "subscription_history_workspace_idx" ON "subscription_history" USING btree ("workspace_id");
CREATE INDEX IF NOT EXISTS "subscription_history_action_idx" ON "subscription_history" USING btree ("action");
CREATE INDEX IF NOT EXISTS "subscription_history_created_idx" ON "subscription_history" USING btree ("created_at");
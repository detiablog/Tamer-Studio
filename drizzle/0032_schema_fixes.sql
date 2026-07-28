-- Migration 0032: Schema fixes
-- Fixes: cancelAtPeriodEnd type, missing indexes, copy-paste bugs

-- 1. Fix cancelAtPeriodEnd type from text to boolean
-- First update existing data
UPDATE subscription SET cancel_at_period_end = 'false' WHERE cancel_at_period_end IS NULL;
UPDATE subscription SET cancel_at_period_end = 'true' WHERE cancel_at_period_end = 'true';
UPDATE subscription SET cancel_at_period_end = 'false' WHERE cancel_at_period_end = 'false';

-- Then alter column type (PostgreSQL requires cast)
ALTER TABLE subscription ALTER COLUMN cancel_at_period_end DROP DEFAULT;
ALTER TABLE subscription ALTER COLUMN cancel_at_period_end TYPE boolean USING (cancel_at_period_end = 'true');
ALTER TABLE subscription ALTER COLUMN cancel_at_period_end SET DEFAULT false;
ALTER TABLE subscription ALTER COLUMN cancel_at_period_end SET NOT NULL;

-- 2. Add missing indexes for query performance
CREATE INDEX IF NOT EXISTS idx_subscription_plan_id ON subscription(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_workspace_id ON subscription(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invoice_subscription_id ON invoice(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoice_workspace_id ON invoice(workspace_id);
CREATE INDEX IF NOT EXISTS idx_credit_transaction_wallet_id ON credit_transaction(wallet_id);
CREATE INDEX IF NOT EXISTS idx_credit_reservation_wallet_id ON credit_reservation(wallet_id);
CREATE INDEX IF NOT EXISTS idx_usage_record_workspace_id ON usage_record(workspace_id);
CREATE INDEX IF NOT EXISTS idx_order_user_id ON "order"(user_id);
CREATE INDEX IF NOT EXISTS idx_order_workspace_id ON "order"(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notification_user_id ON notification(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_type ON notification(type);
CREATE INDEX IF NOT EXISTS idx_refund_payment_intent_id ON refund(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_workspace_id ON support_ticket(workspace_id);
CREATE INDEX IF NOT EXISTS idx_cms_page_author_id ON cms_page(author_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- 3. Fix localization schema copy-paste bugs (column name corrections)
-- These are handled at the application level since drizzle manages the schema

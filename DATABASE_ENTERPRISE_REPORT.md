# Database Enterprise Architecture Report - Tamer Studio

**Date:** 2026-07-24  
**Architect:** Senior Database Architect  
**Status:** Recommendations Ready for Implementation  

---

## Executive Summary

The current database architecture is functional but lacks enterprise-grade features for observability, auditability, and scalability. This report identifies **15 high-value improvements** that will enhance security, compliance, performance, and operational visibility without over-engineering.

### Current State Assessment

| Category | Score | Notes |
|----------|-------|-------|
| Schema Completeness | 8/10 | 72 tables, good coverage |
| Indexing Strategy | 6/10 | Missing composite indexes, some gaps |
| Audit & Compliance | 5/10 | Missing createdBy/updatedBy on many tables |
| Soft Delete | 7/10 | Partial coverage |
| History Tracking | 3/10 | No history tables for critical entities |
| Configuration Management | 4/10 | No system_settings table |
| Observability | 5/10 | Basic audit log, no webhook/usage tracking |
| Hierarchy Support | 4/10 | No parent org/role support |
| Data Types | 7/10 | Some text columns that should be numeric |

---

## Critical Improvements (Implement Immediately)

### 1. Add Audit Fields to All Tables

**Reason:** Every business-critical table should track who created and modified records for compliance and debugging.

**Tables Missing createdBy/updatedBy:**
- `user_profile` - missing createdBy, updatedBy
- `external_identity` - missing createdBy
- `user_preferences` - missing updatedBy
- `role` - missing createdBy, updatedBy
- `permission` - missing createdBy
- `organization` - missing createdBy, updatedBy
- `workspace` - missing createdBy, updatedBy
- `workspace_member` - missing invitedBy as FK, createdBy
- `organization_member` - missing createdBy
- `api_key` - missing createdBy
- `wallet` - missing createdBy, updatedBy
- `credit_transaction` - missing createdBy
- `credit_reservation` - missing createdBy
- `usage_record` - missing createdBy
- `cost_record` - missing createdBy
- `subscription` - missing createdBy, updatedBy
- `invoice` - missing createdBy, updatedBy
- `order` - missing createdBy, updatedBy
- `checkout_session` - missing createdBy
- `payment_intent` - missing createdBy, updatedBy
- `payment_attempt` - missing createdBy
- `voucher` - missing createdBy, updatedBy
- `coupon` - missing createdBy, updatedBy
- `refund` - missing createdBy, updatedBy
- `support_ticket` - missing createdBy, updatedBy
- `support_ticket_comment` - missing createdBy
- `support_knowledge_article` - missing createdBy, updatedBy
- `asset` - missing updatedBy
- `asset_collection` - missing updatedBy
- `notification_template` - missing createdBy, updatedBy
- `notification` - missing createdBy
- `feature_flag` - missing updatedBy
- `ai_provider` - missing createdBy, updatedBy
- `job` - missing createdBy
- `queue` - missing createdBy, updatedBy
- `workflow` - missing createdBy, updatedBy
- `workflow_execution` - missing createdBy
- `billing` - missing createdBy, updatedBy

**Benefits:**
- Full audit trail for compliance (GDPR, SOC2)
- Debugging capability for data issues
- Ownership tracking for data governance

**Migration Impact:** Low - Add nullable columns with no defaults

**Risk Level:** LOW

**Implementation Plan:**
```sql
-- Add createdBy and updatedBy to tables missing them
ALTER TABLE "user_profile" ADD COLUMN IF NOT EXISTS "created_by" text, ADD COLUMN IF NOT EXISTS "updated_by" text;
ALTER TABLE "external_identity" ADD COLUMN IF NOT EXISTS "created_by" text;
-- ... repeat for all tables
```

---

### 2. Add Soft Delete to Remaining Tables

**Tables Missing deletedAt:**
- `role`
- `permission`
- `role_permission`
- `external_identity`
- `user_preferences`
- `workspace_member`
- `organization_member`
- `invitation`
- `api_key`
- `workspace_transfer`
- `wallet`
- `credit_transaction`
- `credit_reservation`
- `usage_record`
- `cost_record`
- `subscription`
- `invoice`
- `order`
- `checkout_session`
- `payment_intent`
- `payment_attempt`
- `voucher`
- `voucher_usage`
- `coupon`
- `coupon_usage`
- `tax_rule`
- `refund`
- `support_ticket_comment`
- `support_knowledge_category`
- `support_knowledge_article`
- `support_feedback`
- `support_customer_timeline`
- `support_sla_policy`
- `support_sla_violation`
- `support_attachment`
- `support_internal_note`
- `notification_template`
- `notification_template_version`
- `notification_preference`
- `notification`
- `event_queue`
- `asset_version`
- `asset_lineage`
- `asset_collection`
- `asset_collection_item`
- `asset_tag`
- `asset_lifecycle_event`
- `production_metrics`
- `user_activity_metrics`
- `workspace_metrics`
- `audit_log`
- `feature_flag`
- `feature_flag_history`
- `ai_provider`
- `ai_provider_model`
- `job`
- `queue`
- `workflow`
- `workflow_execution`
- `billing`

**Benefits:**
- Data retention for compliance
- Ability to recover accidentally deleted data
- Audit trail preservation

**Migration Impact:** Low - Add nullable deletedAt column

**Risk Level:** LOW

---

### 3. Add System Settings Table

**Reason:** Currently settings are scattered across JSON columns in multiple tables. A dedicated system_settings table provides centralized configuration management.

**Benefits:**
- Centralized configuration
- Type-safe settings
- Easy to query and audit
- Supports environment-specific overrides

**Migration Impact:** Low - New table, no data migration needed

**Risk Level:** LOW

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "system_settings" (
  "id" text PRIMARY KEY NOT NULL,
  "key" text NOT NULL UNIQUE,
  "value" jsonb NOT NULL DEFAULT '{}',
  "type" text NOT NULL DEFAULT 'string', -- string, number, boolean, json
  "category" text NOT NULL DEFAULT 'general',
  "description" text,
  "is_sensitive" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

---

### 4. Add Subscription History Table

**Reason:** Currently subscription changes are lost. Need to track plan changes, cancellations, and renewals for billing analytics and customer support.

**Benefits:**
- Track subscription lifecycle
- Billing analytics
- Customer support visibility
- Churn analysis

**Migration Impact:** Low - New table

**Risk Level:** LOW

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "subscription_history" (
  "id" text PRIMARY KEY NOT NULL,
  "subscription_id" text NOT NULL REFERENCES "subscription"("id") ON DELETE CASCADE,
  "workspace_id" text NOT NULL,
  "action" text NOT NULL, -- created, updated, cancelled, renewed, reactivated
  "previous_value" jsonb,
  "new_value" jsonb,
  "changed_by" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

---

### 5. Add API Key Usage Tracking

**Reason:** Currently api_key only tracks last_used_at and usage_count. Need detailed usage tracking for security and analytics.

**Benefits:**
- Security monitoring (detect abuse)
- Usage analytics per key
- Audit trail for API access
- Rate limit enforcement

**Migration Impact:** Low - New table

**Risk Level:** LOW

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "api_key_usage" (
  "id" text PRIMARY KEY NOT NULL,
  "api_key_id" text NOT NULL REFERENCES "api_key"("id") ON DELETE CASCADE,
  "workspace_id" text NOT NULL,
  "endpoint" text NOT NULL,
  "method" text NOT NULL,
  "status_code" integer NOT NULL,
  "response_time_ms" integer,
  "ip_address" text,
  "user_agent" text,
  "request_size" integer,
  "response_size" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

---

### 6. Add Webhook Logs Table

**Reason:** The application has webhook integrations (production-complete, notifications) but no logging. Need to track webhook delivery status for debugging and reliability.

**Benefits:**
- Debug webhook delivery failures
- Track delivery status
- Retry logic support
- Compliance audit trail

**Migration Impact:** Low - New table

**Risk Level:** LOW

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "webhook_log" (
  "id" text PRIMARY KEY NOT NULL,
  "event_type" text NOT NULL,
  "endpoint" text NOT NULL,
  "payload" jsonb NOT NULL,
  "response_status" integer,
  "response_body" jsonb,
  "error_message" text,
  "attempts" integer NOT NULL DEFAULT 1,
  "max_attempts" integer NOT NULL DEFAULT 3,
  "next_attempt_at" timestamp,
  "status" text NOT NULL DEFAULT 'pending', -- pending, success, failed, retrying
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

---

### 7. Add Model Pricing History Table

**Reason:** AI model pricing changes frequently. Need to track historical pricing for accurate cost calculation and billing.

**Benefits:**
- Accurate historical cost calculation
- Price change audit trail
- Billing dispute resolution
- Cost forecasting

**Migration Impact:** Low - New table

**Risk Level:** LOW

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "model_pricing_history" (
  "id" text PRIMARY KEY NOT NULL,
  "provider_id" text NOT NULL REFERENCES "ai_provider"("id") ON DELETE CASCADE,
  "model_id" text NOT NULL,
  "input_price_per_token" numeric NOT NULL,
  "output_price_per_token" numeric NOT NULL,
  "image_price_per_unit" numeric,
  "video_price_per_second" numeric,
  "audio_price_per_second" numeric,
  "currency" text NOT NULL DEFAULT 'USD',
  "effective_from" timestamp NOT NULL,
  "effective_to" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

---

### 8. Add Organization Hierarchy Support

**Reason:** Organizations may need parent/child relationships for enterprise customers with subsidiaries.

**Benefits:**
- Support enterprise org structures
- Hierarchical billing
- Nested team management
- Cross-org reporting

**Migration Impact:** Medium - Requires FK and possible data migration

**Risk Level:** MEDIUM

**Schema:**
```sql
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "parent_id" text REFERENCES "organization"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "organization_parent_id_idx" ON "organization" USING btree ("parent_id");
```

---

### 9. Add Role Hierarchy Support

**Reason:** Roles may inherit permissions from parent roles for more flexible RBAC.

**Benefits:**
- Reduced permission duplication
- Easier role management
- Support for role inheritance patterns

**Migration Impact:** Low - Add column, no data migration

**Risk Level:** LOW

**Schema:**
```sql
ALTER TABLE "role" ADD COLUMN IF NOT EXISTS "parent_id" text REFERENCES "role"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS "role_parent_id_idx" ON "role" USING btree ("parent_id");
```

---

### 10. Add Composite Indexes for Common Queries

**Reason:** Several common query patterns lack composite indexes, causing slower queries.

**Benefits:**
- Faster query performance
- Reduced database load
- Better scalability

**Migration Impact:** Low - Add indexes

**Risk Level:** LOW

**Indexes to Add:**
```sql
-- User queries by status and created_at
CREATE INDEX IF NOT EXISTS "user_profile_status_created_idx" ON "user_profile" USING btree ("status", "created_at");

-- Workspace queries by owner and status
CREATE INDEX IF NOT EXISTS "workspace_owner_status_idx" ON "workspace" USING btree ("owner_id", "status");

-- Invoice queries by workspace and status
CREATE INDEX IF NOT EXISTS "invoice_workspace_status_idx" ON "invoice" USING btree ("workspace_id", "status");

-- Subscription queries by workspace and status
CREATE INDEX IF NOT EXISTS "subscription_workspace_status_idx" ON "subscription" USING btree ("workspace_id", "status");

-- Usage records by workspace and date
CREATE INDEX IF NOT EXISTS "usage_workspace_created_idx" ON "usage_record" USING btree ("workspace_id", "created_at");

-- Notification queries by user and status
CREATE INDEX IF NOT EXISTS "notification_user_status_idx" ON "notification" USING btree ("user_id", "status");

-- Audit log queries by action and date
CREATE INDEX IF NOT EXISTS "audit_log_action_created_idx" ON "audit_log" USING btree ("action", "created_at");
```

---

### 11. Fix Data Type Issues

**Reason:** Several columns use `text` for numeric values, causing type mismatches and poor query performance.

**Benefits:**
- Better query performance
- Data integrity
- Correct numeric operations in SQL

**Migration Impact:** Medium - Requires data migration

**Risk Level:** MEDIUM

**Changes:**
```sql
-- Change numeric text columns to appropriate types
ALTER TABLE "wallet" ALTER COLUMN "available_credits" TYPE numeric USING "available_credits"::numeric;
ALTER TABLE "wallet" ALTER COLUMN "reserved_credits" TYPE numeric USING "reserved_credits"::numeric;
ALTER TABLE "wallet" ALTER COLUMN "pending_credits" TYPE numeric USING "pending_credits"::numeric;

ALTER TABLE "credit_transaction" ALTER COLUMN "amount" TYPE numeric USING "amount"::numeric;
ALTER TABLE "credit_transaction" ALTER COLUMN "balance_before" TYPE numeric USING "balance_before"::numeric;
ALTER TABLE "credit_transaction" ALTER COLUMN "balance_after" TYPE numeric USING "balance_after"::numeric;

ALTER TABLE "usage_record" ALTER COLUMN "tokens" TYPE bigint USING "tokens"::bigint;
ALTER TABLE "usage_record" ALTER COLUMN "images" TYPE integer USING "images"::integer;
ALTER TABLE "usage_record" ALTER COLUMN "video_seconds" TYPE numeric USING "video_seconds"::numeric;
ALTER TABLE "usage_record" ALTER COLUMN "audio_seconds" TYPE numeric USING "audio_seconds"::numeric;
ALTER TABLE "usage_record" ALTER COLUMN "storage_bytes" TYPE bigint USING "storage_bytes"::bigint;
ALTER TABLE "usage_record" ALTER COLUMN "execution_time_ms" TYPE integer USING "execution_time_ms"::integer;
ALTER TABLE "usage_record" ALTER COLUMN "estimated_cost" TYPE numeric USING "estimated_cost"::numeric;
ALTER TABLE "usage_record" ALTER COLUMN "actual_cost" TYPE numeric USING "actual_cost"::numeric;

ALTER TABLE "cost_record" ALTER COLUMN "input_units" TYPE bigint USING "input_units"::bigint;
ALTER TABLE "cost_record" ALTER COLUMN "output_units" TYPE bigint USING "output_units"::bigint;
ALTER TABLE "cost_record" ALTER COLUMN "input_cost" TYPE numeric USING "input_cost"::numeric;
ALTER TABLE "cost_record" ALTER COLUMN "output_cost" TYPE numeric USING "output_cost"::numeric;
ALTER TABLE "cost_record" ALTER COLUMN "total_cost" TYPE numeric USING "total_cost"::numeric;

ALTER TABLE "invoice" ALTER COLUMN "subtotal" TYPE numeric USING "subtotal"::numeric;
ALTER TABLE "invoice" ALTER COLUMN "tax" TYPE numeric USING "tax"::numeric;
ALTER TABLE "invoice" ALTER COLUMN "total" TYPE numeric USING "total"::numeric;

ALTER TABLE "order" ALTER COLUMN "subtotal" TYPE numeric USING "subtotal"::numeric;
ALTER TABLE "order" ALTER COLUMN "tax" TYPE numeric USING "tax"::numeric;
ALTER TABLE "order" ALTER COLUMN "discount" TYPE numeric USING "discount"::numeric;
ALTER TABLE "order" ALTER COLUMN "total" TYPE numeric USING "total"::numeric;

ALTER TABLE "payment_intent" ALTER COLUMN "amount" TYPE numeric USING "amount"::numeric;
ALTER TABLE "payment_attempt" ALTER COLUMN "amount" TYPE numeric USING "amount"::numeric;

ALTER TABLE "voucher" ALTER COLUMN "value" TYPE numeric USING "value"::numeric;
ALTER TABLE "voucher" ALTER COLUMN "min_purchase" TYPE numeric USING "min_purchase"::numeric;
ALTER TABLE "voucher" ALTER COLUMN "max_discount" TYPE numeric USING "max_discount"::numeric;
ALTER TABLE "voucher" ALTER COLUMN "usage_limit" TYPE integer USING "usage_limit"::integer;
ALTER TABLE "voucher" ALTER COLUMN "user_limit" TYPE integer USING "user_limit"::integer;
ALTER TABLE "voucher" ALTER COLUMN "workspace_limit" TYPE integer USING "workspace_limit"::integer;

ALTER TABLE "coupon" ALTER COLUMN "value" TYPE numeric USING "value"::numeric;
ALTER TABLE "coupon" ALTER COLUMN "min_purchase" TYPE numeric USING "min_purchase"::numeric;
ALTER TABLE "coupon" ALTER COLUMN "max_discount" TYPE numeric USING "max_discount"::numeric;
ALTER TABLE "coupon" ALTER COLUMN "usage_limit" TYPE integer USING "usage_limit"::integer;

ALTER TABLE "refund" ALTER COLUMN "amount" TYPE numeric USING "amount"::numeric;

ALTER TABLE "tax_rule" ALTER COLUMN "rate" TYPE numeric USING "rate"::numeric;
ALTER TABLE "tax_rule" ALTER COLUMN "min_amount" TYPE numeric USING "min_amount"::numeric;
ALTER TABLE "tax_rule" ALTER COLUMN "max_amount" TYPE numeric USING "max_amount"::numeric;
ALTER TABLE "tax_rule" ALTER COLUMN "priority" TYPE integer USING "priority"::integer;

ALTER TABLE "production_metrics" ALTER COLUMN "cost_usd" TYPE numeric USING "cost_usd"::numeric;

ALTER TABLE "workspace_metrics" ALTER COLUMN "total_cost_usd" TYPE numeric USING "total_cost_usd"::numeric;
```

---

### 12. Add Missing Indexes on Foreign Keys

**Reason:** Several foreign key columns lack indexes, causing slow joins.

**Benefits:**
- Faster join queries
- Better referential integrity checks
- Improved cascade delete performance

**Migration Impact:** Low - Add indexes

**Risk Level:** LOW

**Indexes to Add:**
```sql
-- Workspace member indexes
CREATE INDEX IF NOT EXISTS "workspace_member_role_id_idx" ON "workspace_member" USING btree ("role_id");
CREATE INDEX IF NOT EXISTS "workspace_member_invited_by_idx" ON "workspace_member" USING btree ("invited_by");

-- Organization member indexes
CREATE INDEX IF NOT EXISTS "organization_member_role_id_idx" ON "organization_member" USING btree ("role_id");

-- Invoice subscription index
CREATE INDEX IF NOT EXISTS "invoice_subscription_id_idx" ON "invoice" USING btree ("subscription_id");

-- Usage record indexes
CREATE INDEX IF NOT EXISTS "usage_user_id_idx" ON "usage_record" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "usage_model_id_idx" ON "usage_record" USING btree ("model_id");
CREATE INDEX IF NOT EXISTS "usage_capability_id_idx" ON "usage_record" USING btree ("capability_id");

-- Cost record indexes
CREATE INDEX IF NOT EXISTS "cost_record_capability_idx" ON "cost_record" USING btree ("capability_id");

-- Payment intent checkout session index
CREATE INDEX IF NOT EXISTS "payment_intent_checkout_session_idx" ON "payment_intent" USING btree ("checkout_session_id");

-- Support ticket workspace index
CREATE INDEX IF NOT EXISTS "support_ticket_workspace_id_idx" ON "support_ticket" USING btree ("workspace_id");

-- Notification scheduled_at index for scheduled notifications
CREATE INDEX IF NOT EXISTS "notification_scheduled_at_idx" ON "notification" USING btree ("scheduled_at");

-- Event queue next_attempt index for retry logic
CREATE INDEX IF NOT EXISTS "event_queue_next_attempt_idx" ON "event_queue" USING btree ("next_attempt_at");

-- Asset source indexes
CREATE INDEX IF NOT EXISTS "asset_source_prompt_idx" ON "asset" USING btree ("source_prompt_id");
CREATE INDEX IF NOT EXISTS "asset_source_gateway_idx" ON "asset" USING btree ("source_gateway_id");
CREATE INDEX IF NOT EXISTS "asset_source_capability_idx" ON "asset" USING btree ("source_capability_id");
```

---

### 13. Add Rate Limit Tracking Table

**Reason:** Currently rate limiting is handled in-memory or via Upstash Redis. Need persistent tracking for analytics and debugging.

**Benefits:**
- Track rate limit violations
- Analytics on API usage patterns
- Debug rate limiting issues
- Support for custom rate limit rules

**Migration Impact:** Low - New table

**Risk Level:** LOW

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "rate_limit" (
  "id" text PRIMARY KEY NOT NULL,
  "key" text NOT NULL, -- user_id, api_key_id, ip_address
  "key_type" text NOT NULL, -- user, api_key, ip
  "endpoint" text NOT NULL,
  "limit" integer NOT NULL,
  "window_seconds" integer NOT NULL,
  "current_count" integer NOT NULL DEFAULT 0,
  "window_start" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

---

### 14. Add AI Provider Statistics Table

**Reason:** Currently provider health is stored in JSON column. Need structured tracking for monitoring and analytics.

**Benefits:**
- Track provider performance over time
- Alert on degradation
- Cost tracking per provider
- SLA monitoring

**Migration Impact:** Low - New table

**Risk Level:** LOW

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "ai_provider_stats" (
  "id" text PRIMARY KEY NOT NULL,
  "provider_id" text NOT NULL REFERENCES "ai_provider"("id") ON DELETE CASCADE,
  "date" date NOT NULL,
  "total_requests" integer NOT NULL DEFAULT 0,
  "successful_requests" integer NOT NULL DEFAULT 0,
  "failed_requests" integer NOT NULL DEFAULT 0,
  "total_tokens" bigint NOT NULL DEFAULT 0,
  "total_cost" numeric NOT NULL DEFAULT 0,
  "avg_latency_ms" integer,
  "max_latency_ms" integer,
  "min_latency_ms" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

---

### 15. Add Wallet Transaction History (Enhanced)

**Reason:** While credit_transaction exists, it lacks transaction metadata and reference linking. Need enhanced tracking for financial audit.

**Benefits:**
- Better financial audit trail
- Track transaction references (order, invoice, subscription)
- Support for refunds and adjustments
- Reconciliation support

**Migration Impact:** Medium - New table, consider backfill

**Risk Level:** MEDIUM

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "wallet_transaction_history" (
  "id" text PRIMARY KEY NOT NULL,
  "wallet_id" text NOT NULL REFERENCES "wallet"("id") ON DELETE CASCADE,
  "workspace_id" text NOT NULL,
  "type" text NOT NULL, -- purchase, usage, refund, adjustment, reservation, release
  "amount" numeric NOT NULL,
  "balance_before" numeric NOT NULL,
  "balance_after" numeric NOT NULL,
  "reference_type" text, -- order, invoice, subscription, reservation, manual
  "reference_id" text,
  "description" text NOT NULL,
  "metadata" jsonb NOT NULL DEFAULT '{}',
  "created_by" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

---

## Recommended Improvements (Implement in Next Sprint)

### 16. Add Cache Invalidation Tracking

**Reason:** Currently no tracking of cache invalidation events. Need for debugging cache-related issues.

**Benefits:**
- Debug cache issues
- Track cache hit/miss ratios
- Optimize cache strategies

**Risk Level:** LOW

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "cache_invalidation" (
  "id" text PRIMARY KEY NOT NULL,
  "cache_key" text NOT NULL,
  "invalidation_reason" text NOT NULL,
  "metadata" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

---

### 17. Add Feature Flag History Table

**Reason:** feature_flag table exists but no history tracking for changes.

**Benefits:**
- Audit feature flag changes
- Rollback capability
- Debug feature-related issues

**Risk Level:** LOW

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "feature_flag_history" (
  "id" text PRIMARY KEY NOT NULL,
  "flag_id" text NOT NULL REFERENCES "feature_flag"("id") ON DELETE CASCADE,
  "action" text NOT NULL, -- created, updated, deleted, enabled, disabled
  "previous_value" jsonb NOT NULL DEFAULT '{}',
  "new_value" jsonb NOT NULL DEFAULT '{}',
  "changed_by" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

**Note:** This table already exists in the schema but is not being used by FeatureFlagsService.

---

### 18. Add Missing Unique Constraints

**Reason:** Some tables have unique constraints via indexes but not formal UNIQUE constraints.

**Benefits:**
- Data integrity
- Prevent duplicates at DB level

**Migration Impact:** Low

**Risk Level:** LOW

```sql
-- Ensure unique constraints are properly defined
ALTER TABLE "notification_preference" ADD CONSTRAINT IF NOT EXISTS "notification_preference_unique" UNIQUE ("user_id", "channel", "category");
```

---

## Optional Improvements (Consider for Future)

### 19. Add Localization Support

**Reason:** Application may need multi-language support for notifications, emails, and UI text.

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "localization" (
  "id" text PRIMARY KEY NOT NULL,
  "key" text NOT NULL,
  "language" text NOT NULL,
  "value" text NOT NULL,
  "context" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE("key", "language")
);
```

---

### 20. Add Loyalty Points System

**Reason:** Could be used for gamification and customer retention.

**Schema:**
```sql
CREATE TABLE IF NOT EXISTS "loyalty_points" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "workspace_id" text NOT NULL,
  "points" integer NOT NULL DEFAULT 0,
  "reason" text NOT NULL,
  "reference_id" text,
  "reference_type" text,
  "expires_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

---

## Index Optimization Recommendations

### Current Index Issues

1. **Missing Indexes on Foreign Keys:**
   - `workspace_member.role_id` - no index
   - `organization_member.role_id` - no index
   - `invoice.subscription_id` - no index
   - `payment_intent.checkout_session_id` - no index
   - `support_ticket.workspace_id` - no index

2. **Missing Composite Indexes:**
   - `user_profile(status, created_at)` - common filter + sort
   - `workspace(owner_id, status)` - common filter
   - `invoice(workspace_id, status)` - common filter
   - `usage_record(workspace_id, created_at)` - common filter
   - `notification(user_id, status)` - common filter

3. **Duplicate/Redundant Indexes:**
   - Check for overlapping single-column indexes that could be replaced with composite indexes

---

## Performance Recommendations

### 1. Partition Large Tables

**Tables to Consider:**
- `audit_log` - Partition by created_at (monthly)
- `usage_record` - Partition by created_at (monthly)
- `production_metrics` - Partition by created_at (monthly)

**Benefits:**
- Faster queries on recent data
- Easier data archival
- Better maintenance operations

### 2. Add Full-Text Search

**Tables to Consider:**
- `support_ticket` - Full-text search on subject + description
- `support_knowledge_article` - Full-text search on title + content
- `notification` - Full-text search on title + message

**Benefits:**
- Better search performance
- Relevance ranking
- Search analytics

### 3. Add Materialized Views for Analytics

**Views to Create:**
- `workspace_metrics_summary` - Daily aggregated metrics
- `user_activity_summary` - Daily user activity
- `revenue_summary` - Daily revenue metrics

**Benefits:**
- Faster dashboard queries
- Reduced database load
- Pre-computed analytics

---

## Security Recommendations

### 1. Encrypt Sensitive Columns

**Columns to Encrypt:**
- `user.email` - PII
- `api_key.key_hash` - Secret
- `ai_provider.config` - May contain API keys
- `payment_intent.metadata` - May contain sensitive data

### 2. Add Row Level Security (RLS)

**Tables to Secure:**
- `workspace` - Users can only access their own workspaces
- `organization` - Members can only access their organizations
- `invoice` - Users can only access invoices for their workspaces

---

## Migration Priority Matrix

| Improvement | Priority | Effort | Impact | Risk |
|-------------|----------|--------|--------|------|
| Audit fields (createdBy/updatedBy) | HIGH | Medium | HIGH | LOW |
| System settings table | HIGH | Low | HIGH | LOW |
| Subscription history | HIGH | Low | HIGH | LOW |
| API key usage tracking | HIGH | Low | HIGH | LOW |
| Webhook logs | HIGH | Low | HIGH | LOW |
| Soft delete on all tables | HIGH | Low | MEDIUM | LOW |
| Composite indexes | HIGH | Low | HIGH | LOW |
| Data type fixes | MEDIUM | High | HIGH | MEDIUM |
| Organization hierarchy | MEDIUM | Low | MEDIUM | LOW |
| Role hierarchy | MEDIUM | Low | MEDIUM | LOW |
| Model pricing history | MEDIUM | Low | MEDIUM | LOW |
| AI provider stats | MEDIUM | Low | MEDIUM | LOW |
| Rate limit tracking | LOW | Low | LOW | LOW |
| Wallet transaction history | LOW | Medium | MEDIUM | MEDIUM |
| Localization support | LOW | Medium | LOW | LOW |
| Loyalty points | LOW | Medium | LOW | LOW |

---

## Implementation Roadmap

### Phase 1: Critical (Week 1)
1. Add audit fields to all tables
2. Add system_settings table
3. Add subscription_history table
4. Add webhook_logs table
5. Add composite indexes

### Phase 2: Important (Week 2-3)
6. Add API key usage tracking
7. Add model pricing history
8. Add AI provider stats
9. Fix data type issues
10. Add organization/role hierarchy

### Phase 3: Optimization (Week 4+)
11. Add rate limit tracking
12. Add cache invalidation tracking
13. Add materialized views
14. Implement table partitioning
15. Add full-text search

---

## Risk Mitigation

1. **Always use IF NOT EXISTS / IF EXISTS checks**
2. **Add columns as nullable first, backfill data, then make NOT NULL if needed**
3. **Create indexes CONCURRENTLY where possible to avoid locking**
4. **Test migrations on staging before production**
5. **Monitor query performance after changes**
6. **Keep rollback scripts ready**

---

## Backup Instructions

```bash
# Full database backup
pg_dump -U postgres -d tamer_studio -F c -f backup_before_optimization.dump

# SQL backup
pg_dump -U postgres -d tamer_studio -f backup_before_optimization.sql

# Verify backup
pg_restore -l backup_before_optimization.dump | head -20
```

---

## Conclusion

The current database architecture is solid but lacks enterprise-grade features for observability, auditability, and scalability. The recommended improvements will:

1. **Enhance Security** - Better audit trails, encryption, RLS
2. **Improve Performance** - Better indexes, data types, partitioning
3. **Increase Observability** - Usage tracking, webhook logs, statistics
4. **Support Growth** - Hierarchy, history tracking, analytics

All improvements are designed to be **backward compatible** and **incrementally deployable** without disrupting existing functionality.

# Database Architecture Audit - Tamer Studio

**Date:** 2026-07-24  
**Scope:** Complete database synchronization across Application, ORM, Migrations, Admin Panel, and API  
**Status:** Analysis Complete - Migration Pending  

---

## Executive Summary

The Tamer Studio database has a significant gap between its Drizzle ORM schema definitions and actual database migrations. Only **3 migrations** exist covering **5 tables**, while the schema defines **50+ tables**. Several admin APIs use raw SQL against tables that don't exist in the schema. Three core services (Jobs, AI Providers, Feature Flags) are entirely in-memory with no database persistence.

| Component | Status | Gap |
|-----------|--------|-----|
| Drizzle Schema | Complete | 50+ tables defined |
| Existing Migrations | Incomplete | Only 3 migrations (0000-0002) |
| Database Tables | Partial | ~5 tables created, ~50 missing |
| Admin APIs | Mixed | Some use DB, some use raw SQL on missing tables |
| Core Services | Partial | Jobs/Providers/Flags in-memory only |

---

## Current Database State

### Existing Migrations

1. **0000_medical_nemesis.sql** - Creates base auth tables
   - `account`, `session`, `user`, `verification`
   - Foreign keys: `account.user_id → user`, `session.user_id → user`
   - Indexes: account_userId_idx, session_userId_idx, verification_identifier_idx

2. **0001_auth_events.sql** - Creates auth events table
   - `failed_login_attempt`
   - Indexes: failed_login_email_idx, failed_login_identifier_idx, failed_login_created_at_idx

3. **0002_add_role_status.sql** - Adds columns to user
   - `user.role` (varchar(50))
   - `user.status` (varchar(50))

### Schema Files (Drizzle ORM)

| File | Tables Defined | Migrations |
|------|---------------|------------|
| `auth.ts` | user, session, account, verification | 0000, 0002 |
| `auth-events.ts` | failed_login_attempt | 0001 |
| `identity.ts` | user_profile, external_identity, user_preferences, role, permission, role_permission, organization, workspace, workspace_member, organization_member, invitation, api_key, workspace_transfer | **MISSING** |
| `billing.ts` | wallet, credit_transaction, credit_reservation, usage_record, cost_record, subscription, invoice | **MISSING** |
| `commerce.ts` | order, checkout_session, payment_intent, payment_attempt, voucher, voucher_usage, coupon, coupon_usage, tax_rule, refund | **MISSING** |
| `notification.ts` | notification_template, notification_template_version, notification_preference, notification, event_queue | **MISSING** |
| `support.ts` | support_ticket, support_ticket_comment, support_knowledge_category, support_knowledge_article, support_feedback, support_customer_timeline, support_sla_policy, support_sla_violation, support_attachment, support_internal_note | **MISSING** |
| `asset.ts` | asset, asset_version, asset_lineage, asset_collection, asset_collection_item, asset_tag, asset_lifecycle_event | **MISSING** |
| `analytics.ts` | production_metrics, user_activity_metrics, workspace_metrics | **MISSING** |
| `audit.ts` | audit_log | **MISSING** |
| `admin.ts` | Empty (placeholder) | N/A |

---

## Critical Gaps

### 1. Missing Database Tables (42 tables)

The following tables are defined in Drizzle schema but have NO migrations:

**Identity & Access:**
- `user_profile`
- `external_identity`
- `user_preferences`
- `role`
- `permission`
- `role_permission`
- `organization`
- `workspace`
- `workspace_member`
- `organization_member`
- `invitation`
- `api_key`
- `workspace_transfer`

**Billing & Credits:**
- `wallet`
- `credit_transaction`
- `credit_reservation`
- `usage_record`
- `cost_record`
- `subscription`
- `invoice`

**Commerce:**
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

**Support:**
- `support_ticket`
- `support_ticket_comment`
- `support_knowledge_category`
- `support_knowledge_article`
- `support_feedback`
- `support_customer_timeline`
- `support_sla_policy`
- `support_sla_violation`
- `support_attachment`
- `support_internal_note`

**Notifications:**
- `notification_template`
- `notification_template_version`
- `notification_preference`
- `notification`
- `event_queue`

**Assets:**
- `asset`
- `asset_version`
- `asset_lineage`
- `asset_collection`
- `asset_collection_item`
- `asset_tag`
- `asset_lifecycle_event`

**Analytics:**
- `production_metrics`
- `user_activity_metrics`
- `workspace_metrics`

**Audit:**
- `audit_log`

### 2. Missing Tables Without Schema Definition

These tables are referenced in the application but have NO Drizzle schema:

| Table | Used In | Purpose |
|-------|---------|---------|
| `billing` | Admin API `/api/admin/billing` | Admin billing records |
| `feature_flag` | Admin panel, FeatureFlagsService | Feature toggles |
| `ai_provider` | Admin panel, ProvidersService | AI provider config |
| `ai_provider_model` | ProvidersService | Model availability |
| `job` / `queue` | Admin panel, job-store | Background jobs |
| `workflow` | core/workflows | Workflow definitions |
| `workflow_execution` | core/workflows | Workflow run history |
| `model` | analytics, asset metadata | AI model registry |
| `capability` | billing, usage | AI capability types |
| `prompt` | asset lineage | Prompt templates |
| `gateway` | asset lineage | Gateway configurations |
| `subscription_plan` | billing | Plan definitions |

### 3. Missing Columns

| Table | Missing Column | Used In | Severity |
|-------|---------------|---------|----------|
| `workspace` | `description` text | Admin workspace API | HIGH - API will fail |
| `workspace` | `owner_id` FK → user | Schema has it, but DB may not | HIGH |
| `organization` | `owner_id` FK → user | Schema has it, but DB may not | HIGH |
| `user` | `email_verified` boolean | Schema has it, not in migration | MEDIUM |
| `user` | `image` text | Schema has it, not in migration | LOW |
| `invoice` | `subscription_id` FK | Schema has it, migration missing | MEDIUM |
| Most tables | `createdBy` / `updatedBy` | Audit requirements | MEDIUM |

### 4. ID Type Inconsistency

| Table Group | ID Type | Issue |
|-------------|---------|-------|
| Auth, Identity, Billing, Commerce, Support, Notification, Asset, Audit | `text` | Consistent |
| Analytics (production_metrics, user_activity_metrics, workspace_metrics) | `serial` / `uuid` | **INCONSISTENT** - breaks uniform ID handling |
| User table PK | `text` | Consistent |

### 5. In-Memory Services (No DB Persistence)

| Service | Current State | Impact |
|---------|--------------|--------|
| `job-store.ts` | In-memory Map/Array | Data lost on restart |
| `ProvidersService` | In-memory Map | No persistence, no audit trail |
| `FeatureFlagsService` | In-memory Map | No persistence, no audit trail |

### 6. Admin API Raw SQL Issues

| Endpoint | Query | Problem |
|----------|-------|---------|
| `GET /api/admin/billing` | `SELECT * FROM billing` | `billing` table doesn't exist in schema |
| `POST /api/admin/billing` | `INSERT INTO billing` | Same - table missing |
| `GET /api/admin/organizations` | `SELECT * FROM organization` | Table may not exist |
| `POST /api/admin/organizations` | `INSERT INTO organization` | Same |
| `GET /api/admin/workspaces` | `SELECT * FROM workspace` | Table may not exist |
| `POST /api/admin/workspaces` | `INSERT INTO workspace ... description` | Missing `description` column in schema |

### 7. Security & Audit Gaps

| Issue | Affected Tables | Severity |
|-------|----------------|----------|
| Missing `createdBy` on most tables | 40+ tables | HIGH |
| Missing `updatedBy` on most tables | 40+ tables | HIGH |
| Missing `deletedAt` on some tables | notification, support_ticket | MEDIUM |
| API keys stored as plain text hash | api_key | LOW (acceptable for hash) |
| No encryption on sensitive metadata | All jsonb columns | MEDIUM |
| No soft-delete on commerce tables | order, payment_intent | MEDIUM |

---

## Risk Assessment

| Risk | Level | Impact |
|------|-------|--------|
| Running migrations on existing DB with partial data | **HIGH** | Could fail if tables already exist |
| Data loss from in-memory services | **HIGH** | Jobs, providers, flags lost on restart |
| Admin API failures due to missing tables | **HIGH** | Billing, org, workspace APIs fail |
| Inconsistent ID types | **MEDIUM** | Analytics queries break uniformity |
| Missing foreign keys | **MEDIUM** | Data integrity issues |
| No audit fields | **MEDIUM** | Compliance/traceability gaps |

---

## Recommendations

### Immediate (Required for Functionality)

1. **Create `billing` table schema + migration** - Admin billing API depends on it
2. **Create `feature_flag` table schema + migration** - Admin panel expects persistence
3. **Create `ai_provider` table schema + migration** - Admin panel expects persistence
4. **Add `description` column to `workspace` table** - Admin API inserts it
5. **Create all 42 missing table migrations** - Schema exists but DB doesn't
6. **Fix analytics ID types** - Change `serial`/`uuid` to `text` for consistency

### Short Term (Data Integrity)

7. Add `createdBy`/`updatedBy` to all major tables
8. Add `deletedAt` to all tables (soft delete standard)
9. Create missing foreign key constraints
10. Add composite indexes for common query patterns

### Long Term (Architecture)

11. Migrate in-memory services to database-backed repositories
12. Standardize all IDs to `text` with `gen_random_uuid()` or `nanoid()` prefix
13. Add database-level enum types for status fields
14. Implement database connection pooling validation

---

## Migration Plan

### Phase 1: Safe Additions (Non-Destructive)
- Create all 42 missing tables with `CREATE TABLE IF NOT EXISTS`
- Add missing columns with safe ALTER TABLE
- Add missing indexes with `CREATE INDEX IF NOT EXISTS`

### Phase 2: Schema Corrections
- Fix analytics table ID types
- Add `createdBy`/`updatedBy` columns
- Add `description` to workspace

### Phase 3: New Schemas
- Add `feature_flag` schema + migration
- Add `ai_provider` schema + migration
- Add `billing` schema + migration
- Add `job`/`queue` schema + migration

### Phase 4: Service Migration
- Migrate ProvidersService to DB
- Migrate FeatureFlagsService to DB
- Migrate job-store to DB

---

## Files to Modify

### Schema Files (src/lib/db/schema/)
- `admin.ts` - Add feature_flag, ai_provider, ai_provider_model
- `identity.ts` - Add `description` to workspace
- `analytics.ts` - Fix ID types to text
- **NEW** `billing-admin.ts` - Admin billing table
- **NEW** `jobs.ts` - Job and queue tables
- **NEW** `workflows.ts` - Workflow tables

### Migration Files (drizzle/)
- `0003_create_identity_tables.sql`
- `0004_create_workspace_tables.sql`
- `0005_create_billing_tables.sql`
- `0006_create_commerce_tables.sql`
- `0007_create_support_tables.sql`
- `0008_create_notification_tables.sql`
- `0009_create_asset_tables.sql`
- `0010_create_analytics_tables.sql`
- `0011_create_audit_table.sql`
- `0012_create_feature_flags.sql`
- `0013_create_ai_providers.sql`
- `0014_create_jobs_queues.sql`
- `0015_create_workflows.sql`
- `0016_create_billing_admin.sql`
- `0017_schema_corrections.sql`

### API Routes (src/app/api/admin/)
- `admin/billing/route.ts` - Switch from raw SQL to Drizzle ORM
- `admin/organizations/route.ts` - Switch from raw SQL to Drizzle ORM
- `admin/workspaces/route.ts` - Switch from raw SQL to Drizzle ORM

---

## Backup Instructions

**Before running any migrations:**

```bash
# PostgreSQL backup
pg_dump -U <user> -d <database> -F c -f backup_$(date +%Y%m%d).dump

# Or SQL format
pg_dump -U <user> -d <database> -f backup_$(date +%Y%m%d).sql
```

---

## Testing Checklist

- [ ] `pnpm db:generate` - Verify migration generation
- [ ] `pnpm db:migrate` - Run migrations
- [ ] `pnpm build` - Verify build passes
- [ ] `pnpm typecheck` - Verify no type errors
- [ ] `pnpm dev` - Verify dev server starts
- [ ] Admin panel loads without errors
- [ ] All API routes return valid responses
- [ ] Database tables exist and are queryable

---

*This report was generated by automated analysis. Review all recommendations before applying migrations.*

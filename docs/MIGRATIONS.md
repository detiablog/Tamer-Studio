# Database Migrations

## Current State

| Migration | Tables Created | Status |
|-----------|---------------|--------|
| `0000_medical_nemesis.sql` | account, session, user, verification | Applied |
| `0001_auth_events.sql` | failed_login_attempt | Applied |
| **Baseline required** | ~55 remaining tables | **Not generated** |

## Migration Drift Audit

The schema has grown significantly beyond the 2 existing migrations. The following tables exist in the schema but have no corresponding migration:

### Missing Tables by Module

**identity.ts** (13 tables)
- `user_profile`, `external_identity`, `user_preferences`
- `role`, `permission`, `role_permission`
- `organization`, `workspace`
- `workspace_member`, `organization_member`, `invitation`
- `api_key`, `workspace_transfer`

**billing.ts** (7 tables)
- `wallet`, `credit_transaction`, `credit_reservation`
- `usage_record`, `cost_record`
- `subscription`, `invoice`

**commerce.ts** (10 tables)
- `order`, `checkout_session`, `payment_intent`, `payment_attempt`
- `voucher`, `voucher_usage`, `coupon`, `coupon_usage`
- `tax_rule`, `refund`

**admin.ts** (2 tables)
- `admin`, `admin_session`

**audit.ts** (1 table)
- `audit_log`

**asset.ts** (7 tables)
- `asset`, `asset_version`, `asset_lineage`
- `asset_collection`, `asset_collection_item`
- `asset_tag`, `asset_lifecycle_event`

**notification.ts** (5 tables)
- `notification_template`, `notification_template_version`
- `notification_preference`, `notification`, `event_queue`

**support.ts** (10 tables)
- `support_ticket`, `support_ticket_comment`
- `support_knowledge_category`, `support_knowledge_article`
- `support_feedback`, `support_customer_timeline`
- `support_sla_policy`, `support_sla_violation`
- `support_attachment`, `support_internal_note`

## How to Generate New Migrations

```bash
pnpm db:generate
```

This runs `drizzle-kit generate`, which introspects the current schema and produces a new migration file in `drizzle/`.

## How to Apply Migrations

```bash
pnpm db:migrate
```

This runs `src/scripts/migrate.ts`, which applies all pending migrations from `drizzle/` to the database.

## How to Reset the Database

To reset and regenerate from a clean baseline:

1. Drop the database or all tables manually.
2. Ensure `drizzle.config.ts` has `middleware: false`.
3. Run `pnpm db:generate` to produce a fresh baseline.
4. Run `pnpm db:migrate` to apply it.

## Important Notes

- The `drizzle/meta/_journal.json` has been updated to include `0001_auth_events`.
- The snapshot `0000_snapshot.json` only covers the original 4 auth tables. Regenerate it after applying any new migrations.
- Never edit migration files manually once they have been applied to any shared environment.

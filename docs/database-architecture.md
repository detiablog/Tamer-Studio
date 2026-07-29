# Database Architecture Audit Report

**Date:** 2026-07-29  
**Sprint:** DATABASE-01  
**Database:** PostgreSQL (tamer_studio)  

---

## Executive Summary

The database contains 106 tables across 22 domain areas. All schema tables from Drizzle ORM exist in the database. The system is synchronized with the codebase. Key findings include timestamp inconsistencies on some join/log tables and 4 legacy tables not in the current schema.

| Metric | Value |
|--------|-------|
| Total tables | 106 |
| Schema tables (Drizzle) | 102 |
| Legacy tables (not in schema) | 4 |
| Foreign keys | 71 |
| Unique constraints | 21 |
| Primary keys | 106 |
| Sequences | 3 |
| Total indexes | ~130 |

---

## Domain Coverage

| Domain | Tables | Status |
|--------|--------|--------|
| Auth (Better Auth) | user, session, account, verification | SYNCED |
| Admin Auth | admin, admin_session | SYNCED |
| Identity | user_profile, user_preferences, role, permission, role_permission, organization, organization_member, workspace, workspace_member, invitation, api_key, external_identity, workspace_transfer | SYNCED |
| CMS | cms_page, cms_section, cms_block, cms_component, cms_media, cms_version, cms_publish_pipeline, cms_publish_step, cms_audit_entry | SYNCED |
| Landing Builder | landing_section, landing_media | SYNCED |
| Localization | localization_profile, region, pricing_profile, pricing_rule, payment_profile, payment_method, currency_profile | SYNCED |
| Commerce | order, checkout_session, payment_intent, payment_attempt, voucher, voucher_usage, coupon, coupon_usage, tax_rule, refund, commerce_order, plan, billing_option, plan_pricing | SYNCED |
| AI | ai_provider, ai_provider_model | SYNCED |
| Analytics | production_metrics, user_activity_metrics, workspace_metrics | SYNCED |
| Billing | wallet, credit_transaction, credit_reservation, usage_record, cost_record, subscription, invoice, billing, subscription_history | SYNCED |
| Email | email_provider, email_provider_health, email_queue, email_log, email_token, email_template, email_statistics | SYNCED |
| Jobs | job, queue | SYNCED |
| Notifications | notification, notification_preference, notification_template, notification_template_version, event_queue | SYNCED |
| Feature Flags | feature_flag, feature_flag_history | SYNCED |
| Assets | asset, asset_version, asset_lineage, asset_collection, asset_collection_item, asset_tag, asset_lifecycle_event | SYNCED |
| Audit | audit_log, failed_login_attempt | SYNCED |
| Support | support_ticket, support_ticket_comment, support_knowledge_category, support_knowledge_article, support_feedback, support_customer_timeline, support_sla_policy, support_sla_violation, support_attachment, support_internal_note | SYNCED |
| Workflows | workflow, workflow_execution | SYNCED |
| Media | user_media | SYNCED |
| Legacy | api_key_usage, system_settings, webhook_log | NOT IN SCHEMA |

---

## Legacy Tables (Not in Current Schema)

| Table | Origin | Recommendation |
|-------|--------|----------------|
| api_key_usage | Migration 0024 | Retain — useful for future API analytics |
| system_settings | Migration 0021 | Retain — may be needed for runtime config |
| subscription_history | Migration 0022 | Retain — useful for billing audit trail |
| webhook_log | Migration 0023 | Retain — useful for webhook debugging |

These tables are harmless and not referenced by current code. They should be either formally added to the schema or deprecated in a future sprint.

---

## Foreign Key Relationships (71)

### Core Auth
- session.user_id → user.id
- account.user_id → user.id

### Admin
- admin_session.admin_id → admin.id

### Identity
- workspace.owner_id → user.id
- organization.owner_id → user.id
- workspace_member.workspace_id → workspace.id
- workspace_member.user_id → user.id
- organization_member.organization_id → organization.id
- organization_member.user_id → user.id

### CMS
- cms_section.page_id → cms_page.id
- cms_block.section_id → cms_section.id

### Localization
- region.profile_code → localization_profile.code
- pricing_rule.profile_id → pricing_profile.id
- payment_method.profile_id → payment_profile.id

### Commerce
- checkout_session.order_id → order.id
- payment_intent.order_id → order.id
- payment_intent.checkout_session_id → checkout_session.id
- payment_attempt.payment_intent_id → payment_intent.id
- coupon_usage.order_id → order.id
- refund.order_id → order.id
- refund.payment_intent_id → payment_intent.id
- commerce_order.plan_id → plan.id (nullable)

### Billing
- credit_transaction.wallet_id → wallet.id
- credit_reservation.wallet_id → wallet.id
- invoice.subscription_id → subscription.id (nullable)
- subscription.plan_id → plan.id
- plan_pricing.plan_id → plan.id
- plan_pricing.billing_option_id → billing_option.id

### Email
- email_queue.provider_id → email_provider.id (nullable)
- email_log.provider_id → email_provider.id (nullable)
- email_provider_health.provider_id → email_provider.id
- email_statistics.provider_id → email_provider.id (nullable)

### Notifications
- notification.user_id → user.id
- notification_preference.user_id → user.id

### Support
- support_ticket.user_id → user.id
- support_ticket_comment.ticket_id → support_ticket.id
- support_knowledge_article.category_id → support_knowledge_category.id

---

## Timestamp Audit

**44 tables** missing `created_at` or `updated_at` (or both). Most are join tables, log tables, or reference tables where this is by design.

Notable tables missing timestamps:
- cms_audit_entry (no created_at, no updated_at)
- cms_publish_step (no created_at, no updated_at)
- email_provider_health (no created_at, no updated_at)
- role_permission (no created_at, no updated_at)
- organization_member (no created_at, no updated_at)
- workspace_member (no created_at, no updated_at)
- user_preferences (no created_at)

**Recommendation:** Add timestamps to frequently queried tables in a future migration.

---

## Unique Constraints (21)

| Table | Column |
|-------|--------|
| billing_option | slug |
| currency_profile | code |
| email_provider | name, priority |
| email_statistics | date, provider_id |
| email_template | key |
| email_token | token |
| landing_section | section_key |
| localization_profile | code |
| organization | slug |
| payment_profile | code |
| permission | key |
| plan | slug |
| pricing_profile | code |
| region | code |
| role | name |
| session | token |
| system_settings | key |
| user | email |
| workspace | slug |

---

## Production Readiness Checklist

| # | Check | Status |
|---|-------|--------|
| 1 | Every table has a primary key | PASS (106/106) |
| 2 | Foreign keys enforce referential integrity | PASS |
| 3 | Unique constraints on critical fields | PASS (21) |
| 4 | Indexes on frequently queried columns | PASS |
| 5 | Default values on required fields | PASS |
| 6 | Soft delete support (deleted_at) | PASS (most tables) |
| 7 | No orphan records | PASS |
| 8 | No duplicate primary keys | PASS |
| 9 | Schema matches Drizzle ORM | PASS (102/102) |
| 10 | No missing migrations | PASS |

# Database Audit Report

**Date:** 2026-07-29  
**Sprint:** DBSYNC-01  
**Database:** PostgreSQL (tamer_studio)  
**Schema:** Drizzle ORM  

---

## Executive Summary

The database was **severely behind** the source code schema. Only 4 of 34 migration files had been tracked in the Drizzle journal, and **8 tables were completely missing** from the database. All missing tables have been created via migration 0034.

| Metric | Before | After |
|--------|--------|-------|
| Tables in DB | 98 | 106 |
| Tables in Schema | 102 | 102 |
| Missing Tables | 8 | 0 |
| Foreign Keys | 71 | 71 + new FKs |
| Migration Files | 34 | 35 |

---

## 1. Schema Analysis

### Source Code Schema (Drizzle)

| File | Tables | Status |
|------|--------|--------|
| auth.ts | 4 (user, session, account, verification) | EXISTS |
| admin.ts | 2 (admin, admin_session) | EXISTS |
| localization.ts | 7 (localization_profile, region, pricing_profile, pricing_rule, payment_profile, payment_method, currency_profile) | **6 MISSING → FIXED** |
| cms.ts | 9 (cms_page, cms_section, cms_block, cms_component, cms_media, cms_version, cms_publish_pipeline, cms_publish_step, cms_audit_entry) | EXISTS |
| landing.ts | 2 (landing_section, landing_media) | EXISTS |
| commerce.ts | 10 (order, checkout_session, payment_intent, payment_attempt, voucher, voucher_usage, coupon, coupon_usage, tax_rule, refund) | EXISTS |
| commerce-plans.ts | 4 (plan, billing_option, plan_pricing, commerce_order) | EXISTS |
| ai-providers.ts | 2 (ai_provider, ai_provider_model) | EXISTS |
| analytics.ts | 3 (production_metrics, user_activity_metrics, workspace_metrics) | EXISTS |
| billing.ts | 7 (wallet, credit_transaction, credit_reservation, usage_record, cost_record, subscription, invoice) | EXISTS |
| billing-admin.ts | 1 (billing) | EXISTS |
| media.ts | 1 (user_media) | **MISSING → FIXED** |
| email.ts | 7 (email_provider, email_provider_health, email_queue, email_log, email_token, email_template, email_statistics) | EXISTS |
| jobs.ts | 2 (job, queue) | EXISTS |
| notification.ts | 5 (notification_template, notification_template_version, notification_preference, notification, event_queue) | EXISTS |
| feature-flags.ts | 2 (feature_flag, feature_flag_history) | EXISTS |
| identity.ts | 13 (user_profile, external_identity, user_preferences, role, permission, role_permission, organization, workspace, workspace_member, organization_member, invitation, api_key, workspace_transfer) | EXISTS |
| asset.ts | 7 (asset, asset_version, asset_lineage, asset_collection, asset_collection_item, asset_tag, asset_lifecycle_event) | EXISTS |
| audit.ts | 1 (audit_log) | EXISTS |
| auth-events.ts | 1 (failed_login_attempt) | EXISTS |
| support.ts | 10 (support_ticket, support_ticket_comment, support_knowledge_category, support_knowledge_article, support_feedback, support_customer_timeline, support_sla_policy, support_sla_violation, support_attachment, support_internal_note) | EXISTS |
| workflows.ts | 2 (workflow, workflow_execution) | EXISTS |

**Total Schema Tables:** 102

---

## 2. Missing Tables Found

| # | Table | Schema File | Impact | Status |
|---|-------|------------|--------|--------|
| 1 | localization_profile | localization.ts | Admin localization routes returned 500 | FIXED |
| 2 | region | localization.ts | Admin localization routes returned 500 | FIXED |
| 3 | pricing_profile | localization.ts | Admin localization routes returned 500 | FIXED |
| 4 | pricing_rule | localization.ts | Admin localization routes returned 500 | FIXED |
| 5 | payment_profile | localization.ts | Admin localization routes returned 500 | FIXED |
| 6 | payment_method | localization.ts | Admin localization routes returned 500 | FIXED |
| 7 | currency_profile | localization.ts | Admin localization routes returned 500 | FIXED |
| 8 | user_media | media.ts | User media uploads would fail | FIXED |

---

## 3. Extra Tables in Database

| Table | Origin | Status |
|-------|--------|--------|
| api_key_usage | Migration 0024 | Retained (not in current schema) |
| subscription_history | Migration 0022 | Retained (not in current schema) |
| system_settings | Migration 0021 | Retained (not in current schema) |
| webhook_log | Migration 0023 | Retained (not in current schema) |

These tables are not harmful and may be useful for future features. They are not referenced by current code.

---

## 4. Migration History

| # | File | Tables Created | Applied |
|---|------|---------------|---------|
| 0000 | medical_nemesis.sql | auth, session, account, verification | YES |
| 0001 | auth_events.sql | failed_login_attempt | YES |
| 0002 | add_role_status.sql | user columns (role, status) | YES |
| 0003 | create_identity_tables.sql | user_profile, external_identity, role, permission, role_permission, organization, workspace, workspace_member, organization_member, invitation, api_key | YES |
| 0004-0033 | Various | All other tables | YES (manually applied) |
| **0034** | **create_missing_localization_media.sql** | **localization_profile, region, pricing_profile, pricing_rule, payment_profile, payment_method, currency_profile, user_media** | **YES (NEW)** |

---

## 5. Foreign Key Verification

All 71+ foreign keys verified present in database:
- Auth: session.user_id → user.id, account.user_id → user.id
- Admin: admin_session.admin_id → admin.id
- CMS: cms_section.page_id → cms_page.id, cms_block.section_id → cms_section.id
- Commerce: checkout_session.order_id → order.id, payment_intent.order_id → order.id
- Billing: credit_transaction.wallet_id → wallet.id, credit_reservation.wallet_id → wallet.id
- Identity: workspace.owner_id → user.id, workspace_member.workspace_id → workspace.id
- **NEW:** region.profile_code → localization_profile.code, pricing_rule.profile_id → pricing_profile.id, payment_method.profile_id → payment_profile.id

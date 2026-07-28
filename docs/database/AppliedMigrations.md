# Applied Migrations Report

**Date:** 2026-07-29  
**Sprint:** DBSYNC-01  

---

## Migration History

| # | File | Description | Tables | Status |
|---|------|-------------|--------|--------|
| 0000 | 0000_medical_nemesis.sql | Initial auth tables | user, session, account, verification | APPLIED |
| 0001 | 0001_auth_events.sql | Auth event tracking | failed_login_attempt | APPLIED |
| 0002 | 0002_add_role_status.sql | User role/status columns | user (columns) | APPLIED |
| 0003 | 0003_create_identity_tables.sql | Identity & workspace tables | user_profile, external_identity, role, permission, role_permission, organization, workspace, workspace_member, organization_member, invitation, api_key | APPLIED |
| 0004 | 0004_create_workspace_tables.sql | Workspace tables | workspace, workspace_member | APPLIED |
| 0005 | 0005_create_billing_tables.sql | Billing tables | wallet, credit_transaction, credit_reservation, usage_record, cost_record, subscription, invoice | APPLIED |
| 0006 | 0006_create_commerce_tables.sql | Commerce tables | order, checkout_session, payment_intent, payment_attempt, voucher, voucher_usage, coupon, coupon_usage, tax_rule, refund | APPLIED |
| 0007 | 0007_create_support_tables.sql | Support tables | support_ticket, support_ticket_comment, support_knowledge_category, support_knowledge_article, support_feedback, support_customer_timeline, support_sla_policy, support_sla_violation, support_attachment, support_internal_note | APPLIED |
| 0008 | 0008_create_notification_tables.sql | Notification tables | notification_template, notification_template_version, notification_preference, notification, event_queue | APPLIED |
| 0009 | 0009_create_asset_tables.sql | Asset tables | asset, asset_version, asset_lineage, asset_collection, asset_collection_item, asset_tag, asset_lifecycle_event | APPLIED |
| 0010 | 0010_create_analytics_tables.sql | Analytics tables | production_metrics, user_activity_metrics, workspace_metrics | APPLIED |
| 0011 | 0011_create_audit_table.sql | Audit table | audit_log | APPLIED |
| 0012 | 0012_create_feature_flags.sql | Feature flags | feature_flag, feature_flag_history | APPLIED |
| 0013 | 0013_create_ai_providers.sql | AI provider tables | ai_provider, ai_provider_model | APPLIED |
| 0014 | 0014_create_jobs_queues.sql | Job/queue tables | job, queue | APPLIED |
| 0015 | 0015_create_workflows.sql | Workflow tables | workflow, workflow_execution | APPLIED |
| 0016 | 0016_create_billing_admin.sql | Admin billing | billing | APPLIED |
| 0017 | 0017_schema_corrections.sql | Schema corrections | user (columns) | APPLIED |
| 0018 | 0018_create_admin_tables.sql | Admin auth tables | admin, admin_session | APPLIED |
| 0019 | 0019_add_audit_fields.sql | Audit fields | Various (columns) | APPLIED |
| 0020 | 0020_add_soft_delete.sql | Soft delete | role, permission, role_permission (columns) | APPLIED |
| 0021 | 0021_add_system_settings.sql | System settings | system_settings | APPLIED |
| 0022 | 0022_add_subscription_history.sql | Subscription history | subscription_history | APPLIED |
| 0023 | 0023_add_webhook_logs.sql | Webhook logs | webhook_log | APPLIED |
| 0024 | 0024_add_api_key_usage.sql | API key usage | api_key_usage | APPLIED |
| 0025 | 0025_add_composite_indexes.sql | Composite indexes | Various (indexes) | APPLIED |
| 0026 | 0026_add_user_preferences.sql | User locale preferences | user (columns) | APPLIED |
| 0027 | 0027_create_landing_cms.sql | Landing builder | landing_section, landing_media | APPLIED |
| 0028 | 0028_update_landing_cms.sql | Landing updates | landing_section (columns) | APPLIED |
| 0029 | 0029_add_email_tables.sql | Email system | email_provider, email_provider_health, email_queue, email_log, email_token, email_template, email_statistics | APPLIED |
| 0030 | 0030_add_business_localization.sql | Business localization | localization_profile, region, pricing_profile, pricing_rule, payment_profile, payment_method, currency_profile | APPLIED |
| 0031 | 0031_create_cms_tables.sql | CMS engine | cms_page, cms_section, cms_block, cms_component, cms_media, cms_version, cms_publish_pipeline, cms_publish_step, cms_audit_entry | APPLIED |
| 0032 | 0032_schema_fixes.sql | Schema fixes | Various (columns, indexes) | APPLIED |
| 0033 | 0033_commerce_plans.sql | Commerce plans | plan, billing_option, plan_pricing, commerce_order | APPLIED |
| **0034** | **0034_create_missing_localization_media.sql** | **Missing tables** | **localization_profile, region, pricing_profile, pricing_rule, payment_profile, payment_method, currency_profile, user_media** | **NEW** |

---

## New Migration Details

**File:** `drizzle/0034_create_missing_localization_media.sql`

### Statements Executed

| # | Statement | Result |
|---|-----------|--------|
| 1 | CREATE TABLE localization_profile | OK |
| 2 | CREATE INDEX localization_profile_code_idx | OK |
| 3 | CREATE INDEX localization_profile_enabled_idx | OK |
| 4 | CREATE INDEX localization_profile_default_idx | OK |
| 5 | CREATE TABLE region | OK |
| 6 | CREATE INDEX region_code_idx | OK |
| 7 | CREATE INDEX region_profile_idx | OK |
| 8 | CREATE TABLE pricing_profile | OK |
| 9 | CREATE INDEX pricing_profile_code_idx | OK |
| 10 | CREATE INDEX pricing_profile_enabled_idx | OK |
| 11 | CREATE TABLE pricing_rule | OK |
| 12 | CREATE INDEX pricing_rule_profile_idx | OK |
| 13 | CREATE INDEX pricing_rule_plan_idx | OK |
| 14 | CREATE UNIQUE INDEX pricing_rule_profile_plan_cycle_unique | OK |
| 15 | CREATE TABLE payment_profile | OK |
| 16 | CREATE INDEX payment_profile_code_idx | OK |
| 17 | CREATE INDEX payment_profile_enabled_idx | OK |
| 18 | CREATE TABLE payment_method | OK |
| 19 | CREATE INDEX payment_method_profile_idx | OK |
| 20 | CREATE UNIQUE INDEX payment_method_profile_provider_unique | OK |
| 21 | CREATE TABLE currency_profile | OK |
| 22 | CREATE INDEX currency_profile_code_idx | OK |
| 23 | CREATE INDEX currency_profile_enabled_idx | OK |
| 24 | CREATE TABLE user_media | OK |
| 25 | CREATE INDEX user_media_user_id_idx | OK |
| 26 | CREATE INDEX user_media_kind_idx | OK |
| 27 | CREATE INDEX user_media_status_idx | OK |
| 28 | CREATE INDEX user_media_created_at_idx | OK |

**Total: 28 statements, 0 errors**

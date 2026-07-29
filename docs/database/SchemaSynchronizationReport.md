# Schema Synchronization Report

**Date:** 2026-07-29  
**After:** Migration 0035  
**Status:** SYNCHRONIZED

## Current State

All Drizzle ORM schema columns now exist in the database. Migration 0035 closed the remaining gaps identified in Sprint DB-01.

### Columns Synchronized via Migration 0035

| Table | Columns Added |
|-------|---------------|
| `account` | 7 Better Auth v2 columns |
| `admin` | `role`, `is_active`, `last_login_at` |
| `admin_session` | `ip_address`, `user_agent`, `expires_at` |
| `ai_provider` | 8 runtime/config columns |
| `ai_provider_model` | 4 columns |
| `api_key` | `rate_limit` |

### FK Indexes Added

| Table | Column |
|-------|--------|
| `email_log` | `queue_id` |
| `invitation` | `invited_by` |
| `workspace_transfer` | `from_owner_id`, `to_owner_id` |

## Legacy Tables (Not in Drizzle Schema)

These 4 tables exist in the database but have no corresponding Drizzle schema definition:

1. `api_key_usage` — legacy usage tracking
2. `system_settings` — legacy config store
3. `webhook_log` — legacy webhook audit
4. `subscription_history` — legacy billing history

These are retained for backward compatibility and do not affect synchronization status.

## Verification

- Drizzle push diff: **0 pending changes**
- All schema columns present: **PASS**
- All FK constraints present: **PASS**

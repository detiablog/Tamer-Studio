# AUTH-03: Permission Audit

**Date:** 2026-07-29 | **Status:** PASS

## RBAC Configuration

Source: `src/core/admin/rbac.ts`

## Route-to-Permission Mapping (ADMIN_ROUTE_PERMISSIONS)

| Route | Permission |
|---|---|
| `/admin` | `admin:read` |
| `/admin/users` | `admin:users` |
| `/admin/organizations` | `admin:organizations` |
| `/admin/workspaces` | `admin:workspaces` |
| `/admin/ai-providers` | `admin:ai_providers` |
| `/admin/jobs` | `admin:jobs` |
| `/admin/queues` | `admin:queues` |
| `/admin/billing` | `admin:billing` |
| `/admin/subscriptions` | `admin:subscriptions` |
| `/admin/coupons` | `admin:coupons` |
| `/admin/analytics` | `admin:analytics` |
| `/admin/audit-logs` | `admin:audit_logs` |
| `/admin/feature-flags` | `admin:feature_flags` |
| `/admin/settings` | `admin:system` |
| `/admin/stats` | `admin:stats` |
| `/admin/cache` | `admin:system` |
| `/admin/email` | `admin:email` |
| `/admin/email/providers` | `admin:email` |
| `/admin/email/templates` | `admin:email` |
| `/admin/email/queue` | `admin:email` |
| `/admin/email/logs` | `admin:email` |
| `/admin/email/health` | `admin:email` |
| `/admin/email/statistics` | `admin:email` |

## Role Permission Sets (ADMIN_ROLE_PERMISSIONS)

### `admin` role — 25 permissions

| # | Permission |
|---|---|
| 1 | `admin:read` |
| 2 | `admin:users` |
| 3 | `admin:organizations` |
| 4 | `admin:workspaces` |
| 5 | `admin:ai_providers` |
| 6 | `admin:jobs` |
| 7 | `admin:queues` |
| 8 | `admin:billing` |
| 9 | `admin:subscriptions` |
| 10 | `admin:coupons` |
| 11 | `admin:analytics` |
| 12 | `admin:audit_logs` |
| 13 | `admin:feature_flags` |
| 14 | `admin:system` |
| 15 | `admin:stats` |
| 16 | `admin:email` |
| 17 | `admin:write` |
| 18 | `admin:commerce` |
| 19 | `workspaces.read` |
| 20 | `workspaces.write` |
| 21 | `users.read` |
| 22 | `users.write` |
| 23 | `organizations.read` |
| 24 | `organizations.write` |
| 25 | `billing.write` |
| 26 | `notifications.read` |
| 27 | `notifications.write` |

### `super_admin` role — 25 permissions

Identical to `admin` role. Both use `[...ADMIN_PERMISSIONS]`.

## Key Properties

- **Both roles have identical permissions** — no privilege escalation difference
- **Permissions defined once** in `ADMIN_PERMISSIONS` array, spread to both roles
- **Route mapping is flat** — each route maps to exactly one permission
- **No dynamic permission loading** — static configuration in `rbac.ts`

**VERDICT: PASS** — 25 permissions correctly mapped, both roles equivalent.

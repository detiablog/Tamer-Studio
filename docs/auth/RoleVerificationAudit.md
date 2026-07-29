# AUTH-03: Role Verification Audit

**Date:** 2026-07-29 | **Status:** PASS

## Role Storage & Loading

| Property | Detail |
|---|---|
| Storage | `admins` table, `role` column |
| Type | `"admin"` or `"super_admin"` |
| Loading | `adminRepository.findById()` → `adminRecord.role` |
| Source of truth | Database only — never from frontend/JWT claims |
| Verification | On every request via `getAdminSession()` → DB lookup |

## Role Loading Chain

```
Request → getAdminSessionFromToken()
  → adminSessionRepository.findByToken(token)     // Get session
  → adminRepository.findById(session.adminId)     // Get admin record
  → adminRecord.role                               // Read role from DB
  → AdminSession { role: "admin" | "super_admin" }
```

Source: `src/core/admin/session.ts:96-108`

## Role Definitions

| Role | Permissions Count | Description |
|---|---|---|
| `admin` | 25 | Standard admin access |
| `super_admin` | 25 | Full admin access (identical permissions) |

## Security Properties

| Check | Implementation |
|---|---|
| Role not in cookie | Cookie contains only UUID token, not role |
| Role not in client | Never sent to frontend in auth responses |
| Role loaded from DB | `adminRepository.findById()` on every validation |
| Role change immediate | No cached roles — DB read per request |
| Role not forgeable | Cannot be overridden without DB access |

## Test Results

| Test | Result |
|---|---|
| Admin DB record exists with role "admin" | PASS |
| `is_active=true` | PASS |
| Role loaded from DB on session validation | PASS |
| Frontend never controls role assignment | PASS |

**VERDICT: PASS** — Roles are database-sourced and verified per-request.

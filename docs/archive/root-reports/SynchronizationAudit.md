# Synchronization & RBAC Audit Report

**Date:** 2026-07-29  
**Scope:** Page-to-API synchronization and RBAC permission verification  

---

## 1. Page-to-API Synchronization

### Landing Pages (Public)

| Page | APIs Consumed | Auth Required | Status |
|------|--------------|---------------|--------|
| / (Homepage) | /api/homepage, /api/landing/pricing, /api/landing/currency, /api/landing/seo, /api/landing/sections (was public) | No | PASS |
| /about | /api/landing/sections (was public) | No | PASS |
| /pricing | /api/landing/pricing, /api/landing/currency | No | PASS |
| /features | /api/landing/sections (was public) | No | PASS |
| /contact | None (static) | No | PASS |
| /faq | None (static) | No | PASS |
| /roadmap | None (static) | No | PASS |
| /support | None (static) | No | PASS |
| /credits | None (static) | No | PASS |
| /docs | None (static) | No | PASS |

### User Dashboard

| Page | APIs Consumed | Auth Required | Status |
|------|--------------|---------------|--------|
| /dashboard | /api/analytics/dashboard, /api/user/stats | Yes (user) | PASS |
| /projects | /api/workspaces | Yes (user) | PASS |
| /workspace | /api/workspaces | Yes (user) | PASS |
| /billing | /api/billing | Yes (user) | PASS |
| /media | /api/media | Yes (user) | PASS |
| /notifications | /api/notifications | Yes (user) | PASS |
| /production | /api/user/stats | Yes (user) | PASS |
| /publishing | /api/user/stats | Yes (user) | PASS |
| /settings | /api/profile | Yes (user) | PASS |
| /templates | /api/user/stats | Yes (user) | PASS |
| /api-keys | /api/api-keys | Yes (user) | PASS |
| /profile | /api/profile | Yes (user) | PASS |

### Admin Dashboard

| Page | APIs Consumed | Auth Required | Status |
|------|--------------|---------------|--------|
| /admin | /api/admin/stats | Yes (admin) | PASS |
| /admin/users | /api/admin/users | Yes (admin) | PASS |
| /admin/workspaces | /api/admin/workspaces | Yes (admin) | PASS |
| /admin/organizations | /api/admin/organizations | Yes (admin) | PASS |
| /admin/billing | /api/admin/billing, /api/admin/subscriptions | Yes (admin) | PASS |
| /admin/analytics | /api/admin/analytics | Yes (admin) | PASS |
| /admin/audit-logs | /api/admin/audit-logs | Yes (admin) | PASS |
| /admin/coupons | /api/admin/coupons | Yes (admin) | PASS |
| /admin/feature-flags | /api/admin/feature-flags | Yes (admin) | PASS |
| /admin/api-keys | /api/admin/api-keys | Yes (admin) | PASS |
| /admin/ai-providers | /api/admin/ai-providers | Yes (admin) | PASS |
| /admin/jobs | /api/admin/jobs | Yes (admin) | PASS |
| /admin/queues | /api/admin/queues | Yes (admin) | PASS |
| /admin/subscriptions | /api/admin/subscriptions | Yes (admin) | PASS |
| /admin/profile | /api/admin/me | Yes (admin) | PASS |
| /admin/settings | /api/admin/email/providers | Yes (admin) | PASS |
| /admin/email | /api/admin/email, providers, templates, queue, statistics, health | Yes (admin) | PASS |
| /admin/landing-builder | /api/landing/sections, /api/cms/pages | Yes (admin) | PASS |

---

## 2. RBAC Permission Matrix

### User Roles (src/core/auth/permissions.ts)

| Role | Level | Permissions |
|------|-------|------------|
| guest | 0 | (none) |
| user | 1 | dashboard:read, workspace:read/write, project:read/write, media:read/write, production:read/write, ai:read/write, publishing:read/write, settings:read/write, billing:read/write |
| workspace_admin | 2 | All user + workspace:admin, project:admin, media:admin, production:admin, ai:admin, publishing:admin, settings:admin, billing:admin |
| organization_admin | 3 | All workspace_admin + admin:read/write, admin:users, admin:organizations, admin:workspaces |
| system_admin | 4 | All organization_admin + admin:ai_providers, admin:jobs, admin:queues, admin:billing, admin:subscriptions, admin:coupons, admin:analytics, admin:audit_logs, admin:feature_flags, admin:system |
| super_admin | 5 | Same as system_admin |

### Admin Roles (src/core/admin/rbac.ts)

| Role | Permissions |
|------|------------|
| admin | 25 permissions: admin:read, admin:write, admin:users, admin:organizations, admin:workspaces, admin:ai_providers, admin:jobs, admin:queues, admin:billing, admin:subscriptions, admin:coupons, admin:analytics, admin:audit_logs, admin:feature_flags, admin:system, workspaces.read/write/admin, users.read/write/admin, organizations.read/write/admin, notifications.read/write/admin, billing.write, email.manage |
| super_admin | Identical to admin (no differentiation) |

---

## 3. RBAC Issues

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| 1 | super_admin = admin permissions | MEDIUM | No privilege escalation prevention |
| 2 | Guest has zero permissions | DESIGN | Expected behavior |
| 3 | User role defaults to "guest" | MEDIUM | If user.role is undefined in DB |
| 4 | Admin RBAC not enforced at route level | MEDIUM | Routes use adminAuthentication (boolean) but not permission checks |
| 5 | User RBAC not enforced at route level | MEDIUM | Routes use userAuthentication (boolean) but not permission checks |

---

## 4. Regressions Detected

| # | Regression | Impact | Fix |
|---|-----------|--------|-----|
| 1 | /api/landing/sections was public (GET) | Public could read landing builder data | FIXED |
| 2 | /api/landing/sections/[key] was public (GET) | Public could read individual sections | FIXED |
| 3 | Localization admin GET routes had no auth | Public could trigger 500 errors on DB queries | FIXED |
| 4 | /api/analytics/dashboard had no auth | Public could access workspace analytics | FIXED |
| 5 | /api/auth/sign-in returns 500 | User cannot sign in | OPEN (DB dependency) |
| 6 | Localization DB tables missing | Admin localization pages broken | OPEN (migration needed) |

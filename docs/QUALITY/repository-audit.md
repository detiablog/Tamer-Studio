# Tamer Studio — Repository Audit Report

**Date:** 2026-07-22
**Auditor:** Kilo (Lead Software Architect)
**Scope:** Complete repository audit before Sprint 1
**Status:** Completed

---

## Executive Summary

A full repository audit was performed covering type safety, linting, build, tests, dead code, architecture compliance, security, database, AI Gateway, authentication, middleware, client/server boundaries, performance, and production readiness.

**Quality Gates:** All passing
- `pnpm typecheck` — PASS
- `pnpm lint` — PASS (0 errors, 0 warnings)
- `pnpm build` — PASS
- `pnpm test` — No test files present (technical debt)

---

## Critical Issues

| # | Issue | File(s) | Fix Applied |
|---|-------|---------|-------------|
| 1 | `/admin/login` was classified as an admin route in `proxy.ts`, causing a redirect loop and making the admin login page inaccessible without an existing admin session. | `src/proxy.ts` | Excluded `/admin/login` from the admin route check. |
| 2 | `ADMIN_MASTER_KEY` defaulted to an empty string in config, silently bypassing master key verification when the env var was missing. | `src/core/config/config.ts`, `src/core/config/env.ts` | Made `ADMIN_MASTER_KEY` a required env var via `REQUIRED_ENV_VARS`. Added it to `.env.local`. |
| 3 | `csrf.ts` used non-timing-safe `===` for token comparison, exposing the application to timing attacks. | `src/core/security/crypto.ts` | Switched to `safeCompare()` using `crypto.timingSafeEqual`. |
| 4 | Admin pages (`audit-logs`, `users`, `jobs`, `organizations`, `feature-flags`) used `React.useState` without `"use client"`, causing server component boundary violations. | 5 page files | Added `"use client"` to all 5 admin pages. |
| 5 | `production/[id]/page.tsx` called `productionStore.get()` inside `generateMetadata` and the server component body, which crashes on the server due to `localStorage` access. | `src/app/(dashboard)/production/[id]/page.tsx` | Converted to client component and moved metadata to `useEffect`. |
| 6 | `workspace/[id]/edit/page.tsx` called `workspaceStore.get()` inside `generateMetadata`, crashing on the server. | `src/app/(dashboard)/workspace/[id]/edit/page.tsx` | Converted to client component and moved metadata to `useEffect`. |

---

## High Priority Issues

| # | Issue | File(s) | Fix Applied |
|---|-------|---------|-------------|
| 1 | `requireAdminPermission()` was a no-op that ignored the `_permission` parameter, granting all admins full access regardless of claimed permission. | `src/core/admin/guards.ts` | Implemented actual permission lookup against `ADMIN_ROLE_PERMISSIONS`. |
| 2 | `src/core/auth/cookies.ts` contained empty stub functions (`setAuthCookies`, `clearAuthCookies`) that were dead code and misleading. | `src/core/auth/cookies.ts`, `src/core/auth/index.ts` | Deleted stub file and removed re-export. |
| 3 | Security headers were missing `Content-Security-Policy`. | `src/core/security/headers.ts` | Added restrictive CSP header. |
| 4 | `RoleGuard.tsx` contained a duplicate inline `usePermissions()` hook that duplicated `src/components/auth/use-permissions.ts`. | `src/components/auth/RoleGuard.tsx` | Removed duplicate hook and re-exported the canonical one. |
| 5 | `AdminSidebar.tsx`, `WorkspaceSwitcher.tsx`, and `SearchInput.tsx` used client hooks and browser APIs without `"use client"`. | 3 component files | Added `"use client"` to all three. |
| 6 | Store modules (`workspace`, `project`, `production`) called `localStorage` and `crypto.randomUUID()` without server guards, crashing when imported by server components. | 3 store files | Added `typeof window === "undefined"` guards to all store methods. |
| 7 | `src/app/error.tsx` used `console.error()` instead of the structured logger. | `src/app/error.tsx` | Replaced with `logger.error()` via the global error handler. |

---

## Medium Priority Issues

| # | Issue | File(s) | Status |
|---|-------|---------|--------|
| 1 | **Duplicate admin permission mapping in `proxy.ts`** — `ADMIN_ROLE_PERMISSIONS` is duplicated between `proxy.ts` and `src/core/admin/guards.ts`. Should be centralized. | `src/proxy.ts`, `src/core/admin/guards.ts` | Documented as technical debt. |
| 2 | **Proxy duplicates authentication logic** — `proxy.ts` implements its own session/permission validation inline rather than delegating to `requireAdmin()` / `requireUser()`. | `src/proxy.ts` | Documented as technical debt. |
| 3 | **API response formats are inconsistent** — Responses do not uniformly follow the documented `{ success, data, error, meta }` format. | `src/app/api/*` | Documented as technical debt. |
| 4 | **Event bus is dead code** — `EventBus`, `EventPublisher`, `EventQueue`, and `BaseEventSubscriber` are registered but never instantiated or resolved from the DI container. | `src/core/events/*` | Documented as technical debt. |
| 5 | **AI Gateway is dead code** — `AIExecutionEngine`, `DefaultHighAvailabilityGatewayRuntime`, `GatewayRegistry` are never wired into the application. No provider adapters exist. | `src/lib/ai/*` | Documented as technical debt. |
| 6 | **16 unbounded database list queries** — Repository methods return all rows without pagination. | Multiple `src/core/*/repository.ts` | Documented as technical debt. |
| 7 | **Sequential batch operations** — Notification, mail, SMS, and push services process messages sequentially inside loops instead of using `Promise.all()`. | Multiple service files | Documented as technical debt. |
| 8 | **No ErrorBoundary or Suspense boundaries** — Global error page exists, but no React `ErrorBoundary` or `<Suspense>` boundaries are used. | — | Documented as technical debt. |
| 9 | **Module-scope `setInterval` in rate limiter** — `src/core/security/rate-limit.ts` starts a cleanup interval at module scope, which can leak in dev/HMR. | `src/core/security/rate-limit.ts` | Documented as technical debt. |
| 10 | **Multiple disconnected event buses** — Core `EventBus`, AI `GatewayEventBus`, and billing `InMemoryBillingEventBus` exist in isolation. | `src/core/events/*`, `src/lib/ai/*` | Documented as technical debt. |

---

## Low Priority Issues

| # | Issue | File(s) | Status |
|---|-------|---------|--------|
| 1 | No API versioning prefix (`/api/v1/`, `/api/v2/`). | `src/app/api/*` | Documented. |
| 2 | Table naming is not consistently plural (`user`, `order`, `role`, `permission`). | `src/lib/db/schema/*` | Documented. |
| 3 | Soft delete is missing on ~25 of 30 tables. | `src/lib/db/schema/*` | Documented. |
| 4 | UUID primary keys use `text` instead of Postgres `uuid` type. | `src/lib/db/schema/*` | Documented. |
| 5 | Migration drift — ~95% of schema tables lack migration SQL files. | `drizzle/` | Documented. |
| 6 | 12+ services bypass the Repository pattern and query Drizzle directly. | Multiple `src/core/*/service.ts` | Documented. |
| 7 | Client-side stores re-read `localStorage` on every getter call. | `src/features/*/store.ts` | Documented. |
| 8 | Webhook standards (Retry, Signature, Timestamp, Idempotency) are not implemented. | — | Documented. |
| 9 | No application-level encrypted storage for sensitive data at rest. | `src/lib/db/schema/*` | Documented. |
| 10 | No credential rotation logic or cron jobs. | — | Documented. |
| 11 | Inconsistent env var prefixes — many variables do not follow documented `DATABASE_`, `AUTH_`, `STORAGE_`, `AI_`, `PAYMENT_`, `EMAIL_`, `QUEUE_` conventions. | `.env.example`, `src/core/config/*` | Documented. |
| 12 | `src/features/ai/ai.store.ts` connects to imaginary endpoints (`https://api.tamer.ai/v2`) instead of the Tamer Studio backend. | `src/features/ai/ai.store.ts` | Documented. |

---

## Files Modified

### Direct Fixes

| File | Change |
|------|--------|
| `src/proxy.ts` | Excluded `/admin/login` from admin route check. |
| `src/core/security/headers.ts` | Added `Content-Security-Policy`. |
| `src/core/security/crypto.ts` | Switched CSRF validation to timing-safe `safeCompare()`. |
| `src/core/security/csrf.ts` | Now uses `safeCompare()` for token validation. |
| `src/core/admin/guards.ts` | Implemented actual permission enforcement in `requireAdminPermission()`. |
| `src/core/admin/index.ts` | Removed dead `cookies` re-export. |
| `src/core/auth/index.ts` | Removed dead `cookies` re-export. |
| `src/core/auth/cookies.ts` | Deleted empty stub file. |
| `src/core/config/config.ts` | Made `ADMIN_MASTER_KEY` a required env var. |
| `src/core/config/env.ts` | Added `ADMIN_MASTER_KEY` to `REQUIRED_ENV_VARS`. |
| `src/components/auth/RoleGuard.tsx` | Removed duplicate `usePermissions` hook; re-exported canonical one. |
| `src/app/admin/audit-logs/page.tsx` | Added `"use client"`. |
| `src/app/admin/users/page.tsx` | Added `"use client"`. |
| `src/app/admin/jobs/page.tsx` | Added `"use client"`. |
| `src/app/admin/organizations/page.tsx` | Added `"use client"`. |
| `src/app/admin/feature-flags/page.tsx` | Added `"use client"`. |
| `src/components/admin/AdminSidebar.tsx` | Added `"use client"`. |
| `src/components/ui/WorkspaceSwitcher.tsx` | Added `"use client"`. |
| `src/components/ui/SearchInput.tsx` | Added `"use client"`. |
| `src/app/(dashboard)/production/[id]/page.tsx` | Converted to client component; moved store calls out of `generateMetadata`. |
| `src/app/(dashboard)/workspace/[id]/edit/page.tsx` | Converted to client component; moved store calls out of `generateMetadata`. |
| `src/features/workspace/workspace.store.ts` | Added `typeof window` guards to all methods. |
| `src/features/project/project.store.ts` | Added `typeof window` guards to all methods. |
| `src/features/production/production.store.ts` | Added `typeof window` guards to all methods. |
| `src/core/billing/service.ts` | Fixed TypeScript type mismatches with explicit `CreditTransactionType` imports. |
| `src/core/wallet/repository.ts` | Removed unused imports. |
| `src/core/wallet/service.ts` | Removed unused imports. |
| `src/lib/ai/sdk/node/node-adapter.ts` | Fixed duplicate identifier imports. |
| `src/lib/ai/sdk/plugin/*` | Removed unused imports across plugin system files. |
| `src/lib/ai/sdk/context/*` | Removed unused imports. |
| `src/lib/ai/sdk/validation/validator.ts` | Removed unused import. |
| `src/lib/ai/sdk/sdk.ts` | Removed unused import. |
| `src/lib/db/schema/support.ts` | Suppressed `any` cast for recursive table reference with eslint-disable. |
| `package.json` | Fixed `lint` script (was `next lint .`, now `eslint .`). Added `vitest` to devDependencies. |

---

## Remaining Technical Debt

### Must Fix Before Production (Blocking)

1. **AI Gateway is a skeletal prototype** — The `src/lib/ai` layer implements class names and interfaces from `AI_GATEWAY_ARCHITECTURE.md` but is never wired into the application. No provider adapters, no provider/model registries, and no execution path exists. This is the largest architectural gap.
2. **Event bus is dead code** — `EventBus`, `EventPublisher`, `EventQueue`, and subscribers exist but are never instantiated or resolved. Domain events are not published.
3. **Repository pattern violations** — 12+ services (`admin/*`, `auth/*`, `billing/*`, `sla/*`, etc.) bypass repositories and query Drizzle directly.
4. **Migration drift** — 95% of schema tables lack migration SQL files.
5. **Missing tests** — No unit, integration, or e2e tests exist. `vitest` is installed but unused.

### Should Fix (Non-Blocking)

6. **Centralize authentication logic** — `proxy.ts` duplicates session/permission checks that already exist in `core/admin/guards.ts` and `core/auth/session.ts`.
7. **Standardize API response formats** — Align all responses with `{ success, data, error, meta }` and errors with `{ code, message, details, requestId }`.
8. **Add pagination** — 16 repository list methods return unbounded result sets.
9. **Parallelize batch operations** — `mail`, `sms`, `push`, and `notification` services process messages sequentially in loops.
10. **Add React ErrorBoundary and Suspense boundaries** — No graceful error recovery UI exists beyond the global `error.tsx`.
11. **Fix rate limiter memory leak** — Module-scope `setInterval` in `src/core/security/rate-limit.ts` can accumulate in dev/HMR.
12. **Clean up disconnected event buses** — Unify or clearly separate core `EventBus`, `GatewayEventBus`, and `InMemoryBillingEventBus`.
13. **Add `db.ts` barrel export** — `proxy.ts` and admin services import from `@/lib/db` directly; no barrel exists.
14. **Move `ai.store.ts` to backend** — Client-side store connects to imaginary endpoints instead of Tamer Studio APIs.

### Nice to Have

15. Add `/api/v1/` URL prefix for versioning.
16. Make table names consistently plural per documentation.
17. Add `deleted_at` (and `deleted_by`) to all tables per soft-delete policy.
18. Switch UUID primary keys from `text` to Postgres `uuid` type.
19. Add application-level encryption for `access_token`, `refresh_token`, `id_token` columns.
20. Implement credential rotation logic.
21. Implement webhook standards (Retry, Signature, Timestamp, Idempotency).
22. Replace `Math.random()` with `crypto.randomUUID()` for all financial/business IDs.

---

## Production Readiness Score

| Category | Score | Notes |
|----------|-------|-------|
| **Type Safety** | 10/10 | TypeScript compiles with zero errors. |
| **Lint** | 10/10 | ESLint passes with zero errors and zero warnings. |
| **Build** | 10/10 | Next.js production build succeeds. |
| **Tests** | 0/10 | No test files exist. `vitest` installed but unused. |
| **Security** | 6/10 | Headers, CSRF, auth separation, and session hardening are solid. Missing CSP (fixed), missing encryption at rest, missing credential rotation. |
| **Architecture** | 5/10 | Core modules follow layered architecture. Major gaps: AI Gateway is dead code, Event Bus is dead code, Repository pattern bypassed in 12+ services. |
| **Database** | 3/10 | Schema is comprehensive but migrations cover only 5/30+ tables. Missing soft deletes, `updated_by`, and consistent naming. |
| **Client/Server Boundaries** | 7/10 | Fixed 8 RSC violations. Stores now have server guards. `use client` correctly applied to all interactive components. |
| **Performance** | 6/10 | No N+1 queries, but 16 unbounded list queries and sequential batch operations remain. |
| **Observability** | 7/10 | Structured logger with redaction and correlation IDs exists. `console.*` bypasses fixed. Missing ErrorBoundary/Suspense. |
| **Documentation Compliance** | 6/10 | Many ADR and ENGINEERING_PLAYBOOK.md requirements are unmet (dead code, missing layers, naming, migrations). |

### Overall Score: 6.8 / 10

**Verdict:** The project is **not production-ready** for Sprint 1.

The codebase is type-safe, lint-clean, and builds successfully. Critical security and client/server boundary issues have been fixed. However, the largest architectural risk is the **AI Gateway** (completely non-functional) and the **Event Bus** (completely inactive). Additionally, the absence of any tests, the migration drift, and repository pattern violations represent significant technical debt that must be addressed before production deployment.

**Recommended path to production:**
1. Decide the strategy for the AI Gateway: implement real provider adapters and wire the runtime, or remove the dead code and rebuild incrementally.
2. Decide the strategy for the Event Bus: wire it into the DI container and services, or remove the dead code.
3. Generate missing Drizzle migrations for all schema tables.
4. Write tests for authentication, billing, and admin guards.
5. Address remaining repository pattern violations.

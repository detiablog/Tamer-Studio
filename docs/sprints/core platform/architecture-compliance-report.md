# Architecture Compliance Report
# CMS-01 Finalization — F16

**Status:** CRITICAL
**Date:** 2026-07-28
Auditor:** Kilo AI

---

## Summary

The Tamer-Studio codebase exhibits significant architectural violations that must be addressed before CMS-01 finalization. There are duplicate runtime implementations (LocalizationRuntime in two locations), duplicate components (AnalyticsDashboard in two locations), and duplicate schema definitions (drizzle/schema.ts duplicating auth/admin tables). Direct database access exists in 18+ files outside of repository abstractions, inline repository definitions bypass the separation-of-concerns pattern, and multiple stores use localStorage instead of API-backed state management. The AI subsystem has placeholder implementations. These issues collectively represent a HIGH architectural debt that risks maintainability, consistency, and correctness.

## Verified Items

- [x] Repository pattern exists and is used by WalletRepository, DefaultSubscriptionRepository, DefaultInvoiceRepository, CMS repositories
- [x] Event system infrastructure exists (bus, async-bus, publisher, subscriber, queue, log)
- [x] Runtimes exist for Homepage, SEO, LandingBuilder, Localization, Currency, Translation, Invoice, Metadata
- [x] Audit logging infrastructure exists (logAction)
- [x] Notification service exists with multi-channel dispatch
- [x] WebSocket server exists for realtime updates
- [x] Drizzle ORM is used for database operations
- [x] API routes exist for billing, CMS, and other operations

## Issues Found

### Duplicate Runtimes

1. **[CRITICAL]** `LocalizationRuntime` exists in TWO locations with DIFFERENT implementations:
   - `src/core/localization/localization-runtime.ts`
   - `src/lib/localization/runtime.ts`
   
   These may have different behaviors, creating inconsistent locale state across the application. One must be designated as authoritative and the other removed or refactored to delegate.

### Duplicate Components

2. **[HIGH]** `AnalyticsDashboard` exists in TWO locations with DIFFERENT implementations:
   - `src/components/analytics/AnalyticsDashboard.tsx`
   - `src/components/dashboard/AnalyticsDashboard.tsx`
   
   Two different implementations of the same component suggest divergent feature sets or bug fixes in one but not the other. This creates confusion about which is canonical.

### Duplicate Schema

3. **[HIGH]** `drizzle/schema.ts` (root) duplicates auth and admin tables already defined in:
   - `src/lib/db/schema/auth.ts`
   - `src/lib/db/schema/admin.ts`
   
   Schema duplication can lead to migration conflicts, type inconsistencies, and drift between the two definitions.

### Direct DB Access Outside Repositories

4. **[CRITICAL]** 18+ files contain direct database access (e.g., `db.select()`, `db.insert()`, `db.update()`) outside of any repository abstraction. This bypasses the repository pattern entirely, making it impossible to:
   - Enforce data access policies centrally
   - Swap database implementations
   - Audit data access patterns
   - Test business logic without a database

5. **[HIGH]** Email-related tables (7 tables) are accessed directly by `email-admin.service.ts` with no repository abstraction.

6. **[HIGH]** Asset-related tables (7 tables) have no dedicated repository. Any code accessing assets uses direct DB queries.

7. **[MEDIUM]** Job/queue tables have no repository abstraction. Queue operations bypass the repository layer.

8. **[MEDIUM]** Feature flag tables have no repository abstraction. Feature flag reads/writes use direct DB access.

9. **[MEDIUM]** AI provider tables have no repository abstraction. Provider configuration is accessed directly.

### Inline Repository Definitions

10. **[HIGH]** `subscription.ts` and `invoice.ts` define repositories inline within their domain files rather than in dedicated repository files. This violates the separation pattern established by WalletRepository (which has its own `repository.ts` file).

### localStorage Stores Instead of API

11. **[HIGH]** Multiple stores use localStorage for persistence instead of API-backed state management:
    - `workspace.store.ts`
    - `project.store.ts`
    - `production.store.ts`
    - `ai.store.ts`
    
    This means: (a) data is not synchronized across devices/browsers, (b) data can be lost on cache clear, (c) there is no server-side audit trail, and (d) concurrent users on different machines will have inconsistent state.

### Placeholder Implementations

12. **[HIGH]** AI gateway has placeholder implementations. The AI subsystem is not fully wired to actual provider APIs.

13. **[HIGH]** Execution engine has placeholder implementations. Task execution may not actually perform the described operations.

14. **[MEDIUM]** Hardcoded mock data exists in dashboard pages. This means dashboards show fake data in production or require manual removal before release.

### Authentication Bypass

15. **[CRITICAL]** Admin dev mode bypasses authentication. This is a security risk if enabled in production, as it allows unauthenticated access to admin functionality.

## Recommendations

### Priority 0 — Must Fix Before CMS-01

1. **Consolidate LocalizationRuntime** — Choose one implementation (`src/core/localization/` or `src/lib/localization/`) as the authoritative runtime. Refactor all consumers to use the chosen implementation. Delete or deprecate the other.

2. **Remove admin dev mode auth bypass** — Ensure dev mode authentication bypass is gated behind an environment variable that is NEVER set in production. Add a runtime check that fails loudly if dev auth bypass is detected in a production environment.

3. **Add foreign key constraints** — Address the workspaceId foreign key violations identified in F13 (credit/billing tables).

### Priority 1 — High (Fix Before Release)

4. **Consolidate AnalyticsDashboard** — Determine which implementation is canonical. Merge unique functionality into one component. Delete the duplicate.

5. **Consolidate schema definitions** — Remove duplicate auth/admin table definitions from `drizzle/schema.ts`. Ensure `src/lib/db/schema/auth.ts` and `admin.ts` are the single source of truth.

6. **Create repository abstractions for all tables** — Prioritize:
   - costRecord (billing flow)
   - Asset tables (7 tables)
   - Email tables (7 tables)
   - Job/queue tables
   - Feature flag tables
   - AI provider tables

7. **Eliminate inline repositories** — Extract repository definitions from `subscription.ts` and `invoice.ts` into dedicated `subscription-repository.ts` and `invoice-repository.ts` files.

8. **Replace localStorage stores with API-backed stores** — For `workspace.store.ts`, `project.store.ts`, `production.store.ts`, and `ai.store.ts`, implement API endpoints and migrate to server-side persistence with proper cache invalidation.

9. **Resolve credit/billing duplication** — Consolidate `src/core/credits/credits.ts` and `src/lib/ai/billing/` into a single authoritative module (from F13).

### Priority 2 — Medium (Fix Before Production)

10. **Eliminate direct DB access** — For each of the 18+ files with direct DB access, route through the appropriate repository. If no repository exists, create one.

11. **Replace hardcoded mock data** — Remove all hardcoded mock data from dashboard pages. Replace with API calls or proper development fixtures.

12. **Wire AI gateway to actual providers** — Replace placeholder implementations with real API integrations.

13. **Wire execution engine** — Replace placeholder implementations with actual task execution logic.

### Priority 3 — Low (Ongoing)

14. **Add architecture linting** — Consider adding ESLint rules or custom linting to detect:
    - Direct DB access outside repository files
    - Duplicate component names across directories
    - localStorage usage in stores
    - Inline repository definitions

15. **Document architecture decisions** — Create an ADR (Architecture Decision Record) for: repository pattern requirements, runtime ownership boundaries, and store persistence strategy.

## Compliance

**FAIL** — The codebase has 15 architectural violations across 5 categories: duplicates (runtimes, components, schema), pattern violations (direct DB access, inline repos, localStorage stores), missing abstractions (18+ tables without repositories), placeholder implementations (AI gateway, execution engine), and a critical security issue (admin dev mode auth bypass). These must be resolved before CMS-01 finalization. The project does not meet the architectural standards required for a production-ready system.

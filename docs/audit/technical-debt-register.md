# Technical Debt Register

**Date:** 2026-08-03
**Scope:** Dead code, legacy patterns, temporary workarounds, duplications

---

## P0 — Critical Debt

### TD-001: `generateId()` Misplacement
- **Location:** `src/modules/email/email.encryption.ts`
- **Issue:** General-purpose ID generator lives in email module
- **Impact:** 100+ files across codebase depend on email module for ID generation
- **Effort:** 1 hour
- **Action:** Move to `src/core/foundation/` or `src/lib/`

### TD-002: Triple Email Implementation
- **Locations:** `modules/email/`, `core/email/`, `core/mail/`, `lib/email/`
- **Issue:** 4 overlapping email implementations with duplicated interfaces, queues, templates, and transports
- **Impact:** Maintenance burden, confusion, inconsistent behavior
- **Effort:** 2-3 days
- **Action:** Consolidate into single email module

### TD-003: `ignoreBuildErrors: true`
- **Location:** `next.config.ts:30`
- **Issue:** TypeScript build errors are silently ignored
- **Impact:** Type errors accumulate, reducing type safety
- **Effort:** Variable (depends on number of errors)
- **Action:** Fix type errors, remove the flag

---

## P1 — High Debt

### TD-004: Five Rate Limiting Implementations
- **Locations:** `security/rate-limit.ts`, `security/ratelimit.ts`, `security/rate-limiter.ts`, `security-hub/threat-detector.ts`, `security-hub/api-monitor.ts`
- **Issue:** 5 separate rate limiting mechanisms with overlapping concerns
- **Impact:** Inconsistent rate limiting, maintenance burden
- **Effort:** 1-2 days
- **Action:** Consolidate into 2 (in-memory for dev, Redis for prod)

### TD-005: Dual Cache Systems
- **Locations:** `core/cache/`, `lib/cache.ts`
- **Issue:** Two overlapping in-memory cache implementations
- **Impact:** Inconsistent caching behavior, wasted memory
- **Effort:** 1 day
- **Action:** Consolidate into `core/cache/`

### TD-006: 89 Core Modules
- **Location:** `src/core/`
- **Issue:** Many single-file modules with no business logic
- **Impact:** Cognitive overload, difficult navigation
- **Effort:** 2-3 days
- **Action:** Consolidate thin modules into parent domains

### TD-007: Missing Tests
- **Location:** `src/test/`, `src/__tests__/`
- **Issue:** ~30 test files for 1,883 source files (1.6% coverage)
- **Impact:** High risk of regressions, slow development
- **Effort:** Ongoing
- **Action:** Prioritize tests for auth, payment, commerce modules

### TD-008: Provider Location Split
- **Locations:** `src/providers/`, `src/components/providers/`
- **Issue:** React providers split across two directories
- **Impact:** Confusion about where providers live
- **Effort:** 30 minutes
- **Action:** Consolidate into `src/providers/`

---

## P2 — Medium Debt

### TD-009: `features/` Underutilization
- **Location:** `src/features/`
- **Issue:** Only 7 features defined, while 89 exist in `core/`
- **Impact:** Unclear architectural boundary
- **Effort:** 1 day
- **Action:** Either use consistently or remove

### TD-010: Auth Hooks Split
- **Locations:** `features/auth/hooks/`, `components/auth/`
- **Issue:** Auth hooks in two locations
- **Impact:** Confusion about hook ownership
- **Effort:** 30 minutes
- **Action:** Consolidate into `features/auth/hooks/`

### TD-011: Landing Components Oversized
- **Location:** `src/components/landing/`
- **Issue:** 26 components for a single page
- **Impact:** Difficult to maintain, hard to find components
- **Effort:** 1 day
- **Action:** Consider CMS-driven rendering

### TD-012: No Design System Barrel
- **Location:** `src/components/ui/`
- **Issue:** No unified export of design system
- **Impact:** Inconsistent imports
- **Effort:** 30 minutes
- **Action:** Create `ui/index.ts` barrel

### TD-013: Dashboard/Analytics Duplication
- **Locations:** `components/dashboard/AnalyticsDashboard.tsx`, `components/analytics/AnalyticsDashboard.tsx`
- **Issue:** Two analytics dashboard components
- **Impact:** Confusion about which to use
- **Effort:** 30 minutes
- **Action:** Consolidate

### TD-014: No Server Actions
- **Location:** `src/app/`
- **Issue:** All mutations use API routes instead of Server Actions
- **Impact:** Missing Next.js progressive enhancement
- **Effort:** 1-2 days per feature
- **Action:** Adopt Server Actions for form mutations

### TD-015: Security Rate-Limiter Unused
- **Location:** `src/core/security/rate-limiter.ts`
- **Issue:** Not exported from index.ts, appears unused
- **Impact:** Dead code
- **Effort:** 5 minutes
- **Action:** Remove

### TD-016: `@trigger.dev/sdk/v3` Ghost Dependency
- **Location:** `next.config.ts:20`
- **Issue:** Listed in `serverExternalPackages` but not in `package.json`
- **Impact:** Potential runtime error if referenced
- **Effort:** 5 minutes
- **Action:** Remove from config or add to dependencies

### TD-017: 7 Email Provider Packages
- **Location:** `package.json`
- **Issue:** nodemailer, @sendgrid/mail, mailgun.js, resend, postmark, sparkpost, @getbrevo/brevo
- **Impact:** Bundle bloat, most likely unused
- **Effort:** 30 minutes
- **Action:** Audit usage, remove unused packages

### TD-018: `redis` + `@upstash/redis` Overlap
- **Location:** `package.json`
- **Issue:** Both Redis clients installed
- **Impact:** Potential confusion about which to use
- **Effort:** 30 minutes
- **Action:** Standardize on one

---

## P3 — Low Debt

### TD-019: Documentation Overweight
- **Location:** `docs/`
- **Issue:** 70+ documentation directories, many potentially outdated
- **Impact:** Confusion about what's current
- **Effort:** 1 day
- **Action:** Audit and archive outdated docs

### TD-020: Shell Scripts in Root
- **Location:** `scripts/`
- **Issue:** 21 shell scripts at project root
- **Impact:** Minor clutter
- **Effort:** 30 minutes
- **Action:** Move to `scripts/ops/` or similar

### TD-021: `pnpm-workspace.yaml`
- **Location:** Root
- **Issue:** Workspace config exists but project appears to be single-package
- **Impact:** Minor confusion
- **Effort:** 5 minutes
- **Action:** Remove if not using workspaces

### TD-022: CSS Files in `src/styles/`
- **Location:** `src/styles/`
- **Issue:** Separate CSS files alongside Tailwind
- **Impact:** Mixed styling approach
- **Effort:** 30 minutes
- **Action:** Migrate to Tailwind if possible

---

## Debt Summary

| Priority | Count | Total Effort |
|----------|-------|--------------|
| P0 | 3 | ~4 days |
| P1 | 5 | ~5 days |
| P2 | 10 | ~5 days |
| P3 | 4 | ~2 days |
| **Total** | **22** | **~16 days** |

---

## Recommended Execution Order

1. **TD-001** (1 hour) — Move `generateId()` — Immediate unblocker
2. **TD-015** (5 min) — Remove unused rate-limiter
3. **TD-016** (5 min) — Fix ghost dependency
4. **TD-008** (30 min) — Consolidate providers
5. **TD-010** (30 min) — Consolidate auth hooks
6. **TD-012** (30 min) — Create UI barrel
7. **TD-013** (30 min) — Consolidate analytics dashboards
8. **TD-017** (30 min) — Audit email packages
9. **TD-018** (30 min) — Standardize Redis client
10. **TD-005** (1 day) — Consolidate cache systems
11. **TD-004** (1-2 days) — Consolidate rate limiting
12. **TD-006** (2-3 days) — Consolidate core modules
13. **TD-002** (2-3 days) — Consolidate email implementations
14. **TD-003** (variable) — Fix type errors
15. **TD-007** (ongoing) — Add tests

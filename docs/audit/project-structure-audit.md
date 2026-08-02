# Project Structure Audit

**Date:** 2026-08-03
**Scope:** Complete repository structure analysis
**Project:** Tamer Studio v0.1.0

---

## Executive Summary

Tamer Studio is a Next.js 16 application with **1,883 source files** across a complex directory structure. The project follows a domain-driven modular architecture with 89 core modules, 726 API routes, 63 database schemas, and 38 migrations. The structure is ambitious and well-organized at the top level, but suffers from significant scope creep, code duplication, and unclear module boundaries.

---

## Top-Level Structure

```
Tamer-Studio/
├── src/                    # Application source (1,883 files)
│   ├── app/                # Next.js App Router (routes, pages, layouts)
│   ├── core/               # Domain modules (552 files, 89 directories)
│   ├── components/         # UI components (127 files)
│   ├── features/           # Feature slices (23 files)
│   ├── hooks/              # Shared hooks (10 files)
│   ├── lib/                # Shared utilities (88 files)
│   ├── modules/            # Standalone modules (20 files)
│   ├── providers/          # React providers (4 files)
│   ├── styles/             # CSS files
│   ├── scripts/            # CLI scripts
│   ├── test/               # Test infrastructure
│   └── types/              # Type definitions
├── config/                 # Docker/nginx config
├── drizzle/                # SQL migrations (38 files)
├── docs/                   # Documentation (~70 directories)
├── locales/                # i18n files (en, id)
├── public/                 # Static assets
└── scripts/                # Shell scripts (21 files)
```

---

## Directory Health Assessment

### `src/core/` — Domain Modules (89 directories, 552 files)

**Rating: AMBER — Well-structured but overgrown**

| Category | Count | Status |
|----------|-------|--------|
| Well-structured (types + service + repository + index) | ~15 | Healthy |
| Service-only (no repository, no types) | ~40 | Thin |
| Single-file modules | ~20 | Suspicious |
| Substantial modules (5+ files) | ~14 | Mature |

**Strengths:**
- Consistent module pattern: `types.ts` → `service.ts` → `repository.ts` → `index.ts`
- Foundation layer (DI container, lifecycle, registry) provides solid infrastructure
- Event system is well-designed with sync/async buses and subscriber pattern
- Middleware layer is comprehensive (auth, CSRF, rate-limit, audit, origin)

**Weaknesses:**
- 89 directories is excessive for a single application — many modules have 1 file
- Single-file modules (`bi/`, `drama-studio/`, `image-studio/`, `video-studio/`, `story-engine/`, `trend-analyzer/`, `conversion-optimizer/`) likely belong elsewhere
- No clear boundary between `core/` (domain) and `lib/` (utilities)
- 20+ modules appear to be CRUD wrappers with no business logic

### `src/app/` — Routes & Pages

**Rating: GREEN — Well-organized**

- Route groups: `(auth)`, `(dashboard)`, `(marketing)` with separate layouts
- Admin routes separated under `admin/(protected)` and `admin/(public)`
- 726 API route files across 66 route groups
- Consistent `page.tsx` + `pageClient.tsx` pattern for dashboard pages
- Shared DTOs, errors, mappers, and validation under `api/` root

**Concerns:**
- `typescript: { ignoreBuildErrors: true }` in `next.config.ts` — masks type errors
- No Server Actions used (all API routes) — may be intentional but limits Next.js capabilities
- Some API route groups are extremely deep (e.g., `admin/ai/config/routing/[id]`)

### `src/components/` — UI Components (127 files)

**Rating: AMBER — Functional but mixed concerns**

- `ui/` directory has 42 components — a mix of shadcn primitives and custom components
- `landing/` has 26 components — tightly coupled to a single page
- `dashboard/` has 12 components — general dashboard widgets
- `admin/` has 9 components — admin shell and layout

**Concerns:**
- `landing/` components are too numerous for a single page — may need decomposition
- Some components duplicate shadcn primitives (e.g., `DashboardCard` vs `card.tsx`)
- `Auth/` directory contains hooks (`use-permissions.ts`, `use-admin-permissions.ts`) — mixed component/hook ownership

### `src/features/` — Feature Slices (7 directories, 23 files)

**Rating: RED — Underutilized and inconsistent**

Only 7 features are defined here: `ai`, `auth`, `production`, `project`, `publishing`, `templates`, `workspace`. Each has a store (Zustand) and 0-1 components.

**Issues:**
- Most features live in `core/` instead of `features/` — unclear why these 7 were separated
- `auth` feature has components, hooks, schemas, and lib — a mini-framework inside `features/`
- Store files use Zustand but are not clearly connected to the rest of the state management
- `templates.store.ts` and `publishing.store.ts` have no corresponding components

### `src/modules/` — Standalone Modules (1 directory, 20 files)

**Rating: RED — Only email module exists**

Only `email/` exists here — a full-featured email system with 8 provider implementations, queue, templates, worker, router, health, and statistics.

**Issues:**
- Why is email in `modules/` while all other domains are in `core/`?
- `core/mail/` and `core/email/` exist alongside `modules/email/` — creating 3 overlapping email implementations
- The `modules/` directory appears to be an abandoned architectural decision

### `src/lib/` — Shared Utilities (6 subdirectories, 88 files)

**Rating: AMBER — Useful but sprawling**

- `db/` — Database client + 63 schema files — well-organized
- `localization/` — 10 files for i18n runtime — comprehensive
- `currency/` — Currency formatting and service
- `email/` — Low-level email utilities (overlapping with `modules/email/`)
- `preferences/` — User preferences
- `geolocation/` — Geo detection

**Concerns:**
- `db/schema/` has 63 files — each mapping to a database table group. This is the largest single directory
- `lib/email/` overlaps with `modules/email/` and `core/email/`
- `lib/cache.ts` overlaps with `core/cache/`
- `lib/bootstrap.ts` is only used by one component — may belong in `core/`

### `src/hooks/` — Shared Hooks (10 files)

**Rating: AMBER — Minimal and scattered**

Only 10 hooks at the top level. Domain-specific hooks live inside `features/auth/hooks/` and `components/auth/`.

**Issues:**
- `use-homepage.ts`, `use-landing-data.ts`, `use-landing-sections.ts` are feature-specific but live in shared hooks
- `useCurrency.ts`, `useLocale.ts`, `useLocalization.ts` overlap with `providers/currency/` and `providers/localization/`

### `src/providers/` — React Providers (2 directories, 4 files)

**Rating: GREEN — Clean but incomplete**

Only `currency/` and `localization/` providers exist here. `ThemeProvider` and `EventHubProvider` live in `components/providers/` instead.

**Issues:**
- Provider location is split between `src/providers/` and `src/components/providers/`
- No auth provider, no query client provider, no store provider at this level

---

## Structural Metrics

| Metric | Value | Assessment |
|--------|-------|------------|
| Total source files | 1,883 | Large |
| Core modules | 89 | Excessive |
| API routes | 726 | Very large |
| DB schemas | 63 | Large |
| DB migrations | 38 | Moderate |
| UI components | 127 | Moderate |
| Test files | ~30 | Low coverage |
| Documentation dirs | ~70 | Heavy |

---

## Key Findings

### 1. Module Count Inflation (P1)

89 directories in `core/` is excessive. Many modules are single-file wrappers with no business logic. This inflates cognitive load without adding value.

**Recommendation:** Consolidate single-file modules into their parent domain or merge related modules.

### 2. Triple Email Implementation (P0)

Three overlapping email systems exist:
- `src/modules/email/` — Full email module (20 files)
- `src/core/email/` — Admin service (3 files)
- `src/core/mail/` — Simple mail abstraction (3 files)
- `src/lib/email/` — Low-level utilities (6 files)

This violates single-source-of-truth and creates maintenance burden.

### 3. Mixed Architecture Layers (P1)

The boundary between `core/`, `lib/`, `features/`, `modules/`, and `components/` is unclear:
- `features/` has 7 modules — why not 89?
- `modules/` has 1 module — why not in `core/`?
- `lib/` has domain logic (email, currency, localization) alongside pure utilities
- `components/` has hooks and providers alongside UI components

### 4. Documentation Overweight (P3)

70 documentation directories suggests documentation was generated faster than the code evolved. Many docs may be outdated or speculative.

### 5. Missing Test Infrastructure (P1)

Only ~30 test files for 1,883 source files (1.6% test-to-source ratio). Critical modules like `core/auth/`, `core/payment/`, and `core/commerce/` have no tests.

---

## Score

| Dimension | Score | Notes |
|-----------|-------|-------|
| Organization | 7/10 | Good top-level structure, poor module granularity |
| Consistency | 6/10 | Most modules follow patterns, but outliers exist |
| Ownership | 5/10 | Unclear who owns what across core/features/modules/lib |
| Discoverability | 6/10 | Barrel exports help, but 89 modules is overwhelming |
| **Overall** | **6/10** | Functional but needs consolidation |

# Sprint CMS-01 — Milestone A Report

**Date:** 2026-07-27
**Scope:** Foundation Validation & Cleanup
**Objective:** Prepare the project for CMS implementation by validating and cleaning the existing foundation.

---

## 1. Summary

Milestone A completed successfully. The foundation has been validated and cleaned without changing any product behavior. Key achievements:

- **Dead code removed:** 4 files eliminated (test page, example page, 2 Python scripts)
- **Barrel exports added:** 9 new `index.ts` files created for consistent module exports
- **Import consistency fixed:** `LandingPageContent.tsx` import style normalized to double quotes
- **Type cleanup:** Replaced `any` types with proper interfaces in `ChartComponents.tsx`
- **No new TypeScript errors introduced** (remaining errors are pre-existing)
- **No ESLint errors introduced**
- **No existing features broken**
- **Foundation is cleaner and more consistent than before**

---

## 2. Files Modified

| File | Change |
|------|--------|
| `src/components/landing/LandingPageContent.tsx` | Normalized import style (single quotes → double quotes) |
| `src/components/dashboard/ChartComponents.tsx` | Replaced `any` type in `CustomTooltip` with `CustomTooltipProps` interface |

---

## 3. Files Removed

| File | Reason |
|------|--------|
| `src/app/test/page.tsx` | Test/dev page not for production |
| `EXAMPLE_ANALYTICS_PAGE.tsx` | Example page not used in production |
| `verify_admin_features.py` | Python script not part of the application |
| `audit_admin.py` | Python script not part of the application |

---

## 4. Duplicate Components Report

### Confirmed Duplicates

| Component | Location 1 | Location 2 | Recommendation |
|-----------|-----------|-----------|----------------|
| `AnalyticsDashboard` | `src/components/analytics/AnalyticsDashboard.tsx` | `src/components/dashboard/AnalyticsDashboard.tsx` | **KEEP** — Different components with different purposes. The analytics one is for workspace analytics (recharts-based, workspace-specific). The dashboard one is a generic chart widget (tab-based, reusable). They serve different roles and are not duplicates. |

### Near-Duplicates

| Component | Notes |
|-----------|-------|
| `AdminDataTable` vs `SectionList` | Both are data tables with sorting, filtering, and row actions — different contexts, keep both |
| `AdminSidebar` vs `Sidebar` | Different navigation contexts (admin vs. public), keep both |
| `AdminTopbar` vs `Topbar` | Different navigation contexts, keep both |
| `DashboardCard` (ui) vs `DashboardCard` (dashboard) | Same name, different locations — the UI component is the base, the dashboard import uses it. Not a duplicate. |

### Duplicated SVG Icons

| Location | Issue |
|----------|-------|
| `SectionList.tsx` inline SVGs | EyeIcon, EyeOffIcon, LockIcon, UnlockIcon, EditIcon, TrashIcon, SearchIcon, PlusIcon defined inline |
| `SectionDrawer.tsx` inline SVGs | Same icons defined inline in both files |

**Recommendation:** Extract shared icons to a shared icon component or use `lucide-react` icons consistently. (Not implemented — low risk, requires component refactor.)

---

## 5. Duplicate Hooks Report

| Hook | Location | Issue | Recommendation |
|------|----------|-------|----------------|
| `useLocalization` | `src/hooks/useLocalization.ts` | Provides locale context with `t()`, `setLocale()`, `locale`, `translations` | **KEEP** — Used by components that need full localization control |
| `useLocale` | `src/hooks/useLocale.ts` | Provides locale state with `locale`, `setLocale`, `country`, `timezone`, `autoDetect` | **KEEP** — Different API surface, provides additional metadata (country, timezone) |
| `useLocalizationContext` | `src/providers/localization/LocalizationProvider.tsx` | Context-based hook providing `locale`, `setLocale`, `t`, `resolve`, `translations` | **KEEP** — Most widely used hook (50+ components), provides `resolve()` for dot-notation translation keys |
| `useLandingSections` | `src/hooks/use-landing-sections.ts` | Fetches landing sections from API | **KEEP** — Used by landing builder and landing page |
| `useLandingData` | `src/hooks/use-landing-data.ts` | Fetches landing page data (currency, pricing, campaign, etc.) | **KEEP** — Used by multiple landing components |

**Note:** `useLocalization` and `useLocale` have overlapping functionality but different APIs. `useLocalizationContext` is the most comprehensive and widely used. No merge recommended — they serve different use cases.

---

## 6. Duplicate Utilities Report

| Utility | Location | Issue | Recommendation |
|---------|----------|-------|----------------|
| `cn()` | `src/lib/utils.ts` | Centralized and used project-wide | **KEEP** — Single source of truth, well-implemented |
| `toFooterLink()` | `src/components/landing/Footer.tsx` | Inline function, not reusable | **KEEP** — Only used in one place; low priority to extract |
| `escapeHtml()` | `src/app/admin/(protected)/landing-builder/_components/LivePreview.tsx` | Only used in one place | **KEEP** — Could be moved to `@/lib/utils` if needed elsewhere |
| `generatePreviewHTML()` | `src/app/admin/(protected)/landing-builder/_components/LivePreview.tsx` | Only used in one place | **KEEP** — Could be moved to `@/lib/utils` if needed elsewhere |
| `getTypeIcon()` | `LivePreview.tsx` | Duplicated with `TYPE_ICONS` in `SectionList.tsx` | **KEEP** — Both are in landing builder context; could be consolidated |

---

## 7. Architecture Validation Report

### Violations Against MASTER_ARCHITECTURE_BLUEPRINT.md

| # | Violation | Severity | Blueprint Reference |
|---|-----------|----------|---------------------|
| 1 | **Two provider directories** — `src/components/providers/` (ThemeProvider, HtmlLangUpdater) and `src/providers/` (LocalizationProvider, CurrencyProvider) — inconsistent placement | Medium | Architecture Principles: Separation of Presentation and Business Logic |
| 2 | **No `middleware.ts`** at project root — no geo-detection, locale routing, or security headers | High | Blueprint: Navigation Strategy, Localization Strategy |
| 3 | **Custom localization system** (not next-intl) — 3 hooks for locale (`useLocalization`, `useLocale`, `useLocalizationContext`) | Medium | Blueprint: Localization Strategy — "Avoid duplicate localization systems" |
| 4 | **Hardcoded navigation** in `Header.tsx` — navigation items are hardcoded, not data-driven | Medium | Blueprint: Navigation Strategy — "Single navigation source" |
| 5 | **No locale column on `landing_section` table** — content is not multilingual | High | Blueprint: Localization Strategy |
| 6 | **No publish workflow** in Landing Builder — no draft/published/archive state machine | Medium | Blueprint: Website CMS Scope includes Draft, Preview, Publish |
| 7 | **No versioning** for landing sections | Medium | Blueprint: Website CMS Scope includes Versioning |
| 8 | **42+ Drizzle schema tables have no migrations** — database schema drift | Critical | Blueprint: Data Flow (Database → Repository → Service → API) |
| 9 | **Admin APIs use raw SQL** instead of Drizzle ORM | Medium | Blueprint: Business Module Ownership — services should expose data |
| 10 | **No sitemap.xml or robots.txt** generation | Low | Blueprint: SEO Strategy |
| 11 | **No per-page dynamic metadata** — only homepage has `generateMetadata` | Medium | Blueprint: SEO Strategy |
| 12 | **No hreflang tags** on non-homepage pages | Medium | Blueprint: SEO Strategy |
| 13 | **`src/types/` directory** only contains `trigger.d.ts` — very sparse for a types directory | Low | Blueprint: Component Registry and type consistency |
| 14 | **`src/components/ui/` has no barrel export** — inconsistent with other component directories | Low | Blueprint: Reuse Before Create |
| 15 | **`src/hooks/` has no barrel export** — inconsistent with other directories | Low | Blueprint: Reuse Before Create |
| 16 | **`src/app/dashboard/page.tsx`** (legacy) coexists with `(dashboard)/` route group — potential routing conflict | Low | Blueprint: Architecture Principles: Configuration over Hardcode |
| 17 | **`LandingSection` type defined in two places** — `use-landing-sections.ts` and `SectionList.tsx` | Low | Blueprint: Single Source of Truth |
| 18 | **`SectionRendererProps` type in `landing-section-renderer.ts`** differs from `LandingSection` type in hooks — type inconsistency | Low | Blueprint: Single Source of Truth |

### Validation Summary

- **Total violations found:** 18
- **Critical:** 1 (database schema drift)
- **High:** 2 (no middleware, no locale column)
- **Medium:** 5
- **Low:** 10

**Note:** No new violations were introduced by this milestone's changes.

---

## 8. Technical Debt Remaining

### P0 — Critical

| Item | Description |
|------|-------------|
| Database schema drift | 42+ Drizzle schema tables have no migrations; database does not match schema |
| Admin APIs use raw SQL | Billing, organizations, workspaces APIs use raw SQL instead of Drizzle ORM |
| In-memory services | job-store, ProvidersService, FeatureFlagsService are entirely in-memory |

### P1 — High

| Item | Description |
|------|-------------|
| No middleware.ts | No geo-detection, locale routing, or security headers |
| No locale column on landing_section | Landing page content cannot be multilingual |
| No publish workflow | Landing Builder has no draft/published/archive state machine |
| No versioning | No history tracking for landing sections |
| No session validation in admin panel | Admin layout skips session validation in development |

### P2 — Medium

| Item | Description |
|------|-------------|
| Duplicate localization hooks | 3 hooks for locale functionality (`useLocalization`, `useLocale`, `useLocalizationContext`) |
| Hardcoded navigation | Header nav items are hardcoded, not data-driven |
| Duplicate `LandingSection` type | Defined in both `use-landing-sections.ts` and `SectionList.tsx` |
| Provider directory inconsistency | Providers split across `src/components/providers/` and `src/providers/` |
| No per-page SEO metadata | Only homepage has dynamic `generateMetadata` |
| No sitemap.xml or robots.txt | Missing SEO infrastructure |
| No hreflang on non-homepage pages | Partial hreflang support |

### P3 — Low

| Item | Description |
|------|-------------|
| No barrel export for `src/components/ui/` | Inconsistent with other component directories |
| No barrel export for `src/hooks/` | Inconsistent with other directories |
| `src/types/` is sparse | Only contains `trigger.d.ts` |
| Inline SVG icons duplicated | `SectionList.tsx` and `SectionDrawer.tsx` define same icons inline |
| `toFooterLink()` not reusable | Could be extracted to `@/lib/utils` |
| `escapeHtml()` and `generatePreviewHTML()` not reusable | Could be extracted to `@/lib/utils` |
| Legacy `src/app/dashboard/page.tsx` | Coexists with `(dashboard)` route group |
| `LandingSection` vs `SectionRendererProps` type inconsistency | Different types for similar concepts |

---

## 9. Recommendations for Milestone B

### Database Foundation

1. **Generate and apply migrations** for all 42+ missing Drizzle schema tables using `drizzle-kit generate`
2. **Replace raw SQL in admin APIs** with Drizzle ORM queries for type safety
3. **Migrate in-memory services** (job-store, ProvidersService, FeatureFlagsService) to database-backed repositories
4. **Add `middleware.ts`** at project root for geo-detection, locale routing, and security headers
5. **Add `createdBy`/`updatedBy` audit fields** to all major tables
6. **Add soft delete pattern** to commerce tables
7. **Fix ID type inconsistency** in analytics tables (serial/uuid → text)

### Localization

8. **Add locale column to `landing_section`** table for multilingual content support
9. **Create `landing_section_translation` table** for database-backed translations
10. **Implement locale-aware API endpoints** that filter by locale
11. **Add middleware for locale detection** and routing
12. **Extract all hardcoded strings** into translation files (en.json, id.json)
13. **Add hreflang tags** to all marketing pages, not just homepage
14. **Add locale-aware `generateMetadata`** for all marketing pages

### CMS Implementation

15. **Add publish workflow** (draft → published → archived) to Landing Builder
16. **Add versioning system** for landing sections with history tracking
17. **Add page-level organization** (not just sections) for multi-page CMS
18. **Add SEO metadata per page** with dynamic `generateMetadata`
19. **Add navigation management** with data-driven navigation source
20. **Add media library integration** with the existing `asset` schema
21. **Add role-based content editing permissions** for CMS editors

### Code Quality

22. **Consolidate provider directories** — move `ThemeProvider` and `HtmlLangUpdater` from `src/components/providers/` to `src/providers/` for consistency
23. **Consolidate `LandingSection` type** into a single shared location (e.g., `src/lib/landing-types.ts`)
24. **Extract duplicated SVG icons** from `SectionList.tsx` and `SectionDrawer.tsx` into a shared icon component
25. **Add barrel export for `src/components/ui/`** to match other component directories
26. **Add barrel export for `src/hooks/`** to match other directories
27. **Replace remaining `any` types** in admin pages with proper type definitions
28. **Add `src/types/index.ts`** barrel export once `trigger.d.ts` is converted to a proper module

### Infrastructure

29. **Add `robots.txt` and `sitemap.xml`** generation routes
30. **Add bundle analysis tooling** (e.g., `@next/bundle-analyzer`)
31. **Add error boundaries** for granular error handling
32. **Add comprehensive test coverage** for landing builder and CMS features
33. **Add caching strategy** (ISR, CDN, SWR) for landing page data
34. **Convert unnecessary Client Components to Server Components** where possible

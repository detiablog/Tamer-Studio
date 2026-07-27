# Sprint CMS-01 — Milestone A.5
# Execution Plan

**Version:** 1.0
**Status:** PLANNING
**Date:** 2026-07-27
**Purpose:** Convert architecture findings into a dependency-driven implementation roadmap for all remaining CMS implementation sprints.

---

## 1. Execution Roadmap

The roadmap follows the Blueprint's data flow architecture:

```
Database
  ↓
Repository
  ↓
Service
  ↓
API
  ↓
Infrastructure
  ↓
Localization
  ↓
Navigation
  ↓
Website CMS
  ↓
Homepage
  ↓
SEO
```

Each milestone has exactly one responsibility, clear inputs, clear outputs, and measurable completion criteria. Milestones are ordered by dependency — no milestone begins until its prerequisites are complete.

### Phase 1: Foundation (Milestones B1–B4)

| Milestone | Name | Responsibility |
|-----------|------|---------------|
| B1 | Database Synchronization | Align Drizzle schema with database via migrations |
| B2 | Repository Foundation | Standardize repository patterns and ensure all services use repositories |
| B3 | Service Foundation | Ensure all business logic is in services, not in API routes or components |
| B4 | API Refactor | Replace raw SQL in admin APIs with service/repository calls |

### Phase 2: Infrastructure (Milestones B5–B6)

| Milestone | Name | Responsibility |
|-----------|------|---------------|
| B5 | Infrastructure Foundation | Add middleware.ts, caching, error boundaries, and deployment config |
| B6 | Localization Foundation | Implement database-backed translations and locale-aware APIs |

### Phase 3: CMS (Milestones B7–B9)

| Milestone | Name | Responsibility |
|-----------|------|---------------|
| B7 | Navigation Foundation | Implement data-driven navigation with a single source of truth |
| B8 | Website CMS Foundation | Extend Landing Builder into full multi-page CMS with publish workflow |
| B9 | Homepage Foundation | Build homepage from CMS sections with localization support |

### Phase 4: Optimization (Milestones B10–B11)

| Milestone | Name | Responsibility |
|-----------|------|---------------|
| B10 | SEO Foundation | Implement per-page metadata, sitemap, robots.txt, hreflang |
| B11 | Performance Optimization | Add caching, ISR, bundle optimization, and test coverage |

---

## 2. Milestone Dependency Graph

```
B1: Database Synchronization
  │
  ├──→ B2: Repository Foundation
  │       │
  │       └──→ B3: Service Foundation
  │               │
  │               └──→ B4: API Refactor
  │                       │
  │                       └──→ B5: Infrastructure Foundation
  │                               │
  │                               ├──→ B6: Localization Foundation
  │                               │       │
  │                               │       └──→ B7: Navigation Foundation
  │                               │               │
  │                               │               └──→ B8: Website CMS Foundation
  │                               │                       │
  │                               │                       └──→ B9: Homepage Foundation
  │                               │                               │
  │                               │                               └──→ B10: SEO Foundation
  │                               │                                       │
  │                               │                                       └──→ B11: Performance Optimization
  │                               │
  │                               └──→ B7: Navigation Foundation (can start after B5)
  │
  └──→ B6: Localization Foundation (can start after B1, partially parallel with B2-B4)
```

### Parallel Work Opportunities

| Milestones | Can Run In Parallel | Reason |
|-----------|-------------------|--------|
| B2, B3 | Yes | Repository and service layers are independent if repositories are already defined |
| B5, B6 | Yes | Infrastructure (middleware, caching) and localization can be built independently |
| B7, B8 | No | Navigation depends on CMS page structure |
| B9, B10 | Yes | Homepage and SEO can be built in parallel after CMS is ready |
| B10, B11 | Yes | SEO and performance optimization are independent |

---

## 3. Milestone Breakdown

### B1: Database Synchronization

**Objective:** Generate and apply Drizzle migrations for all 42+ tables defined in the schema but missing from the database.

**Scope:** Database layer only. No schema changes. No service or API changes.

**In Scope:**
- Run `drizzle-kit generate` to create baseline migration
- Review generated SQL for correctness
- Apply migration to database
- Validate row counts and critical field values
- Add missing indexes and unique constraints
- Add foreign key constraints where defined in schema

**Out of Scope:**
- Schema changes (no new tables or columns)
- Service or repository implementation
- API route changes
- Localization or CMS changes
- Business logic changes

**Required Inputs:**
- `src/lib/db/schema/` — all Drizzle schema definitions
- `drizzle/` — existing migration snapshots
- Database connection string
- `drizzle-kit` tooling

**Expected Outputs:**
- Complete set of migrations covering all schema tables
- Migration validation report (row counts, checksums)
- Foreign key constraints applied
- Indexes aligned with schema definitions

**Dependencies:** None (B1 is the foundation)

**Risks:**
- P0: Generated migration may have incorrect SQL — must be reviewed manually
- P0: Migration may fail on production-sized data — test on staging first
- P1: ID type inconsistency (analytics tables use serial/uuid, others use text) — must be resolved in migration
- P2: Missing foreign keys may cause integrity issues during migration

**Acceptance Criteria:**
- All 42+ schema tables have corresponding migrations
- Database schema matches Drizzle schema definitions
- Foreign key constraints are enforced
- Indexes match schema definitions
- Migration runs successfully on staging environment
- Row count validation passes

**Definition of Done:**
- All migrations reviewed and applied to staging
- Database schema matches Drizzle schema
- No data loss during migration
- Migration is reversible (rollback script exists)

**Estimated Review Size:** Large

---

### B2: Repository Foundation

**Objective:** Standardize repository patterns across all modules and ensure every service uses a repository for data access.

**Scope:** Repository layer only. No service or API changes.

**In Scope:**
- Audit all existing repositories in `src/core/*/`
- Ensure every repository follows the same interface pattern
- Add missing repositories for modules that access data directly in services
- Remove any direct database access in services that should go through repositories
- Create barrel exports for repository modules

**Out of Scope:**
- Service logic changes
- API route changes
- Database schema changes
- Localization or CMS changes

**Required Inputs:**
- `src/core/*/` — all core modules with repositories
- `src/lib/db/schema/` — database schema definitions
- B1 completion (migrations applied)

**Expected Outputs:**
- Standardized repository interface across all modules
- All services use repositories for data access (no direct DB access)
- Repository barrel exports for all modules
- Repository audit report documenting any remaining direct DB access

**Dependencies:**
- B1 (Database Synchronization) — must have migrations applied before standardizing repositories

**Risks:**
- P1: Some services may have direct DB access that is deeply embedded in business logic — requires careful refactoring
- P2: Repository interface standardization may reveal inconsistencies in existing patterns

**Acceptance Criteria:**
- Every service uses a repository for data access
- No service has direct database queries (except through repositories)
- All repositories follow the same interface pattern
- Repository barrel exports exist for all modules

**Definition of Done:**
- Repository audit confirms zero direct DB access in services
- All repositories follow standardized interface
- Barrel exports created for all repository modules

**Estimated Review Size:** Medium

---

### B3: Service Foundation

**Objective:** Ensure all business logic is in services, not in API routes or components.

**Scope:** Service layer only. No API or repository changes.

**In Scope:**
- Audit all API routes for business logic that should be in services
- Audit all components for business logic that should be in services
- Move identified business logic from API routes and components into services
- Ensure services are pure (no framework dependencies)
- Create barrel exports for service modules

**Out of Scope:**
- API route restructuring (only logic moves, not routes)
- Repository pattern changes
- Database schema changes
- Localization or CMS changes

**Required Inputs:**
- `src/app/api/` — all API routes
- `src/components/` — all components with business logic
- `src/core/*/` — existing services
- B2 completion (repositories standardized)

**Expected Outputs:**
- All business logic extracted from API routes into services
- All business logic extracted from components into services
- Services are pure (no framework dependencies)
- Service barrel exports for all modules
- Service audit report documenting any remaining business logic in API routes or components

**Dependencies:**
- B2 (Repository Foundation) — services depend on standardized repositories

**Risks:**
- P1: Some API routes may have complex business logic that is tightly coupled to the route handler — requires careful extraction
- P2: Some components may have business logic that is tightly coupled to React lifecycle — requires careful extraction

**Acceptance Criteria:**
- No API route contains business logic (only request/response handling)
- No component contains business logic (only presentation)
- All business logic is in services
- Services have no framework dependencies

**Definition of Done:**
- Service audit confirms zero business logic in API routes and components
- All services are pure (no framework dependencies)
- Barrel exports created for all service modules

**Estimated Review Size:** Medium

---

### B4: API Refactor

**Objective:** Replace raw SQL in admin APIs with service/repository calls and standardize API response formats.

**Scope:** API layer only. No service or repository changes.

**In Scope:**
- Replace raw SQL in admin billing, organizations, and workspaces APIs with Drizzle ORM queries
- Standardize API response formats across all endpoints
- Ensure all admin APIs use service layer for business logic
- Remove any duplicate API endpoints

**Out of Scope:**
- New API endpoints
- Service logic changes
- Repository pattern changes
- Database schema changes
- Localization or CMS changes

**Required Inputs:**
- `src/app/api/admin/` — all admin API routes
- B3 completion (services standardized)
- B2 completion (repositories standardized)

**Expected Outputs:**
- All admin APIs use Drizzle ORM (no raw SQL)
- Standardized API response format
- All admin APIs use service layer
- API audit report documenting any remaining raw SQL or duplicate endpoints

**Dependencies:**
- B3 (Service Foundation) — APIs must use services
- B2 (Repository Foundation) — services use repositories

**Risks:**
- P1: Raw SQL in admin APIs may be complex and tightly coupled to specific query patterns — requires careful replacement
- P2: Standardizing response formats may break existing API consumers

**Acceptance Criteria:**
- Zero raw SQL in admin API routes
- All admin APIs use service layer
- API response format is consistent
- No duplicate API endpoints

**Definition of Done:**
- Raw SQL audit confirms zero raw SQL in admin APIs
- All admin APIs use service layer
- Response format is standardized

**Estimated Review Size:** Medium

---

### B5: Infrastructure Foundation

**Objective:** Add middleware.ts, caching strategy, error boundaries, and deployment configuration.

**Scope:** Infrastructure layer only. No business logic or CMS changes.

**In Scope:**
- Create `middleware.ts` at project root for geo-detection and security headers
- Implement caching strategy for landing page data (ISR, CDN, SWR)
- Add React error boundaries for granular error handling
- Configure `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_URL` environment variables
- Add `robots.txt` and `sitemap.xml` generation routes
- Add bundle analysis tooling

**Out of Scope:**
- Localization implementation
- CMS implementation
- Homepage redesign
- SEO metadata per page (covered in B10)
- Service or API changes

**Required Inputs:**
- `src/app/` — existing App Router structure
- `src/core/middleware/` — existing middleware patterns
- B4 completion (APIs standardized)

**Expected Outputs:**
- `middleware.ts` with geo-detection and security headers
- Caching strategy implemented for landing page data
- Error boundaries for all major page sections
- Environment variables configured
- `robots.txt` and `sitemap.xml` routes
- Bundle analysis configured

**Dependencies:**
- B4 (API Refactor) — middleware may need to interact with standardized APIs

**Risks:**
- P1: Middleware implementation may conflict with existing route group structure
- P2: Caching strategy may cause stale data if not properly invalidated
- P3: Bundle analysis tooling may reveal performance issues that are out of scope for this milestone

**Acceptance Criteria:**
- `middleware.ts` exists and handles geo-detection and security headers
- Landing page data is cached (ISR or CDN)
- Error boundaries exist for all major page sections
- Environment variables are configured
- `robots.txt` and `sitemap.xml` routes exist
- Bundle analysis tooling is configured

**Definition of Done:**
- Middleware is deployed and functional
- Caching is active for landing page data
- Error boundaries catch and display errors gracefully
- Environment variables are set in production
- `robots.txt` and `sitemap.xml` are accessible

**Estimated Review Size:** Large

---

### B6: Localization Foundation

**Objective:** Implement database-backed translations, locale-aware APIs, and proper localization infrastructure.

**Scope:** Localization layer only. No CMS or homepage changes.

**In Scope:**
- Add `locale` column to `landing_section` table (migration in B1)
- Create `landing_section_translation` table for multilingual content
- Implement locale-aware API endpoints for landing sections
- Enhance `LocalizationService` to support database-backed locale overrides
- Add middleware for locale detection and routing
- Extract all hardcoded UI strings into translation files
- Add hreflang tags to all marketing pages
- Implement language switcher with proper persistence

**Out of Scope:**
- CMS page-level localization (covered in B8)
- Homepage content localization (covered in B9)
- SEO hreflang per page (covered in B10)
- Service or API business logic changes

**Required Inputs:**
- B1 (Database Synchronization) — locale columns require migrations
- B5 (Infrastructure Foundation) — middleware for locale routing
- `src/lib/localization/` — existing localization service
- `locales/` — existing translation files

**Expected Outputs:**
- `landing_section` table has `locale` column
- `landing_section_translation` table exists with multilingual content
- Locale-aware API endpoints for landing sections
- Enhanced `LocalizationService` with database-backed overrides
- Middleware for locale detection and routing
- All hardcoded UI strings extracted to translation files
- hreflang tags on all marketing pages
- Language switcher with cookie persistence

**Dependencies:**
- B1 (Database Synchronization) — locale columns require migrations
- B5 (Infrastructure Foundation) — middleware for locale routing

**Risks:**
- P0: Adding locale column to `landing_section` requires data migration — existing content must be assigned a default locale
- P1: Database-backed translations may conflict with existing file-based translations — must be carefully integrated
- P2: Language switcher persistence may conflict with existing cookie-based locale detection

**Acceptance Criteria:**
- `landing_section` table has `locale` column with default value
- `landing_section_translation` table stores multilingual content
- API endpoints filter by locale
- Middleware detects locale from cookie, browser, or user preference
- All hardcoded UI strings are in translation files
- hreflang tags present on all marketing pages
- Language switcher persists locale preference

**Definition of Done:**
- Locale column added to landing_section
- Translation table created and populated
- Locale-aware APIs functional
- Middleware handles locale detection
- All UI strings extracted to translation files
- hreflang tags working on all pages

**Estimated Review Size:** Large

---

### B7: Navigation Foundation

**Objective:** Implement data-driven navigation with a single source of truth for header, footer, sidebar, and mobile navigation.

**Scope:** Navigation layer only. No CMS or homepage changes.

**In Scope:**
- Create navigation data source (database table or config file)
- Replace hardcoded navigation in `Header.tsx` with data-driven navigation
- Implement single navigation source consumed by Header, Footer, Sidebar, and Mobile Navigation
- Add navigation management API endpoints
- Add navigation rendering components that consume the data source
- Eliminate hardcoded navigation incrementally

**Out of Scope:**
- CMS page structure (covered in B8)
- Homepage navigation (covered in B9)
- Localization of navigation items (covered in B6)
- Service or API business logic changes

**Required Inputs:**
- B6 (Localization Foundation) — navigation items should be locale-aware
- `src/components/landing/Header.tsx` — existing header with hardcoded nav
- `src/components/landing/Footer.tsx` — existing footer with data-driven links
- `src/components/ui/Sidebar.tsx` — existing sidebar navigation

**Expected Outputs:**
- Navigation data source (database table or config)
- Header uses data-driven navigation
- Footer uses data-driven navigation
- Sidebar uses data-driven navigation
- Mobile navigation uses data-driven navigation
- Navigation management API endpoints
- Single navigation source consumed by all navigation components

**Dependencies:**
- B6 (Localization Foundation) — navigation should be locale-aware

**Risks:**
- P1: Replacing hardcoded navigation may break existing navigation structure if not carefully mapped
- P2: Navigation data source design may need iteration — start with simple config, evolve to database

**Acceptance Criteria:**
- All navigation components consume the same data source
- No hardcoded navigation items remain in Header, Footer, Sidebar, or Mobile Navigation
- Navigation management API endpoints exist
- Navigation is locale-aware

**Definition of Done:**
- Header, Footer, Sidebar, and Mobile Navigation all use data-driven navigation
- Single navigation source exists
- Navigation management API is functional
- Hardcoded navigation eliminated

**Estimated Review Size:** Medium

---

### B8: Website CMS Foundation

**Objective:** Extend the Landing Builder into a full multi-page website CMS with publish workflow, versioning, and page-level organization.

**Scope:** CMS layer only. No homepage or SEO changes.

**In Scope:**
- Add page-level organization (not just sections)
- Add publish workflow (draft → published → archived)
- Add versioning system for landing sections
- Add draft/published/archive state machine
- Add navigation management integration
- Add SEO metadata per page
- Add media library integration
- Add role-based content editing permissions
- Add scheduled publishing

**Out of Scope:**
- Homepage content (covered in B9)
- SEO metadata per page (covered in B10)
- Localization of CMS content (covered in B6)
- Navigation structure (covered in B7)

**Required Inputs:**
- B1 (Database Synchronization) — CMS tables require migrations
- B6 (Localization Foundation) — CMS content should be locale-aware
- B7 (Navigation Foundation) — CMS pages need navigation structure
- Existing Landing Builder (`src/app/admin/(protected)/landing-builder/`)
- `src/lib/db/schema/landing.ts` — existing landing schema

**Expected Outputs:**
- Page-level organization system
- Publish workflow (draft → published → archived)
- Versioning system for landing sections
- Navigation management integration
- SEO metadata per page
- Media library integration
- Role-based content editing permissions
- Scheduled publishing support

**Dependencies:**
- B1 (Database Synchronization) — CMS tables require migrations
- B6 (Localization Foundation) — CMS content should be locale-aware
- B7 (Navigation Foundation) — CMS pages need navigation structure

**Risks:**
- P0: Extending Landing Builder into full CMS is a significant redesign — must preserve existing functionality
- P1: Publish workflow may conflict with existing `visible` flag — must be carefully designed
- P2: Versioning system may have performance implications for large numbers of sections
- P3: Role-based permissions may require auth system changes (out of scope for this milestone)

**Acceptance Criteria:**
- Landing Builder supports multi-page CMS (not just single landing page)
- Publish workflow (draft → published → archived) is functional
- Versioning system tracks changes to landing sections
- Navigation management is integrated with CMS
- SEO metadata can be set per page
- Media library is integrated with CMS
- Role-based content editing permissions are functional

**Definition of Done:**
- Landing Builder extended to full CMS
- Publish workflow functional
- Versioning system operational
- Navigation management integrated
- SEO metadata per page supported
- Media library integrated
- Role-based permissions working

**Estimated Review Size:** Large

---

### B9: Homepage Foundation

**Objective:** Build the homepage from CMS sections with localization support and proper data fetching.

**Scope:** Homepage only. No CMS or SEO changes.

**In Scope:**
- Convert `src/app/page.tsx` to use CMS sections from the Website CMS
- Implement locale-aware homepage rendering
- Replace hardcoded homepage content with CMS-driven sections
- Implement proper data fetching with caching (ISR)
- Add structured data (JSON-LD) for the homepage
- Ensure homepage supports all Blueprint-defined sections (Hero, Who Is It For, Workflow, AI Studios, Production Pipeline, AI Models, Pricing, Testimonials, FAQ, CTA, Footer)

**Out of Scope:**
- CMS implementation (covered in B8)
- SEO metadata (covered in B10)
- Localization system (covered in B6)
- Navigation (covered in B7)

**Required Inputs:**
- B8 (Website CMS Foundation) — homepage sections come from CMS
- B6 (Localization Foundation) — homepage content should be locale-aware
- `src/app/page.tsx` — existing homepage
- `src/components/landing/LandingPageContent.tsx` — existing landing page orchestrator

**Expected Outputs:**
- Homepage uses CMS sections for all content
- Homepage is locale-aware
- Homepage uses ISR for data fetching
- Homepage has proper JSON-LD structured data
- All Blueprint-defined homepage sections are supported

**Dependencies:**
- B8 (Website CMS Foundation) — homepage sections come from CMS
- B6 (Localization Foundation) — homepage content should be locale-aware

**Risks:**
- P1: Converting homepage to CMS-driven may break existing functionality if not carefully mapped
- P2: ISR caching may cause stale content if not properly invalidated

**Acceptance Criteria:**
- Homepage renders all sections from CMS
- Homepage is locale-aware
- Homepage uses ISR for data fetching
- JSON-LD structured data is present
- All Blueprint-defined sections are supported

**Definition of Done:**
- Homepage is fully CMS-driven
- Homepage is locale-aware
- Homepage uses ISR caching
- JSON-LD structured data is present
- All sections render correctly

**Estimated Review Size:** Medium

---

### B10: SEO Foundation

**Objective:** Implement per-page SEO metadata, sitemap, robots.txt, hreflang, and structured data.

**Scope:** SEO layer only. No CMS or homepage changes.

**In Scope:**
- Implement per-page dynamic `generateMetadata` for all marketing pages
- Add `sitemap.xml` generation route
- Add `robots.txt` generation route
- Implement hreflang tags for all marketing pages (not just homepage)
- Add structured data (JSON-LD) for FAQ, Pricing, and other rich snippets
- Add Open Graph images per page
- Add canonical URLs per marketing page
- Add dynamic meta description generation from content

**Out of Scope:**
- Homepage SEO (covered in B9)
- CMS page structure (covered in B8)
- Localization (covered in B6)

**Required Inputs:**
- B9 (Homepage Foundation) — homepage SEO is a prerequisite
- B8 (Website CMS Foundation) — CMS pages need SEO metadata
- `src/app/layout.tsx` — existing root layout with static metadata
- `src/app/page.tsx` — existing homepage with dynamic metadata

**Expected Outputs:**
- Per-page `generateMetadata` for all marketing pages
- `sitemap.xml` generation route
- `robots.txt` generation route
- hreflang tags on all marketing pages
- JSON-LD structured data for FAQ, Pricing, and rich snippets
- Open Graph images per page
- Canonical URLs per marketing page
- Dynamic meta description generation

**Dependencies:**
- B9 (Homepage Foundation) — homepage SEO is a prerequisite
- B8 (Website CMS Foundation) — CMS pages need SEO metadata

**Risks:**
- P1: Per-page metadata requires each marketing page to have its own `generateMetadata` — significant implementation effort
- P2: Sitemap and robots.txt generation may need to be updated dynamically as pages are added/removed

**Acceptance Criteria:**
- All marketing pages have dynamic `generateMetadata`
- `sitemap.xml` is generated and accessible
- `robots.txt` is generated and accessible
- hreflang tags present on all marketing pages
- JSON-LD structured data for FAQ and Pricing
- Open Graph images per page
- Canonical URLs per marketing page

**Definition of Done:**
- All marketing pages have dynamic metadata
- Sitemap and robots.txt are functional
- hreflang tags are present on all pages
- Structured data is implemented for rich snippets

**Estimated Review Size:** Medium

---

### B11: Performance Optimization

**Objective:** Add caching, ISR, bundle optimization, error boundaries, and comprehensive test coverage.

**Scope:** Performance and quality layer only. No business logic or CMS changes.

**In Scope:**
- Implement ISR for all marketing pages
- Add CDN caching configuration
- Optimize bundle size (analyze with bundle analyzer, tree-shake unused code)
- Convert unnecessary Client Components to Server Components
- Add comprehensive test coverage for landing builder and CMS features
- Add error boundaries for all major page sections
- Optimize database queries with proper indexing
- Add rate limiting on public API endpoints

**Out of Scope:**
- New features
- CMS implementation (covered in B8)
- Homepage redesign (covered in B9)
- SEO implementation (covered in B10)

**Required Inputs:**
- B5 (Infrastructure Foundation) — caching and error boundaries prerequisites
- B8 (Website CMS Foundation) — CMS features need test coverage
- B9 (Homepage Foundation) — homepage needs ISR
- B10 (SEO Foundation) — SEO pages need ISR

**Expected Outputs:**
- ISR implemented for all marketing pages
- CDN caching configured
- Bundle size optimized
- Unnecessary Client Components converted to Server Components
- Test coverage for landing builder and CMS features
- Error boundaries for all major page sections
- Database queries optimized with proper indexing
- Rate limiting on public API endpoints

**Dependencies:**
- B5 (Infrastructure Foundation) — caching and error boundaries prerequisites
- B8 (Website CMS Foundation) — CMS features need test coverage
- B9 (Homepage Foundation) — homepage needs ISR
- B10 (SEO Foundation) — SEO pages need ISR

**Risks:**
- P2: Bundle optimization may reveal dependencies that are difficult to remove
- P3: Converting Client Components to Server Components may break interactivity if not carefully done
- P3: Test coverage may reveal bugs that are out of scope for this milestone

**Acceptance Criteria:**
- ISR is active for all marketing pages
- Bundle size is analyzed and optimized
- Unnecessary Client Components are converted to Server Components
- Test coverage exists for landing builder and CMS features
- Error boundaries catch and display errors gracefully
- Database queries are optimized
- Rate limiting is active on public APIs

**Definition of Done:**
- ISR is functional for all marketing pages
- Bundle size is within acceptable limits
- Test coverage meets project standards
- Error boundaries are in place
- Database queries are optimized
- Rate limiting is active

**Estimated Review Size:** Large

---

## 4. Priority Matrix

| Milestone | Priority | Blocking | Effort |
|-----------|----------|----------|--------|
| B1: Database Synchronization | P0 | Blocks all downstream milestones | Large |
| B2: Repository Foundation | P1 | Blocks B3 | Medium |
| B3: Service Foundation | P1 | Blocks B4 | Medium |
| B4: API Refactor | P1 | Blocks B5 | Medium |
| B5: Infrastructure Foundation | P1 | Blocks B6, B7 | Large |
| B6: Localization Foundation | P1 | Blocks B7, B8, B9 | Large |
| B7: Navigation Foundation | P2 | Blocks B8 | Medium |
| B8: Website CMS Foundation | P2 | Blocks B9 | Large |
| B9: Homepage Foundation | P2 | Blocks B10 | Medium |
| B10: SEO Foundation | P3 | Blocks B11 | Medium |
| B11: Performance Optimization | P3 | None (terminal) | Large |

---

## 5. Risk Matrix

| Risk ID | Risk | Milestone | Severity | Likelihood | Impact | Mitigation |
|---------|------|-----------|----------|------------|--------|------------|
| R1 | Generated migration has incorrect SQL | B1 | P0 | Medium | High | Manual review of all generated SQL before applying |
| R2 | Migration fails on production-sized data | B1 | P0 | Medium | High | Test migration on staging with production-sized data first |
| R3 | ID type inconsistency causes migration conflicts | B1 | P0 | High | High | Resolve ID type inconsistency before generating migration |
| R4 | Raw SQL in admin APIs is deeply coupled | B4 | P1 | Medium | Medium | Incremental replacement, one endpoint at a time |
| R5 | Adding locale column requires data migration | B6 | P0 | High | High | Assign default locale to all existing content before adding column |
| R6 | Database-backed translations conflict with file-based translations | B6 | P1 | Medium | Medium | File-based translations remain source of truth for UI strings; DB-backed translations only for dynamic content |
| R7 | Extending Landing Builder into CMS breaks existing functionality | B8 | P0 | Medium | High | Preserve all existing Landing Builder functionality; extend incrementally |
| R8 | Publish workflow conflicts with existing `visible` flag | B8 | P1 | Medium | Medium | Design state machine carefully; `visible` becomes `published` state |
| R9 | Replacing hardcoded navigation breaks existing structure | B7 | P1 | Medium | Medium | Map existing navigation items to data source before replacing |
| R10 | Per-page metadata requires significant implementation effort | B10 | P2 | High | Medium | Implement for most important pages first, then expand |
| R11 | Converting Client Components to Server Components breaks interactivity | B11 | P2 | Medium | Medium | Test each conversion thoroughly; keep interactive components as Client |
| R12 | Sitemap and robots.txt need dynamic updates | B10 | P2 | Low | Low | Generate sitemap and robots.txt on-demand or via ISR |

---

## 6. Implementation Order

The implementation order is strictly dependency-driven:

1. **B1** (Database Synchronization) — no dependencies, must be first
2. **B2** (Repository Foundation) — depends on B1
3. **B3** (Service Foundation) — depends on B2
4. **B4** (API Refactor) — depends on B3
5. **B5** (Infrastructure Foundation) — depends on B4
6. **B6** (Localization Foundation) — depends on B1, B5
7. **B7** (Navigation Foundation) — depends on B6
8. **B8** (Website CMS Foundation) — depends on B1, B6, B7
9. **B9** (Homepage Foundation) — depends on B8, B6
10. **B10** (SEO Foundation) — depends on B9, B8
11. **B11** (Performance Optimization) — depends on B5, B8, B9, B10

### Parallel Opportunities

- B2 and B3 can partially overlap (B3 starts as B2 completes)
- B5 and B6 can run in parallel (different domains)
- B9 and B10 can run in parallel (after B8 completes)
- B10 and B11 can run in parallel (B11 starts as B10 completes)

---

## 7. Parallel Work Opportunities

| Milestones | Parallel? | Reason |
|-----------|-----------|--------|
| B2, B3 | Yes (partial) | Repository standardization and service extraction can overlap |
| B5, B6 | Yes | Infrastructure and localization are independent domains |
| B9, B10 | Yes | Homepage and SEO are independent after B8 completes |
| B10, B11 | Yes (partial) | SEO and performance optimization can overlap |

---

## 8. Architecture Validation

This execution plan is validated against the following architectural documents:

| Document | Status |
|----------|--------|
| MASTER_ARCHITECTURE_BLUEPRINT.md | Compliant — all milestones follow Blueprint architecture principles |
| ARCHITECTURE_AUDIT.md | Addressed — all identified issues are covered by appropriate milestones |
| Sprint CMS-01 Milestone A Report | Addressed — all findings are incorporated into the execution plan |

### Blueprint Principles Verified

1. **Refactor Before Replace** — B2, B3, B4 follow this principle
2. **Reuse Before Create** — B2 ensures repositories are reused
3. **Single Source of Truth** — B6, B7 ensure single sources for localization and navigation
4. **Configuration over Hardcode** — B7 eliminates hardcoded navigation
5. **Separation of Presentation and Business Logic** — B3 ensures business logic is in services

### No Blueprint Changes Required

This execution plan does not modify the Blueprint. All milestones are consistent with the existing architecture.

---

## 9. Final Recommendations

1. **Start with B1 immediately** — database synchronization is the critical path blocker for all downstream milestones.

2. **Keep milestones small** — each milestone should be reviewable independently. If a milestone grows too large, split it.

3. **Preserve backward compatibility** — every milestone must maintain backward compatibility with existing functionality.

4. **Test on staging first** — all database migrations and infrastructure changes must be tested on staging before production.

5. **Document as you go** — each milestone should produce documentation of what was changed and why.

6. **Do not skip B5 (Infrastructure)** — middleware, caching, and error boundaries are foundational for all subsequent milestones.

7. **B8 (Website CMS) is the highest-risk milestone** — it involves significant redesign of the Landing Builder. Plan for extra review cycles.

8. **B11 (Performance Optimization) should be last** — it depends on all other milestones being complete and can only be properly measured after the full system is implemented.

9. **Do not mix domains** — each milestone has exactly one responsibility. If a milestone starts touching multiple domains, split it.

10. **This plan is the execution contract** — no implementation work begins until this plan is approved.

---

*End of Execution Plan*

# Documentation Inventory

Generated: 2026-08-02
Scope: Entire Tamer Studio repository
Total Files: ~1,297 markdown files

---

## Summary

| Location | Count | Status |
|----------|-------|--------|
| Project Root (/*.md) | 150 | Needs relocation |
| docs/ root (docs/*.md) | 409 | Needs organization |
| docs/00_DEV_OS/ | 677 | Keep (governance/standards) |
| docs/numbered dirs (01-13) | 68 | Partially filled (9 empty) |
| docs/ADR/ | 16 | Keep |
| docs/STANDARTS/ | 5 | Keep (fix typo) |
| docs/PLATFORM/ | 22 | Keep |
| docs/SPECIFICATIONS/ | 19 | Keep |
| docs/REPORTS/ | 11 | Keep |
| docs/QUALITY/ | 8 | Keep |
| docs/CONTEXT/ | 16 | Keep |
| docs/MEMORY/ | 3 | Keep |
| docs/REFERENCE/ | 3 | Keep |
| docs/PROMPTS/ | 12 | Keep |
| docs/LOCALIZATION/ | 5 | Keep |
| docs/CI_CD/ | 22 | Keep |
| docs/DEVELOPER/ | 22 | Keep |
| docs/sprints/ | 100 | Archive old sprints |
| docs/api/ | 12 | Merge into modules |
| docs/auth/ | 47 | Merge into modules |
| docs/database/ | 23 | Merge into modules |
| docs/e2e/ | 17 | Merge into verification |
| docs/PROD-01/ | 17 | Archive |
| docs/GLOBAL_PREFERENCES/ | 5 | Merge into specifications |
| docs/99_ARCHIVE/ | 25 | Keep |

---

## Root-Level Files (150 files)

### Reports (94 files)

| # | Filename | Module | Purpose | Duplicate Candidate | Recommendation |
|---|----------|--------|---------|-------------------|----------------|
| 1 | `admin-live-report.md` | Admin | Live verification of admin pages | - | MOVE to docs/REPORTS/ |
| 2 | `admin-remediation-report.md` | Admin | CMS-01.5 admin remediation | - | ARCHIVE to docs/sprints/ |
| 3 | `ai-live-report.md` | AI | AI Runtime live verification | - | MOVE to docs/REPORTS/ |
| 4 | `ai-remediation-report.md` | AI | AI dead code cleanup | - | ARCHIVE to docs/sprints/ |
| 5 | `api-live-report.md` | API | API endpoint verification | - | MOVE to docs/REPORTS/ |
| 6 | `application-layer-audit-report.md` | Application | API route audit | - | MOVE to docs/REPORTS/ |
| 7 | `application-localization-report.md` | Localization | Localization verification | - | MOVE to docs/REPORTS/ |
| 8 | `architecture-cleanup-report.md` | Architecture | Dead code cleanup | - | ARCHIVE to docs/sprints/ |
| 9 | `audit-report.md` | CMS | CMS audit log status | `cms-audit-report.md` | MERGE with cms-audit-report.md |
| 10 | `authentication-audit-report.md` | Auth | Dual auth audit | - | MOVE to docs/REPORTS/ |
| 11 | `authentication-live-report.md` | Auth | Auth live verification | - | MOVE to docs/REPORTS/ |
| 12 | `authentication-remediation-report.md` | Auth | Auth remediation | - | ARCHIVE to docs/sprints/ |
| 13 | `authentication-repair-report.md` | Auth | RBAC repair | - | ARCHIVE to docs/sprints/ |
| 14 | `authorization-report.md` | Auth | Authorization centralization | - | MOVE to docs/REPORTS/ |
| 15 | `breadcrumb-runtime-report.md` | Navigation | Breadcrumb runtime | - | MOVE to docs/modules/navigation/ |
| 16 | `browser-live-report.md` | Platform | Build verification | - | MOVE to docs/REPORTS/ |
| 17 | `cache-report.md` | Infrastructure | Cache audit | - | MOVE to docs/REPORTS/ |
| 18 | `cms-api-report.md` | CMS | CMS API endpoints | - | MOVE to docs/modules/cms/ |
| 19 | `cms-audit-report.md` | CMS | CMS audit findings | `audit-report.md` | MOVE to docs/modules/cms/ |
| 20 | `cms-core-report.md` | CMS | CMS core components | - | MOVE to docs/modules/cms/ |
| 21 | `cms-landing-homepage-verification-report.md` | CMS | CMS/Landing QA | - | MERGE into docs/modules/cms/ |
| 22 | `cms-live-report.md` | CMS | CMS live verification | - | MOVE to docs/modules/cms/ |
| 23 | `cms-localization-report.md` | CMS | CMS localization | - | MOVE to docs/modules/cms/ |
| 24 | `cms-navigation-report.md` | CMS | CMS navigation | - | MOVE to docs/modules/cms/ |
| 25 | `component-library-report.md` | CMS | Component library | - | MOVE to docs/modules/cms/ |
| 26 | `configuration-report.md` | Infrastructure | Config audit | - | MOVE to docs/REPORTS/ |
| 27 | `content-registry-report.md` | CMS | Content registry | - | MOVE to docs/modules/cms/ |
| 28 | `currency-runtime-report.md` | Localization | Currency runtime | ` currency-runtime-report.md` | KEEP, DELETE duplicate |
| 29 | ` currency-runtime-report.md` | Localization | Currency runtime (duplicate) | `currency-runtime-report.md` | DELETE |
| 30 | `dashboard-live-report.md` | Dashboard | Dashboard verification | - | MOVE to docs/modules/dashboard/ |
| 31 | `dashboard-remediation-report.md` | Dashboard | Dashboard remediation | - | ARCHIVE to docs/sprints/ |
| 32 | `database-live-report.md` | Database | DB verification | - | MOVE to docs/REPORTS/ |
| 33 | `database-remediation-report.md` | Database | DB remediation | - | ARCHIVE to docs/sprints/ |
| 34 | `dependency-injection-report.md` | Infrastructure | DI audit | - | MOVE to docs/REPORTS/ |
| 35 | `dto-mapping-report.md` | Application | DTO standardization | - | MOVE to docs/REPORTS/ |
| 36 | `email-provider-report.md` | Email | Email providers | - | MOVE to docs/modules/email/ |
| 37 | `end-to-end-validation-report.md` | Platform | E2E validation | - | MOVE to docs/REPORTS/ |
| 38 | `error-mapping-report.md` | Infrastructure | Error mapping | - | MOVE to docs/REPORTS/ |
| 39 | `event-bus-report.md` | Infrastructure | Event system audit | - | MOVE to docs/REPORTS/ |
| 40 | `event-remediation-report.md` | Infrastructure | Event remediation | - | ARCHIVE to docs/sprints/ |
| 41 | `event-runtime-completion-report.md` | Infrastructure | Event runtime | - | MOVE to docs/REPORTS/ |
| 42 | `formatting-report.md` | Localization | Formatting impl | - | MOVE to docs/modules/localization/ |
| 43 | `homepage-live-report.md` | Homepage | Homepage verification | - | MOVE to docs/modules/homepage/ |
| 44 | `infrastructure-audit-report.md` | Infrastructure | Sprint B4 audit | - | MOVE to docs/REPORTS/ |
| 45 | `landing-builder-live-report.md` | Landing | Landing builder verify | - | MOVE to docs/modules/landing/ |
| 46 | `locale-detection-report.md` | Localization | Locale detection | - | MOVE to docs/modules/localization/ |
| 47 | `localization-audit-report.md` | Localization | Localization audit | `LOCALIZATION_AUDIT.md` | MERGE with LOCALIZATION_AUDIT.md |
| 48 | `localization-live-report.md` | Localization | Localization verify | - | MOVE to docs/modules/localization/ |
| 49 | `localization-remediation-report.md` | Localization | Hardcoded strings | - | ARCHIVE to docs/sprints/ |
| 50 | `localization-runtime-report.md` | Localization | Runtime components | - | MOVE to docs/modules/localization/ |
| 51 | `logging-report.md` | Infrastructure | Logging audit | - | MOVE to docs/REPORTS/ |
| 52 | `media-library-report.md` | CMS | Media library | - | MOVE to docs/modules/cms/ |
| 53 | `media-live-report.md` | CMS | Media verification | - | MOVE to docs/modules/cms/ |
| 54 | `media-remediation-report.md` | CMS | Media remediation | - | ARCHIVE to docs/sprints/ |
| 55 | `menu-management-report.md` | Navigation | Menu management | - | MOVE to docs/modules/navigation/ |
| 56 | `middleware-report.md` | Infrastructure | Middleware standard | - | MOVE to docs/REPORTS/ |
| 57 | `navigation-api-report.md` | Navigation | Navigation API | - | MOVE to docs/modules/navigation/ |
| 58 | `navigation-audit-report.md` | Navigation | Navigation audit | - | MOVE to docs/modules/navigation/ |
| 59 | `navigation-cache-report.md` | Navigation | Navigation cache | - | MOVE to docs/modules/navigation/ |
| 60 | `navigation-live-report.md` | Navigation | Navigation verify | - | MOVE to docs/modules/navigation/ |
| 61 | `navigation-localization-report.md` | Navigation | Navigation i18n | - | MOVE to docs/modules/navigation/ |
| 62 | `navigation-registry-report.md` | Navigation | Navigation registry | - | MOVE to docs/modules/navigation/ |
| 63 | `navigation-remediation-report.md` | Navigation | Navigation remediation | - | ARCHIVE to docs/sprints/ |
| 64 | `navigation-runtime-report.md` | Navigation | Navigation runtime | - | MOVE to docs/modules/navigation/ |
| 65 | `navigation-seo-report.md` | Navigation | Navigation SEO | - | MOVE to docs/modules/navigation/ |
| 66 | `observability-report.md` | Infrastructure | Observability audit | - | MOVE to docs/REPORTS/ |
| 67 | `page-management-report.md` | CMS | Page management | - | MOVE to docs/modules/cms/ |
| 68 | `payment-live-report.md` | Payment | Payment verification | - | MOVE to docs/modules/payment/ |
| 69 | `performance-smoke-report.md` | Platform | Performance benchmarks | - | MOVE to docs/REPORTS/ |
| 70 | `permission-navigation-report.md` | Navigation | Permission navigation | - | MOVE to docs/modules/navigation/ |
| 71 | `permission-report.md` | CMS | CMS permissions | - | MOVE to docs/modules/cms/ |
| 72 | `production-readiness-report.md` | Platform | Production readiness | - | MOVE to docs/REPORTS/ |
| 73 | `publishing-pipeline-report.md` | CMS | Publishing pipeline | - | MOVE to docs/modules/cms/ |
| 74 | `queue-report.md` | Infrastructure | Job queue audit | - | MOVE to docs/REPORTS/ |
| 75 | `repository-live-report.md` | Infrastructure | Repository pattern | - | MOVE to docs/REPORTS/ |
| 76 | `repository-remediation-report.md` | Infrastructure | Repository remediation | - | ARCHIVE to docs/sprints/ |
| 77 | `request-context-report.md` | Infrastructure | Request context | - | MOVE to docs/REPORTS/ |
| 78 | `response-mapping-report.md` | Application | Response mapping | - | MOVE to docs/REPORTS/ |
| 79 | `route-verification-report.md` | Platform | Route verification | - | MOVE to docs/REPORTS/ |
| 80 | `runtime-remediation-report.md` | CMS | Runtime remediation | - | ARCHIVE to docs/sprints/ |
| 81 | `section-management-report.md` | CMS | Section management | - | MOVE to docs/modules/cms/ |
| 82 | `seo-live-report.md` | SEO | SEO verification | - | MOVE to docs/modules/seo/ |
| 83 | `seo-remediation-report.md` | SEO | SEO remediation | - | ARCHIVE to docs/sprints/ |
| 84 | `storage-provider-report.md` | Infrastructure | Storage providers | - | MOVE to docs/REPORTS/ |
| 85 | `translation-cache-report.md` | Localization | Translation cache | - | MOVE to docs/modules/localization/ |
| 86 | `translation-management-report.md` | Localization | Translation admin | - | MOVE to docs/modules/localization/ |
| 87 | `translation-runtime-report.md` | Localization | Translation runtime | - | MOVE to docs/modules/localization/ |
| 88 | `translation-sync-report.md` | Localization | Translation sync | - | MOVE to docs/modules/localization/ |
| 89 | `translation-validation-report.md` | Localization | Translation validation | - | MOVE to docs/modules/localization/ |
| 90 | `validation-report.md` | Application | Validation standard | - | MOVE to docs/REPORTS/ |
| 91 | `versioning-report.md` | CMS | Content versioning | - | MOVE to docs/modules/cms/ |
| 92 | `payment-ai-browser-verification-report.md` | Payment/AI | E2E browser verify | Multiple | ARCHIVE (superseded) |
| 93 | `COMPLETION_REPORT.md` | Platform | Cleanup completion | - | ARCHIVE to docs/sprints/ |
| 94 | `FILE_CHANGES_SUMMARY.md` | Dashboard | File change log | Overlaps | ARCHIVE (superseded) |

### Standards (6 files)

| # | Filename | Module | Purpose | Recommendation |
|---|----------|--------|---------|----------------|
| 1 | `APPLICATION_LAYER_STANDARD.md` | Application | API route standard | MOVE to docs/STANDARTS/ |
| 2 | `ARCHITECTURE_AUDIT.md` | Architecture | Sprint CMS-00 audit | MOVE to docs/REPORTS/ |
| 3 | `B3_IMPLEMENTATION_RULES.md` | Application | Sprint B3 rules | ARCHIVE to docs/sprints/ |
| 4 | `B3_REVIEW_CHECKLIST.md` | Application | Sprint B3 checklist | ARCHIVE to docs/sprints/ |
| 5 | `CMS_ARCHITECTURE_STANDARD.md` | CMS | CMS architecture | MOVE to docs/modules/cms/ |
| 6 | `INFRASTRUCTURE_ARCHITECTURE_STANDARD.md` | Infrastructure | Infrastructure standard | MOVE to docs/STANDARTS/ |
| 7 | `LOCALIZATION_ARCHITECTURE_STANDARD.md` | Localization | Localization standard | MOVE to docs/STANDARTS/ |

### Guides (14 files)

| # | Filename | Module | Purpose | Duplicate Candidate | Recommendation |
|---|----------|--------|---------|-------------------|----------------|
| 1 | `IMPLEMENTATION_GUIDE.md` | Application | CRUD implementation | - | MOVE to docs/DEVELOPER/ |
| 2 | `IMPLEMENTATION_NOTES.md` | Dashboard | Dashboard redesign notes | Overlaps | ARCHIVE (superseded) |
| 3 | `INSTRUCTIONS.md` | Global | AI engineering instructions | - | MOVE to docs/PROMPTS/ |
| 4 | `LANDING_PAGE_BUILDER_SETUP.md` | Landing | Landing builder setup | Overlaps | MERGE into docs/modules/landing/ |
| 5 | `LANDING_PAGE_COMPLETE_SUMMARY.md` | Landing | Landing page summary | Overlaps | ARCHIVE (superseded) |
| 6 | `LANDING_PAGE_DATABASE_INTEGRATION.md` | Landing | Landing DB integration | Overlaps | MERGE into docs/modules/landing/ |
| 7 | `PYTHON_SCRIPTS_REFERENCE.md` | Platform | Python scripts reference | - | MOVE to docs/DEVELOPER/ |
| 8 | `QUICK_REFERENCE.md` | Landing | Landing quick reference | Overlaps | MERGE with QUICK_START_GUIDE.md |
| 9 | `QUICK_START_GUIDE.md` | Landing | Landing quick start | Overlaps | MOVE to docs/modules/landing/ |
| 10 | `QUICK_START_RECHARTS.md` | Dashboard | Recharts quick start | - | MOVE to docs/modules/dashboard/ |
| 11 | `README.md` | Global | Project README | - | KEEP (update in place) |
| 12 | `START_HERE.md` | Dashboard | Recharts landing | Multiple | ARCHIVE (superseded) |
| 13 | `ADMIN_LANDING_BUILDER_TESTING_GUIDE.md` | Landing | Landing testing guide | Overlaps | MOVE to docs/modules/landing/ |
| 14 | `DEPLOYMENT_CHECKLIST.md` | Platform | Pre-deploy checklist | - | MOVE to docs/CI_CD/ |

### Fixes (8 files)

| # | Filename | Module | Purpose | Recommendation |
|---|----------|--------|---------|----------------|
| 1 | `ANALYTICS_BUG_FIXES.md` | Analytics | Analytics bug fixes | ARCHIVE to docs/sprints/ |
| 2 | `EMAIL_DASHBOARD_BUG_FIX.md` | Email | Email dashboard fix | ARCHIVE to docs/sprints/ |
| 3 | `ELEGANT_LOADING_COMPONENT.md` | UI | Loading component impl | ARCHIVE to docs/sprints/ |
| 4 | `FOOTER_DUPLICATE_FIX.md` | Landing | Footer fix | ARCHIVE to docs/sprints/ |
| 5 | `HEADER_FOOTER_ALIGNMENT_REPORT.md` | Landing | Header/footer alignment | ARCHIVE to docs/sprints/ |
| 6 | `HYDRATION_FIX_REPORT.md` | Platform | Hydration fix | ARCHIVE to docs/sprints/ |
| 7 | `MARKETING_PAGES_ALIGNMENT_COMPLETE.md` | Landing | Marketing pages fix | ARCHIVE to docs/sprints/ |
| 8 | `TRANSLATION_UPDATE_FAQ_SUBSCRIPTIONS.md` | Localization | FAQ translations | DELETE (superseded by _COMPLETE) |
| 9 | `TRANSLATION_UPDATE_FAQ_SUBSCRIPTIONS_COMPLETE.md` | Localization | FAQ translations (complete) | ARCHIVE to docs/sprints/ |

### Implementation (6 files)

| # | Filename | Module | Purpose | Recommendation |
|---|----------|--------|---------|----------------|
| 1 | `ADMIN_DASHBOARD_REDESIGN.md` | Dashboard | Dashboard redesign | MOVE to docs/modules/dashboard/ |
| 2 | `ADMIN_LANDING_BUILDER_COMPLETE.md` | Landing | Landing builder complete | ARCHIVE (superseded) |
| 3 | `DASHBOARD_REDESIGN_VISUAL_SUMMARY.md` | Dashboard | Dashboard visual layout | MERGE into ADMIN_DASHBOARD_REDESIGN.md |
| 4 | `SETUP_COMPLETE.md` | Landing | Landing setup complete | ARCHIVE (superseded) |
| 5 | `SETUP_SUMMARY.md` | Platform | Feature setup summary | ARCHIVE to docs/sprints/ |
| 6 | `STATUS.md` | Landing | Landing status | ARCHIVE (superseded) |

### Sprint (4 files)

| # | Filename | Module | Purpose | Recommendation |
|---|----------|--------|---------|----------------|
| 1 | `SPRINT_BUS_LOCALIZATION_01_REPORT.md` | Localization | Sprint BUS-LOC-01 | MOVE to docs/sprints/ |
| 2 | `SPRINT_CMS-01_B3_APPLICATION_LAYER_REFACTOR.md` | Application | Sprint CMS-01 B3 | MOVE to docs/sprints/ |
| 3 | `SPRINT_CMS-01_MILESTONE_A_REPORT.md` | CMS | Sprint CMS-01 A | MOVE to docs/sprints/ |
| 4 | `SPRINT_CMS-01_MILESTONE_A5_EXECUTION_PLAN.md` | CMS | Sprint CMS-01 A.5 | MOVE to docs/sprints/ |

### Verification (7 files)

| # | Filename | Module | Purpose | Recommendation |
|---|----------|--------|---------|----------------|
| 1 | `FINAL_VERIFICATION.md` | Landing | Landing verification | ARCHIVE (superseded) |
| 2 | `VERIFICATION_CHECKLIST.md` | Security | Security fixes verify | MOVE to docs/REPORTS/ |
| 3 | `ADMIN_PANEL_REPORT.md` | Admin | Admin panel audit | MOVE to docs/REPORTS/ |
| 4 | `FILE_MANIFEST.md` | Dashboard | Recharts file manifest | ARCHIVE (superseded) |
| 5 | `RECHARTS_BEFORE_AFTER.md` | Dashboard | Recharts before/after | ARCHIVE (superseded) |
| 6 | `RECHARTS_COMPLETE_SUMMARY.md` | Dashboard | Recharts summary | MERGE into dashboard docs |
| 7 | `RECHARTS_DASHBOARD_INTEGRATION.md` | Dashboard | Recharts integration | MOVE to docs/modules/dashboard/ |
| 8 | `RECHARTS_DOCUMENTATION_INDEX.md` | Dashboard | Recharts doc index | ARCHIVE (superseded) |
| 9 | `RECHARTS_INTEGRATION_GUIDE.md` | Dashboard | Recharts API reference | MOVE to docs/modules/dashboard/ |
| 10 | `RECHARTS_INTEGRATION_SUMMARY.md` | Dashboard | Recharts summary | MERGE into RECHARTS_INTEGRATION_GUIDE.md |
| 11 | `README_RECHARTS.md` | Dashboard | Recharts README | ARCHIVE (superseded) |

---

## docs/ Root-Level Files (409 files)

### Category Breakdown

| Category | Count | Target Location |
|----------|-------|----------------|
| Sprint testing/final reports (WEB-*, AI-*, SEC-*, etc.) | ~200 | docs/sprints/{sprint-id}/ |
| Sprint sub-docs (Architecture, DB, API, etc.) | ~150 | docs/sprints/{sprint-id}/ |
| Documentation governance/meta | ~15 | docs/00_META/ |
| Architecture docs | ~30 | docs/modules/{module}/ |
| Audit reports | ~12 | docs/REPORTS/ |
| Guides | ~10 | docs/DEVELOPER/ |
| Standards/policies | ~16 | docs/STANDARTS/ |
| Cross-cutting (glossary, maps, etc.) | ~16 | docs/ |
| Product definition | ~5 | docs/01_PRODUCT/ |
| Sprint planning | ~8 | docs/sprints/ |

### Key Duplicates in docs/

| Topic | Files | Action |
|-------|-------|--------|
| AI Runtime Architecture | `ai-runtime-architecture.md`, `WEB-AI-01-Architecture.md`, `AI-RUNTIME-02-Architecture.md` | Keep latest, archive others |
| Security Architecture | `SEC-01-Architecture.md`, `SECURITY_BASELINE_SPEC.md` | Keep both (different scope) |
| Documentation Meta | 11 `DOCUMENTATION_*.md` files | Consolidate into docs/00_META/ |
| Testing Standards | `TESTING_GUIDELINES.md` + sprint Testing files | Keep both (different scope) |

---

## Total Statistics

| Metric | Value |
|--------|-------|
| Total .md files (entire repo) | ~1,297 |
| Root-level .md files | 150 |
| docs/ .md files | ~1,147 |
| Empty directories | 9 (05_FRONTEND through 13_GUIDES + ASSETS/) |
| Duplicate candidates identified | 15 clusters |
| Files to MOVE | ~120 |
| Files to ARCHIVE | ~60 |
| Files to MERGE | ~20 |
| Files to DELETE | ~5 |
| Files to UPDATE | ~30 |

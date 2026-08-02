# Documentation Cleanup Plan

Generated: 2026-08-02
Purpose: Actionable plan for reorganizing all documentation
Status: PLANNING ONLY — No file movement yet

---

## Action Categories

| Action | Description | Count |
|--------|-------------|-------|
| KEEP | File stays in current location | ~850 |
| MOVE | File moves to a new organized location | ~120 |
| MERGE | Multiple files consolidated into one | ~20 files → ~10 |
| ARCHIVE | File moves to docs/archive/ | ~60 |
| DELETE DUPLICATION | Redundant duplicate removed | ~5 |
| UPDATE LINKS | Internal references updated | ~30 |

---

## 1. KEEP (Files in correct location)

### docs/ subdirectories (keep as-is)
- `docs/00_DEV_OS/` — 677 files (governance/standards)
- `docs/00_META/` — 19 files (documentation meta)
- `docs/01_PRODUCT/` — 1 file (product spec)
- `docs/02_ARCHITECTURE/` — 25 files (architecture specs)
- `docs/03_AI/` — 22 files (AI strategy)
- `docs/04_BACKEND/` — 20 files (backend patterns)
- `docs/ADR/` — 16 files (architecture decisions)
- `docs/PLATFORM/` — 22 files (platform services)
- `docs/SPECIFICATIONS/` — 19 files (specs)
- `docs/REPORTS/` — 11 files (reports)
- `docs/QUALITY/` — 8 files (quality)
- `docs/CONTEXT/` — 16 files (context)
- `docs/MEMORY/` — 3 files (memory)
- `docs/PROMPTS/` — 12 files (prompts)
- `docs/CI_CD/` — 22 files (CI/CD)
- `docs/DEVELOPER/` — 22 files (developer guides)
- `docs/GLOBAL_PREFERENCES/` — 5 files (preferences)
- `docs/99_ARCHIVE/` — 25 files (already archived)
- `docs/README.md` — Documentation portal
- `docs/INDEX.md` — Master index
- `docs/UNIFIED_GLOSSARY.md` — Glossary
- `docs/TRACEABILITY_MATRIX.md` — Traceability

### docs/ root cross-cutting (keep in place)
- `docs/PRODUCT.md`
- `docs/BRAND_DNA.md`
- `docs/ROADMAP.md`
- `docs/ENGINEERING_GLOSSARY.md`
- `docs/ENGINEERING_DASHBOARD.md`
- `docs/GOVERNANCE_OVERVIEW.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/IMPLEMENTATION_FLOW.md`
- `docs/IMPLEMENTATION_GOVERNANCE.md`
- `docs/MASTER_REFERENCE_GUIDE.md`
- `docs/DECISION_TREE.md`
- `docs/CROSS_DOMAIN_VALIDATION.md`
- `docs/DOMAIN_DEPENDENCY_MAP.md`
- `docs/DOMAIN_RELATIONSHIP_MATRIX.md`

---

## 2. MOVE (Files to relocate)

### Root → docs/modules/{module}/

| Source | Target | Module |
|--------|--------|--------|
| `authentication-audit-report.md` | `docs/modules/auth/audit-report.md` | Auth |
| `authentication-live-report.md` | `docs/modules/auth/live-report.md` | Auth |
| `authorization-report.md` | `docs/modules/auth/authorization-report.md` | Auth |
| `CMS_ARCHITECTURE_STANDARD.md` | `docs/modules/cms/architecture.md` | CMS |
| `cms-api-report.md` | `docs/modules/cms/api-report.md` | CMS |
| `cms-core-report.md` | `docs/modules/cms/core-report.md` | CMS |
| `cms-live-report.md` | `docs/modules/cms/live-report.md` | CMS |
| `cms-localization-report.md` | `docs/modules/cms/localization.md` | CMS |
| `cms-navigation-report.md` | `docs/modules/cms/navigation.md` | CMS |
| `component-library-report.md` | `docs/modules/cms/component-library.md` | CMS |
| `content-registry-report.md` | `docs/modules/cms/content-registry.md` | CMS |
| `media-library-report.md` | `docs/modules/cms/media-library.md` | CMS |
| `media-live-report.md` | `docs/modules/cms/media-live.md` | CMS |
| `page-management-report.md` | `docs/modules/cms/page-management.md` | CMS |
| `permission-report.md` | `docs/modules/cms/permissions.md` | CMS |
| `publishing-pipeline-report.md` | `docs/modules/cms/publishing-pipeline.md` | CMS |
| `section-management-report.md` | `docs/modules/cms/section-management.md` | CMS |
| `versioning-report.md` | `docs/modules/cms/versioning.md` | CMS |
| `navigation-api-report.md` | `docs/modules/navigation/api-report.md` | Navigation |
| `navigation-audit-report.md` | `docs/modules/navigation/audit-report.md` | Navigation |
| `navigation-cache-report.md` | `docs/modules/navigation/cache-report.md` | Navigation |
| `navigation-live-report.md` | `docs/modules/navigation/live-report.md` | Navigation |
| `navigation-localization-report.md` | `docs/modules/navigation/localization.md` | Navigation |
| `navigation-registry-report.md` | `docs/modules/navigation/registry-report.md` | Navigation |
| `navigation-runtime-report.md` | `docs/modules/navigation/runtime-report.md` | Navigation |
| `navigation-seo-report.md` | `docs/modules/navigation/seo-report.md` | Navigation |
| `menu-management-report.md` | `docs/modules/navigation/menu-management.md` | Navigation |
| `breadcrumb-runtime-report.md` | `docs/modules/navigation/breadcrumb-runtime.md` | Navigation |
| `permission-navigation-report.md` | `docs/modules/navigation/permission-navigation.md` | Navigation |
| `LOCALIZATION_ARCHITECTURE_STANDARD.md` | `docs/modules/localization/architecture.md` | Localization |
| `localization-live-report.md` | `docs/modules/localization/live-report.md` | Localization |
| `localization-runtime-report.md` | `docs/modules/localization/runtime-report.md` | Localization |
| `locale-detection-report.md` | `docs/modules/localization/locale-detection.md` | Localization |
| `currency-runtime-report.md` | `docs/modules/localization/currency-runtime.md` | Localization |
| `formatting-report.md` | `docs/modules/localization/formatting.md` | Localization |
| `translation-cache-report.md` | `docs/modules/localization/translation-cache.md` | Localization |
| `translation-management-report.md` | `docs/modules/localization/translation-management.md` | Localization |
| `translation-runtime-report.md` | `docs/modules/localization/translation-runtime.md` | Localization |
| `translation-sync-report.md` | `docs/modules/localization/translation-sync.md` | Localization |
| `translation-validation-report.md` | `docs/modules/localization/translation-validation.md` | Localization |
| `AI_ARCHITECTURE.md` | `docs/modules/ai/architecture.md` | AI |
| `AI_CONTEXT_MAPPING.md` | `docs/modules/ai/context-mapping.md` | AI |
| `ai-live-report.md` | `docs/modules/ai/live-report.md` | AI |
| `seo-runtime-architecture.md` | `docs/modules/seo/architecture.md` | SEO |
| `seo-live-report.md` | `docs/modules/seo/live-report.md` | SEO |
| `homepage-live-report.md` | `docs/modules/homepage/live-report.md` | Homepage |
| `landing-builder-architecture.md` | `docs/modules/landing/architecture.md` | Landing |
| `landing-builder-live-report.md` | `docs/modules/landing/live-report.md` | Landing |
| `QUICK_START_GUIDE.md` | `docs/modules/landing/quick-start.md` | Landing |
| `ADMIN_LANDING_BUILDER_TESTING_GUIDE.md` | `docs/modules/landing/testing-guide.md` | Landing |
| `ADMIN_DASHBOARD_REDESIGN.md` | `docs/modules/dashboard/redesign.md` | Dashboard |
| `dashboard-live-report.md` | `docs/modules/dashboard/live-report.md` | Dashboard |
| `QUICK_START_RECHARTS.md` | `docs/modules/dashboard/recharts-quick-start.md` | Dashboard |
| `RECHARTS_INTEGRATION_GUIDE.md` | `docs/modules/dashboard/recharts-guide.md` | Dashboard |
| `RECHARTS_DASHBOARD_INTEGRATION.md` | `docs/modules/dashboard/recharts-integration.md` | Dashboard |
| `payment-live-report.md` | `docs/modules/payment/live-report.md` | Payment |
| `email-provider-report.md` | `docs/modules/email/provider-report.md` | Email |
| `ADMIN_PANEL_REPORT.md` | `docs/modules/admin/panel-report.md` | Admin |
| `admin-live-report.md` | `docs/modules/admin/live-report.md` | Admin |
| `event-bus-report.md` | `docs/modules/events/bus-report.md` | Events |
| `event-runtime-completion-report.md` | `docs/modules/events/runtime-report.md` | Events |
| `cache-report.md` | `docs/modules/cache/audit-report.md` | Cache |
| `middleware-report.md` | `docs/modules/middleware/standardization-report.md` | Middleware |
| `observability-report.md` | `docs/modules/observability/audit-report.md` | Observability |
| `dependency-injection-report.md` | `docs/modules/foundation/di-report.md` | Foundation |
| `configuration-report.md` | `docs/modules/foundation/config-report.md` | Foundation |
| `storage-provider-report.md` | `docs/modules/foundation/storage-report.md` | Foundation |
| `request-context-report.md` | `docs/modules/foundation/request-context.md` | Foundation |
| `SECURITY_BASELINE_SPEC.md` | `docs/modules/security/baseline-spec.md` | Security |

### Root → docs/standards/

| Source | Target |
|--------|--------|
| `APPLICATION_LAYER_STANDARD.md` | `docs/standards/application-layer.md` |
| `INFRASTRUCTURE_ARCHITECTURE_STANDARD.md` | `docs/standards/infrastructure.md` |

### Root → docs/reports/

| Source | Target |
|--------|--------|
| `ARCHITECTURE_AUDIT.md` | `docs/reports/architecture-audit.md` |
| `authentication-audit-report.md` | `docs/reports/authentication-audit.md` |
| `application-layer-audit-report.md` | `docs/reports/application-layer-audit.md` |
| `application-localization-report.md` | `docs/reports/application-localization.md` |
| `infrastructure-audit-report.md` | `docs/reports/infrastructure-audit.md` |
| `database-live-report.md` | `docs/reports/database-live.md` |
| `browser-live-report.md` | `docs/reports/browser-live.md` |
| `api-live-report.md` | `docs/reports/api-live.md` |
| `end-to-end-validation-report.md` | `docs/reports/end-to-end-validation.md` |
| `performance-smoke-report.md` | `docs/reports/performance-smoke.md` |
| `production-readiness-report.md` | `docs/reports/production-readiness.md` |
| `repository-live-report.md` | `docs/reports/repository-live.md` |
| `route-verification-report.md` | `docs/reports/route-verification.md` |
| `VERIFICATION_CHECKLIST.md` | `docs/reports/verification-checklist.md` |
| `error-mapping-report.md` | `docs/reports/error-mapping.md` |
| `dto-mapping-report.md` | `docs/reports/dto-mapping.md` |
| `response-mapping-report.md` | `docs/reports/response-mapping.md` |
| `validation-report.md` | `docs/reports/validation.md` |
| `logging-report.md` | `docs/reports/logging.md` |
| `queue-report.md` | `docs/reports/queue.md` |

### Root → docs/sprint/

| Source | Target |
|--------|--------|
| `SPRINT_BUS_LOCALIZATION_01_REPORT.md` | `docs/sprint/BUS-LOCALIZATION-01/report.md` |
| `SPRINT_CMS-01_B3_APPLICATION_LAYER_REFACTOR.md` | `docs/sprint/CMS-01/B3-spec.md` |
| `SPRINT_CMS-01_MILESTONE_A_REPORT.md` | `docs/sprint/CMS-01/milestone-a-report.md` |
| `SPRINT_CMS-01_MILESTONE_A5_EXECUTION_PLAN.md` | `docs/sprint/CMS-01/milestone-a5-plan.md` |

### docs/ loose → docs/modules/{module}/

| Source | Target | Module |
|--------|--------|--------|
| `docs/ai-runtime-architecture.md` | `docs/modules/ai/runtime-architecture.md` | AI |
| `docs/landing-builder-architecture.md` | `docs/modules/landing/architecture.md` | Landing |
| `docs/seo-runtime-architecture.md` | `docs/modules/seo/architecture.md` | SEO |
| `docs/user-dashboard-architecture.md` | `docs/modules/dashboard/architecture.md` | Dashboard |
| `docs/database-architecture.md` | `docs/architecture/database-layer.md` | Architecture |

---

## 3. MERGE (Consolidate duplicates)

| Source Files | Target File | Notes |
|-------------|-------------|-------|
| `audit-report.md` + `cms-audit-report.md` (root) | `docs/modules/cms/audit-report.md` | CMS audit findings |
| `LOCALIZATION_AUDIT.md` + `localization-audit-report.md` (root) | `docs/modules/localization/audit.md` | Localization audit |
| `DASHBOARD_REDESIGN_VISUAL_SUMMARY.md` + `ADMIN_DASHBOARD_REDESIGN.md` (root) | `docs/modules/dashboard/redesign.md` | Dashboard redesign |
| `RECHARTS_INTEGRATION_SUMMARY.md` + `RECHARTS_COMPLETE_SUMMARY.md` (root) | `docs/modules/dashboard/recharts-guide.md` | Recharts docs |
| `QUICK_REFERENCE.md` + `QUICK_START_GUIDE.md` (root) | `docs/modules/landing/quick-start.md` | Landing quick start |
| `LANDING_PAGE_BUILDER_SETUP.md` + `LANDING_PAGE_DATABASE_INTEGRATION.md` (root) | `docs/modules/landing/setup.md` | Landing setup |
| `docs/AI_ARCHITECTURE.md` + `AI_ARCHITECTURE.md` (root) | `docs/modules/ai/architecture.md` | AI architecture |
| `docs/AI_CONTEXT_MAPPING.md` + `AI_CONTEXT_MAPPING.md` (root) | `docs/modules/ai/context-mapping.md` | AI context |

---

## 4. ARCHIVE (Move to docs/archive/)

### Root-level files to archive

| Source | Archive Location | Reason |
|--------|-----------------|--------|
| `authentication-remediation-report.md` | `docs/archive/root-reports/` | Sprint remediation completed |
| `authentication-repair-report.md` | `docs/archive/root-reports/` | RBAC repair completed |
| `ai-remediation-report.md` | `docs/archive/root-reports/` | Dead code removal completed |
| `architecture-cleanup-report.md` | `docs/archive/root-reports/` | Cleanup completed |
| `admin-remediation-report.md` | `docs/archive/root-reports/` | Remediation completed |
| `dashboard-remediation-report.md` | `docs/archive/root-reports/` | Remediation completed |
| `database-remediation-report.md` | `docs/archive/root-reports/` | Remediation completed |
| `event-remediation-report.md` | `docs/archive/root-reports/` | Remediation completed |
| `repository-remediation-report.md` | `docs/archive/root-reports/` | Remediation completed |
| `runtime-remediation-report.md` | `docs/archive/root-reports/` | Remediation completed |
| `seo-remediation-report.md` | `docs/archive/root-reports/` | Remediation completed |
| `localization-remediation-report.md` | `docs/archive/root-reports/` | Remediation completed |
| `navigation-remediation-report.md` | `docs/archive/root-reports/` | Remediation completed |
| `media-remediation-report.md` | `docs/archive/root-reports/` | Remediation completed |
| `LANDING_PAGE_COMPLETE_SUMMARY.md` | `docs/archive/root-reports/` | Superseded |
| `LANDING_PAGE_BUILDER_SETUP.md` | `docs/archive/root-reports/` | Superseded by merge |
| `LANDING_PAGE_DATABASE_INTEGRATION.md` | `docs/archive/root-reports/` | Superseded by merge |
| `SETUP_COMPLETE.md` | `docs/archive/root-reports/` | Superseded |
| `STATUS.md` | `docs/archive/root-reports/` | Superseded |
| `COMPLETION_REPORT.md` | `docs/archive/root-reports/` | Historical |
| `FINAL_VERIFICATION.md` | `docs/archive/root-reports/` | Superseded |
| `FOOTER_DUPLICATE_FIX.md` | `docs/archive/root-reports/` | Fix applied |
| `HEADER_FOOTER_ALIGNMENT_REPORT.md` | `docs/archive/root-reports/` | Fix applied |
| `MARKETING_PAGES_ALIGNMENT_COMPLETE.md` | `docs/archive/root-reports/` | Fix applied |
| `HYDRATION_FIX_REPORT.md` | `docs/archive/root-reports/` | Fix applied |
| `EMAIL_DASHBOARD_BUG_FIX.md` | `docs/archive/root-reports/` | Fix applied |
| `ANALYTICS_BUG_FIXES.md` | `docs/archive/root-reports/` | Fix applied |
| `ELEGANT_LOADING_COMPONENT.md` | `docs/archive/root-reports/` | Implementation complete |
| `ADMIN_LANDING_BUILDER_COMPLETE.md` | `docs/archive/root-reports/` | Superseded |
| `FILE_CHANGES_SUMMARY.md` | `docs/archive/root-reports/` | Superseded |
| `FILE_MANIFEST.md` | `docs/archive/root-reports/` | Superseded |
| `IMPLEMENTATION_NOTES.md` | `docs/archive/root-reports/` | Superseded |
| `START_HERE.md` | `docs/archive/root-reports/` | Superseded |
| `RECHARTS_BEFORE_AFTER.md` | `docs/archive/root-reports/` | Superseded |
| `RECHARTS_DOCUMENTATION_INDEX.md` | `docs/archive/root-reports/` | Superseded |
| `README_RECHARTS.md` | `docs/archive/root-reports/` | Superseded |
| `payment-ai-browser-verification-report.md` | `docs/archive/root-reports/` | Superseded by individual reports |
| `B3_IMPLEMENTATION_RULES.md` | `docs/archive/sprint-docs/` | Sprint B3 complete |
| `B3_REVIEW_CHECKLIST.md` | `docs/archive/sprint-docs/` | Sprint B3 complete |
| `SETUP_SUMMARY.md` | `docs/archive/root-reports/` | Historical |
| `TRANSLATION_UPDATE_FAQ_SUBSCRIPTIONS_COMPLETE.md` | `docs/archive/root-reports/` | Translation applied |

### docs/ loose files to archive

| Source | Archive Location | Reason |
|--------|-----------------|--------|
| `docs/ADMIN-AI-01-Final-Report.md` | `docs/archive/sprint-reports/` | Sprint complete |
| `docs/ADMIN-AI-01-Testing.md` | `docs/archive/sprint-reports/` | Sprint complete |
| `docs/ADMIN-MONITOR-01-Final-Report.md` | `docs/archive/sprint-reports/` | Sprint complete |
| `docs/ADMIN-MONITOR-01-Testing.md` | `docs/archive/sprint-reports/` | Sprint complete |
| `docs/ADMIN-REPORT-01-Final-Report.md` | `docs/archive/sprint-reports/` | Sprint complete |
| `docs/ADMIN-REPORT-01-Testing.md` | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/WEB-*-Final-Report.md` (8 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/WEB-*-Testing.md` (8 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/AI-*-Final-Report.md` (7 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/AI-*-Testing.md` (7 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/SEC-01-*.md` (16 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/SCALE-01-*.md` (18 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/AUTO-01-*.md` (12 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/BETA-01-*.md` (13 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/AUTH-03-*.md` (6 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/AUTH-04-*.md` (6 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/EMAIL-01-*.md` (5 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/EMAIL-02-*.md` (5 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/BUS-*.md` (8 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/CORE-*.md` (6 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/DEVOPS-01-*.md` (2 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/UI-01-*.md` (11 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/RC-01-*.md` (16 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/GA-01-*.md` (16 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/OBS-01-*.md` (16 files) | `docs/archive/sprint-reports/` | Sprint complete |
| All `docs/OPS-01-*.md` (16 files) | `docs/archive/sprint-reports/` | Sprint complete |
| `docs/POST-GA-01-Hypercare.md` | `docs/archive/sprint-reports/` | Sprint complete |
| `docs/ANALYTICS-02-ProductIntelligence.md` | `docs/archive/sprint-reports/` | Sprint complete |
| `docs/AuthenticationAudit.md` | `docs/archive/sprint-reports/` | Superseded by modules |
| `docs/admin-panel-audit.md` | `docs/archive/sprint-reports/` | Superseded by modules |
| `docs/Api401Report.md` | `docs/archive/sprint-reports/` | Superseded |
| `docs/ClientAudit.md` | `docs/archive/sprint-reports/` | Superseded |
| `docs/CookieAudit.md` | `docs/archive/sprint-reports/` | Superseded |
| `docs/MiddlewareAudit.md` | `docs/archive/sprint-reports/` | Superseded |
| `docs/SessionAudit.md` | `docs/archive/sprint-reports/` | Superseded |
| `docs/SynchronizationAudit.md` | `docs/archive/sprint-reports/` | Superseded |
| `docs/admin-authentication.md` | `docs/archive/sprint-reports/` | Superseded |
| `docs/PROJECT_AUDIT.md` | `docs/archive/sprint-reports/` | Historical |
| `docs/ARCHITECTURE_COMPLIANCE_REPORT.md` | `docs/archive/sprint-reports/` | Historical |
| `docs/RegressionReport.md` | `docs/archive/sprint-reports/` | Historical |
| `docs/CLEANUP-01-RemovedModules.md` | `docs/archive/sprint-reports/` | Historical |
| `docs/SPRINT_BACKLOG.md` | `docs/archive/sprint-docs/` | Historical |
| `docs/SPRINT_02_SUMMARY.md` | `docs/archive/sprint-docs/` | Historical |
| `docs/SPRINT07_REVIEW.md` | `docs/archive/sprint-docs/` | Historical |
| `docs/sprint-3.6-plan.md` | `docs/archive/sprint-docs/` | Historical |
| `docs/report-sprint1.5-2.md` | `docs/archive/sprint-docs/` | Historical |
| `docs/report-sprint2.5-3.md` | `docs/archive/sprint-docs/` | Historical |
| `docs/api/` (12 files) | `docs/archive/sprint-reports/` | Superseded by modules |
| `docs/auth/` (47 files) | `docs/archive/sprint-reports/` | Superseded by modules |
| `docs/database/` (23 files) | `docs/archive/sprint-reports/` | Superseded |
| `docs/e2e/` (17 files) | `docs/archive/sprint-reports/` | Superseded |
| `docs/PROD-01/` (17 files) | `docs/archive/sprint-reports/` | Historical |
| `docs/sprints/` (100 files) | `docs/archive/sprint-reports/` | Historical sprints |

---

## 5. DELETE DUPLICATION

| File | Reason |
|------|--------|
| ` currency-runtime-report.md` (root, leading space) | Exact duplicate of `currency-runtime-report.md` |
| `TRANSLATION_UPDATE_FAQ_SUBSCRIPTIONS.md` (root) | Superseded by `_COMPLETE` version |
| `docs/README_INTEGRATION_SUMMARY.txt` | Superseded by markdown equivalent |
| `docs/00_META/README.txt` | Superseded by markdown equivalent |

---

## 6. UPDATE LINKS

After all file movements, update internal references in:

- `docs/README.md` — Documentation portal links
- `docs/INDEX.md` — Master index links
- `docs/UNIFIED_GLOSSARY.md` — Cross-references
- `docs/TRACEABILITY_MATRIX.md` — Traceability links
- `docs/DOCUMENTATION_NAVIGATION.md` — Navigation starting points
- `docs/CROSS_REFERENCE_GUIDE.md` — Cross-reference rules
- `docs/DOCUMENTATION_SEARCH_GUIDE.md` — Search paths
- `docs/DEVELOPER/GETTING_STARTED.md` — Developer onboarding links
- `docs/DEVELOPER/FIRST_30_MINUTES.md` — Quick start links
- `docs/DEVELOPER/PROJECT_STRUCTURE.md` — Project structure links
- All `docs/00_META/DOCUMENTATION_*.md` — Meta documentation links

---

## Execution Order

1. Create target directories (`docs/modules/*`, `docs/archive/*`)
2. MOVE module documentation to `docs/modules/{module}/`
3. MERGE duplicate files
4. ARCHIVE historical/sprint files
5. DELETE confirmed duplicates
6. MOVE remaining root files to organized locations
7. UPDATE all internal links
8. Remove empty directories (`docs/05_FRONTEND/` through `docs/13_GUIDES/`, `docs/ASSETS/`)
9. Verify no files lost
10. Update `docs/README.md` and `docs/INDEX.md`

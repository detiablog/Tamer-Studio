# Root Folder Cleanup Plan

Generated: 2026-08-02
Purpose: Plan for relocating all 150 root-level Markdown files
Status: PLANNING ONLY — No file movement yet

---

## Current State

The project root contains **150 Markdown files** that should not be there.

Per documentation policy: **No Markdown files in root** (except `README.md`).

---

## Root Files by Category

### Category 1: Project README (KEEP)

| File | Action | Notes |
|------|--------|-------|
| `README.md` | KEEP | Project overview; update links to point to `docs/` |

---

### Category 2: Module Documentation → docs/modules/{module}/ (65 files)

#### Auth Module (3 files)
| File | Target | Notes |
|------|--------|-------|
| `authentication-audit-report.md` | `docs/modules/auth/audit-report.md` | Merge with existing audit |
| `authentication-live-report.md` | `docs/modules/auth/live-report.md` | Live verification |
| `authorization-report.md` | `docs/modules/auth/authorization-report.md` | Authorization centralization |

#### CMS Module (16 files)
| File | Target | Notes |
|------|--------|-------|
| `CMS_ARCHITECTURE_STANDARD.md` | `docs/modules/cms/architecture.md` | Architecture standard |
| `cms-api-report.md` | `docs/modules/cms/api-report.md` | API endpoints |
| `cms-audit-report.md` | `docs/modules/cms/audit-report.md` | Merge with audit-report.md |
| `cms-core-report.md` | `docs/modules/cms/core-report.md` | Core components |
| `cms-landing-homepage-verification-report.md` | `docs/modules/cms/landing-verification.md` | Landing verification |
| `cms-live-report.md` | `docs/modules/cms/live-report.md` | Live verification |
| `cms-localization-report.md` | `docs/modules/cms/localization.md` | Localization |
| `cms-navigation-report.md` | `docs/modules/cms/navigation.md` | Navigation |
| `component-library-report.md` | `docs/modules/cms/component-library.md` | Component library |
| `content-registry-report.md` | `docs/modules/cms/content-registry.md` | Content registry |
| `media-library-report.md` | `docs/modules/cms/media-library.md` | Media library |
| `media-live-report.md` | `docs/modules/cms/media-live.md` | Media verification |
| `page-management-report.md` | `docs/modules/cms/page-management.md` | Page management |
| `permission-report.md` | `docs/modules/cms/permissions.md` | Permissions |
| `publishing-pipeline-report.md` | `docs/modules/cms/publishing-pipeline.md` | Publishing |
| `section-management-report.md` | `docs/modules/cms/section-management.md` | Sections |
| `versioning-report.md` | `docs/modules/cms/versioning.md` | Versioning |

#### Navigation Module (11 files)
| File | Target | Notes |
|------|--------|-------|
| `breadcrumb-runtime-report.md` | `docs/modules/navigation/breadcrumb-runtime.md` | Breadcrumbs |
| `menu-management-report.md` | `docs/modules/navigation/menu-management.md` | Menu management |
| `navigation-api-report.md` | `docs/modules/navigation/api-report.md` | API |
| `navigation-audit-report.md` | `docs/modules/navigation/audit-report.md` | Audit |
| `navigation-cache-report.md` | `docs/modules/navigation/cache-report.md` | Cache |
| `navigation-live-report.md` | `docs/modules/navigation/live-report.md` | Live verification |
| `navigation-localization-report.md` | `docs/modules/navigation/localization.md` | Localization |
| `navigation-registry-report.md` | `docs/modules/navigation/registry-report.md` | Registry |
| `navigation-runtime-report.md` | `docs/modules/navigation/runtime-report.md` | Runtime |
| `navigation-seo-report.md` | `docs/modules/navigation/seo-report.md` | SEO |
| `permission-navigation-report.md` | `docs/modules/navigation/permission-navigation.md` | Permissions |

#### Localization Module (13 files)
| File | Target | Notes |
|------|--------|-------|
| `LOCALIZATION_ARCHITECTURE_STANDARD.md` | `docs/modules/localization/architecture.md` | Architecture |
| `application-localization-report.md` | `docs/modules/localization/application-report.md` | Application-level |
| `currency-runtime-report.md` | `docs/modules/localization/currency-runtime.md` | Currency |
| `formatting-report.md` | `docs/modules/localization/formatting.md` | Formatting |
| `locale-detection-report.md` | `docs/modules/localization/locale-detection.md` | Locale detection |
| `localization-audit-report.md` | `docs/modules/localization/audit.md` | Merge with LOCALIZATION_AUDIT |
| `localization-live-report.md` | `docs/modules/localization/live-report.md` | Live verification |
| `localization-remediation-report.md` | `docs/modules/localization/remediation.md` | Remediation |
| `localization-runtime-report.md` | `docs/modules/localization/runtime-report.md` | Runtime |
| `translation-cache-report.md` | `docs/modules/localization/translation-cache.md` | Cache |
| `translation-management-report.md` | `docs/modules/localization/translation-management.md` | Management |
| `translation-runtime-report.md` | `docs/modules/localization/translation-runtime.md` | Runtime |
| `translation-sync-report.md` | `docs/modules/localization/translation-sync.md` | Sync |
| `translation-validation-report.md` | `docs/modules/localization/translation-validation.md` | Validation |

#### AI Module (3 files)
| File | Target | Notes |
|------|--------|-------|
| `AI_ARCHITECTURE.md` | `docs/modules/ai/architecture.md` | Architecture |
| `AI_CONTEXT_MAPPING.md` | `docs/modules/ai/context-mapping.md` | Context mapping |
| `ai-live-report.md` | `docs/modules/ai/live-report.md` | Live verification |

#### SEO Module (2 files)
| File | Target | Notes |
|------|--------|-------|
| `seo-live-report.md` | `docs/modules/seo/live-report.md` | Live verification |
| `seo-remediation-report.md` | `docs/modules/seo/remediation.md` | Remediation |

#### Homepage Module (1 file)
| File | Target | Notes |
|------|--------|-------|
| `homepage-live-report.md` | `docs/modules/homepage/live-report.md` | Live verification |

#### Landing Module (6 files)
| File | Target | Notes |
|------|--------|-------|
| `ADMIN_LANDING_BUILDER_COMPLETE.md` | `docs/modules/landing/complete.md` | Completion summary |
| `ADMIN_LANDING_BUILDER_TESTING_GUIDE.md` | `docs/modules/landing/testing-guide.md` | Testing guide |
| `LANDING_PAGE_BUILDER_SETUP.md` | `docs/modules/landing/setup.md` | Setup guide |
| `LANDING_PAGE_COMPLETE_SUMMARY.md` | `docs/modules/landing/summary.md` | Summary |
| `LANDING_PAGE_DATABASE_INTEGRATION.md` | `docs/modules/landing/database-integration.md` | DB integration |
| `landing-builder-live-report.md` | `docs/modules/landing/live-report.md` | Live verification |

#### Dashboard Module (10 files)
| File | Target | Notes |
|------|--------|-------|
| `ADMIN_DASHBOARD_REDESIGN.md` | `docs/modules/dashboard/redesign.md` | Redesign guide |
| `dashboard-live-report.md` | `docs/modules/dashboard/live-report.md` | Live verification |
| `dashboard-remediation-report.md` | `docs/modules/dashboard/remediation.md` | Remediation |
| `DASHBOARD_REDESIGN_VISUAL_SUMMARY.md` | `docs/modules/dashboard/visual-summary.md` | Visual layout |
| `QUICK_START_RECHARTS.md` | `docs/modules/dashboard/recharts-quick-start.md` | Recharts quick start |
| `README_RECHARTS.md` | `docs/modules/dashboard/recharts-readme.md` | Recharts README |
| `RECHARTS_BEFORE_AFTER.md` | `docs/modules/dashboard/recharts-before-after.md` | Before/after |
| `RECHARTS_COMPLETE_SUMMARY.md` | `docs/modules/dashboard/recharts-summary.md` | Recharts summary |
| `RECHARTS_DASHBOARD_INTEGRATION.md` | `docs/modules/dashboard/recharts-integration.md` | Recharts integration |
| `RECHARTS_DOCUMENTATION_INDEX.md` | `docs/modules/dashboard/recharts-index.md` | Recharts index |
| `RECHARTS_INTEGRATION_GUIDE.md` | `docs/modules/dashboard/recharts-guide.md` | Recharts guide |
| `RECHARTS_INTEGRATION_SUMMARY.md` | `docs/modules/dashboard/recharts-integration-summary.md` | Recharts summary |
| `START_HERE.md` | `docs/modules/dashboard/start-here.md` | Start here |

#### Payment Module (2 files)
| File | Target | Notes |
|------|--------|-------|
| `payment-ai-browser-verification-report.md` | `docs/modules/payment/browser-verification.md` | Browser verification |
| `payment-live-report.md` | `docs/modules/payment/live-report.md` | Live verification |

#### Email Module (2 files)
| File | Target | Notes |
|------|--------|-------|
| `EMAIL_DASHBOARD_BUG_FIX.md` | `docs/modules/email/dashboard-bug-fix.md` | Bug fix |
| `email-provider-report.md` | `docs/modules/email/provider-report.md` | Providers |

#### Admin Module (4 files)
| File | Target | Notes |
|------|--------|-------|
| `ADMIN_PANEL_REPORT.md` | `docs/modules/admin/panel-report.md` | Panel audit |
| `admin-live-report.md` | `docs/modules/admin/live-report.md` | Live verification |
| `admin-remediation-report.md` | `docs/modules/admin/remediation.md` | Remediation |

#### Events Module (3 files)
| File | Target | Notes |
|------|--------|-------|
| `event-bus-report.md` | `docs/modules/events/bus-report.md` | Event bus |
| `event-remediation-report.md` | `docs/modules/events/remediation.md` | Remediation |
| `event-runtime-completion-report.md` | `docs/modules/events/runtime-report.md` | Runtime |

---

### Category 3: Infrastructure/Foundation Documentation → docs/modules/{module}/ (15 files)

| File | Target | Notes |
|------|--------|-------|
| `cache-report.md` | `docs/modules/cache/audit-report.md` | Cache audit |
| `configuration-report.md` | `docs/modules/foundation/config-report.md` | Configuration |
| `dependency-injection-report.md` | `docs/modules/foundation/di-report.md` | DI |
| `error-mapping-report.md` | `docs/modules/foundation/error-mapping.md` | Error mapping |
| `INFRASTRUCTURE_ARCHITECTURE_STANDARD.md` | `docs/modules/foundation/architecture.md` | Architecture |
| `infrastructure-audit-report.md` | `docs/modules/foundation/audit-report.md` | Audit |
| `logging-report.md` | `docs/modules/foundation/logging.md` | Logging |
| `middleware-report.md` | `docs/modules/middleware/standardization.md` | Middleware |
| `observability-report.md` | `docs/modules/observability/audit-report.md` | Observability |
| `queue-report.md` | `docs/modules/foundation/queue-report.md` | Job queue |
| `repository-live-report.md` | `docs/modules/foundation/repository-live.md` | Repository |
| `request-context-report.md` | `docs/modules/foundation/request-context.md` | Request context |
| `response-mapping-report.md` | `docs/modules/foundation/response-mapping.md` | Response mapping |
| `storage-provider-report.md` | `docs/modules/foundation/storage-report.md` | Storage |
| `validation-report.md` | `docs/modules/foundation/validation.md` | Validation |

---

### Category 4: Platform/Security Documentation → docs/modules/{module}/ (8 files)

| File | Target | Notes |
|------|--------|-------|
| `api-live-report.md` | `docs/modules/foundation/api-live.md` | API verification |
| `browser-live-report.md` | `docs/modules/foundation/browser-live.md` | Build verification |
| `database-live-report.md` | `docs/modules/foundation/database-live.md` | Database verification |
| `end-to-end-validation-report.md` | `docs/modules/foundation/e2e-validation.md` | E2E validation |
| `performance-smoke-report.md` | `docs/modules/foundation/performance.md` | Performance |
| `production-readiness-report.md` | `docs/modules/foundation/production-readiness.md` | Production readiness |
| `route-verification-report.md` | `docs/modules/foundation/route-verification.md` | Routes |
| `SECURITY_BASELINE_SPEC.md` | `docs/modules/security/baseline-spec.md` | Security baseline |

---

### Category 5: Audit Reports → docs/reports/ (5 files)

| File | Target | Notes |
|------|--------|-------|
| `ARCHITECTURE_AUDIT.md` | `docs/reports/architecture-audit.md` | Architecture audit |
| `application-layer-audit-report.md` | `docs/reports/application-layer-audit.md` | App layer audit |
| `authentication-audit-report.md` | `docs/reports/authentication-audit.md` | Auth audit |
| `VERIFICATION_CHECKLIST.md` | `docs/reports/verification-checklist.md` | Verification |
| `LOCALIZATION_AUDIT.md` | `docs/modules/localization/audit.md` | Localization audit |

---

### Category 6: Sprint Documentation → docs/sprint/ (4 files)

| File | Target | Notes |
|------|--------|-------|
| `SPRINT_BUS_LOCALIZATION_01_REPORT.md` | `docs/sprint/BUS-LOCALIZATION-01/report.md` | Sprint report |
| `SPRINT_CMS-01_B3_APPLICATION_LAYER_REFACTOR.md` | `docs/sprint/CMS-01/B3-spec.md` | Sprint spec |
| `SPRINT_CMS-01_MILESTONE_A_REPORT.md` | `docs/sprint/CMS-01/milestone-a-report.md` | Milestone report |
| `SPRINT_CMS-01_MILESTONE_A5_EXECUTION_PLAN.md` | `docs/sprint/CMS-01/milestone-a5-plan.md` | Execution plan |

---

### Category 7: Standards → docs/standards/ (2 files)

| File | Target | Notes |
|------|--------|-------|
| `APPLICATION_LAYER_STANDARD.md` | `docs/standards/application-layer.md` | App layer standard |
| `B3_IMPLEMENTATION_RULES.md` | `docs/standards/b3-rules.md` | Sprint B3 rules |

---

### Category 8: Guides → docs/developer/ (3 files)

| File | Target | Notes |
|------|--------|-------|
| `IMPLEMENTATION_GUIDE.md` | `docs/developer/implementation-guide.md` | Implementation |
| `INSTRUCTIONS.md` | `docs/developer/ai-instructions.md` | AI instructions |
| `PYTHON_SCRIPTS_REFERENCE.md` | `docs/developer/python-scripts.md` | Python scripts |

---

### Category 9: Fixes/Temporary → docs/archive/ (10 files)

| File | Target | Notes |
|------|--------|-------|
| `ANALYTICS_BUG_FIXES.md` | `docs/archive/root-reports/analytics-bug-fix.md` | Bug fix |
| `authentication-remediation-report.md` | `docs/archive/root-reports/auth-remediation.md` | Remediation |
| `authentication-repair-report.md` | `docs/archive/root-reports/auth-repair.md` | Repair |
| `ai-remediation-report.md` | `docs/archive/root-reports/ai-remediation.md` | Remediation |
| `architecture-cleanup-report.md` | `docs/archive/root-reports/arch-cleanup.md` | Cleanup |
| `COMPLETION_REPORT.md` | `docs/archive/root-reports/completion.md` | Completion |
| `ELEGANT_LOADING_COMPONENT.md` | `docs/archive/root-reports/loading-component.md` | Component |
| `FOOTER_DUPLICATE_FIX.md` | `docs/archive/root-reports/footer-fix.md` | Footer fix |
| `HEADER_FOOTER_ALIGNMENT_REPORT.md` | `docs/archive/root-reports/header-footer-alignment.md` | Alignment |
| `HYDRATION_FIX_REPORT.md` | `docs/archive/root-reports/hydration-fix.md` | Hydration fix |
| `MARKETING_PAGES_ALIGNMENT_COMPLETE.md` | `docs/archive/root-reports/marketing-alignment.md` | Marketing fix |
| `TRANSLATION_UPDATE_FAQ_SUBSCRIPTIONS.md` | DELETE | Superseded by _COMPLETE |
| `TRANSLATION_UPDATE_FAQ_SUBSCRIPTIONS_COMPLETE.md` | `docs/archive/root-reports/faq-translation.md` | Translation |
| `runtime-remediation-report.md` | `docs/archive/root-reports/runtime-remediation.md` | Remediation |

---

### Category 10: Status/Summary → docs/archive/ (8 files)

| File | Target | Notes |
|------|--------|-------|
| `ADMIN_LANDING_BUILDER_COMPLETE.md` | `docs/archive/root-reports/landing-builder-complete.md` | Superseded |
| `DASHBOARD_REDESIGN_VISUAL_SUMMARY.md` | `docs/archive/root-reports/dashboard-visual.md` | Superseded |
| `FILE_CHANGES_SUMMARY.md` | `docs/archive/root-reports/file-changes.md` | Superseded |
| `FILE_MANIFEST.md` | `docs/archive/root-reports/file-manifest.md` | Superseded |
| `FINAL_VERIFICATION.md` | `docs/archive/root-reports/final-verification.md` | Superseded |
| `IMPLEMENTATION_NOTES.md` | `docs/archive/root-reports/implementation-notes.md` | Superseded |
| `SETUP_COMPLETE.md` | `docs/archive/root-reports/setup-complete.md` | Superseded |
| `SETUP_SUMMARY.md` | `docs/archive/root-reports/setup-summary.md` | Superseded |
| `START_HERE.md` | `docs/archive/root-reports/start-here.md` | Superseded |
| `STATUS.md` | `docs/archive/root-reports/status.md` | Superseded |

---

### Category 11: Delete Duplicates (1 file)

| File | Reason |
|------|--------|
| ` currency-runtime-report.md` | Exact duplicate with leading space in filename |

---

## Summary

| Action | Count |
|--------|-------|
| KEEP (README.md) | 1 |
| MOVE to docs/modules/ | 110 |
| MOVE to docs/reports/ | 5 |
| MOVE to docs/sprint/ | 4 |
| MOVE to docs/standards/ | 2 |
| MOVE to docs/developer/ | 3 |
| MOVE to docs/archive/ | 24 |
| DELETE (duplicates) | 1 |
| **TOTAL** | **150** |

---

## Post-Cleanup Root Directory

After cleanup, the project root should contain only:

```
Tamer-Studio/
├── README.md                    # Project overview (only .md allowed)
├── .env                         # Environment config
├── .env.example                 # Environment template
├── .env.local                   # Local environment
├── .gitignore                   # Git ignore
├── .dockerignore                # Docker ignore
├── .editorconfig                # Editor config
├── components.json              # Component config
├── docker-compose.yml           # Docker compose
├── docker-compose.local.yml     # Local Docker compose
├── Dockerfile                   # Docker config
├── drizzle.config.ts            # Drizzle config
├── eslint.config.mjs            # ESLint config
├── next.config.ts               # Next.js config
├── package.json                 # Package config
├── pnpm-lock.yaml               # Lock file
├── pnpm-workspace.yaml          # Workspace config
├── postcss.config.mjs           # PostCSS config
├── production.env.example       # Production env template
├── tsconfig.json                # TypeScript config
├── vitest.config.ts             # Vitest config
├── src/                         # Source code
├── drizzle/                     # Database migrations
├── public/                      # Static assets
├── scripts/                     # Build scripts
├── locales/                     # Translation files
├── config/                      # App config
├── docs/                        # All documentation
├── .github/                     # GitHub workflows
├── .kilo/                       # Kilo config
└── .ai/                         # AI config
```

No other `.md` files should exist in root.

# Documentation Mapping

Generated: 2026-08-02
Purpose: Complete mapping of every major module to its documentation home

---

## Module Documentation Home

Each major module has exactly ONE documentation directory under `docs/modules/`.

Source code modules are defined in `src/core/`, `src/features/`, `src/modules/`, `src/components/`.

---

### Authentication

**Source**: `src/core/auth/`, `src/features/auth/`, `src/components/auth/`
**Documentation Home**: `docs/modules/auth/`

| Current File | Target Location |
|-------------|-----------------|
| `authentication-audit-report.md` (root) | `docs/modules/auth/audit-report.md` |
| `authentication-live-report.md` (root) | `docs/modules/auth/live-report.md` |
| `authorization-report.md` (root) | `docs/modules/auth/authorization-report.md` |
| `docs/auth/AuthenticationAudit.md` | `docs/modules/auth/system-audit.md` |
| `docs/auth/AdminAuthenticationAudit.md` | `docs/modules/auth/admin-audit.md` |
| `docs/auth/SessionArchitecture.md` | `docs/modules/auth/session-architecture.md` |
| `docs/auth/LoginFlow.md` | `docs/modules/auth/login-flow.md` |
| `docs/auth/RegisterFlow.md` | `docs/modules/auth/register-flow.md` |
| `ADR/ADR-001-authentication-architecture.md` | `docs/adr/` (keep in place) |
| `ADR/ADR-002-hybrid-admin-authentication.md` | `docs/adr/` (keep in place) |
| `ADR/ADR-005-better-auth-integration.md` | `docs/adr/` (keep in place) |
| `ADR/ADR-006-session-management.md` | `docs/adr/` (keep in place) |

---

### CMS (Content Management)

**Source**: `src/core/cms/`, `src/app/api/cms/`
**Documentation Home**: `docs/modules/cms/`

| Current File | Target Location |
|-------------|-----------------|
| `CMS_ARCHITECTURE_STANDARD.md` (root) | `docs/modules/cms/architecture.md` |
| `cms-api-report.md` (root) | `docs/modules/cms/api-report.md` |
| `cms-core-report.md` (root) | `docs/modules/cms/core-report.md` |
| `cms-live-report.md` (root) | `docs/modules/cms/live-report.md` |
| `cms-localization-report.md` (root) | `docs/modules/cms/localization.md` |
| `cms-navigation-report.md` (root) | `docs/modules/cms/navigation.md` |
| `component-library-report.md` (root) | `docs/modules/cms/component-library.md` |
| `content-registry-report.md` (root) | `docs/modules/cms/content-registry.md` |
| `media-library-report.md` (root) | `docs/modules/cms/media-library.md` |
| `media-live-report.md` (root) | `docs/modules/cms/media-live.md` |
| `page-management-report.md` (root) | `docs/modules/cms/page-management.md` |
| `permission-report.md` (root) | `docs/modules/cms/permissions.md` |
| `publishing-pipeline-report.md` (root) | `docs/modules/cms/publishing-pipeline.md` |
| `section-management-report.md` (root) | `docs/modules/cms/section-management.md` |
| `versioning-report.md` (root) | `docs/modules/cms/versioning.md` |
| `audit-report.md` + `cms-audit-report.md` (root) | `docs/modules/cms/audit-report.md` (merged) |

---

### Navigation

**Source**: `src/core/navigation/`
**Documentation Home**: `docs/modules/navigation/`

| Current File | Target Location |
|-------------|-----------------|
| `navigation-api-report.md` (root) | `docs/modules/navigation/api-report.md` |
| `navigation-audit-report.md` (root) | `docs/modules/navigation/audit-report.md` |
| `navigation-cache-report.md` (root) | `docs/modules/navigation/cache-report.md` |
| `navigation-live-report.md` (root) | `docs/modules/navigation/live-report.md` |
| `navigation-localization-report.md` (root) | `docs/modules/navigation/localization.md` |
| `navigation-registry-report.md` (root) | `docs/modules/navigation/registry-report.md` |
| `navigation-runtime-report.md` (root) | `docs/modules/navigation/runtime-report.md` |
| `navigation-seo-report.md` (root) | `docs/modules/navigation/seo-report.md` |
| `menu-management-report.md` (root) | `docs/modules/navigation/menu-management.md` |
| `breadcrumb-runtime-report.md` (root) | `docs/modules/navigation/breadcrumb-runtime.md` |
| `permission-navigation-report.md` (root) | `docs/modules/navigation/permission-navigation.md` |
| `ADR/ADR-013-Navigation & Information Architecture.md` | `docs/adr/` (keep in place) |

---

### Localization

**Source**: `src/core/localization/`, `src/lib/localization/`, `src/providers/localization/`
**Documentation Home**: `docs/modules/localization/`

| Current File | Target Location |
|-------------|-----------------|
| `LOCALIZATION_ARCHITECTURE_STANDARD.md` (root) | `docs/modules/localization/architecture.md` |
| `LOCALIZATION_AUDIT.md` (root) | `docs/modules/localization/audit.md` |
| `localization-live-report.md` (root) | `docs/modules/localization/live-report.md` |
| `localization-runtime-report.md` (root) | `docs/modules/localization/runtime-report.md` |
| `locale-detection-report.md` (root) | `docs/modules/localization/locale-detection.md` |
| `currency-runtime-report.md` (root) | `docs/modules/localization/currency-runtime.md` |
| `formatting-report.md` (root) | `docs/modules/localization/formatting.md` |
| `translation-cache-report.md` (root) | `docs/modules/localization/translation-cache.md` |
| `translation-management-report.md` (root) | `docs/modules/localization/translation-management.md` |
| `translation-runtime-report.md` (root) | `docs/modules/localization/translation-runtime.md` |
| `translation-sync-report.md` (root) | `docs/modules/localization/translation-sync.md` |
| `translation-validation-report.md` (root) | `docs/modules/localization/translation-validation.md` |
| `docs/LOCALIZATION/` (5 files) | `docs/modules/localization/` (merge) |

---

### AI

**Source**: `src/core/ai/`, `src/core/ai-gateway/`, `src/features/ai/`
**Documentation Home**: `docs/modules/ai/`

| Current File | Target Location |
|-------------|-----------------|
| `AI_ARCHITECTURE.md` (root) | `docs/modules/ai/architecture.md` |
| `AI_CONTEXT_MAPPING.md` (root) | `docs/modules/ai/context-mapping.md` |
| `ai-live-report.md` (root) | `docs/modules/ai/live-report.md` |
| `ai-runtime-architecture.md` (docs/) | `docs/modules/ai/runtime-architecture.md` |
| `docs/AI_ARCHITECTURE.md` | `docs/modules/ai/architecture.md` (merge) |
| `docs/AI_CONTEXT_MAPPING.md` | `docs/modules/ai/context-mapping.md` (merge) |
| `docs/REFERENCE/ai/` (3 files) | `docs/modules/ai/reference/` |

---

### SEO

**Source**: `src/core/seo/`
**Documentation Home**: `docs/modules/seo/`

| Current File | Target Location |
|-------------|-----------------|
| `seo-runtime-architecture.md` (root) | `docs/modules/seo/architecture.md` |
| `seo-live-report.md` (root) | `docs/modules/seo/live-report.md` |

---

### Homepage

**Source**: `src/core/homepage/`, `src/components/homepage/`
**Documentation Home**: `docs/modules/homepage/`

| Current File | Target Location |
|-------------|-----------------|
| `homepage-live-report.md` (root) | `docs/modules/homepage/live-report.md` |

---

### Landing Page

**Source**: `src/core/landing/`, `src/core/cms/landing-builder-runtime.ts`, `src/components/landing/`
**Documentation Home**: `docs/modules/landing/`

| Current File | Target Location |
|-------------|-----------------|
| `landing-builder-architecture.md` (root) | `docs/modules/landing/architecture.md` |
| `landing-builder-live-report.md` (root) | `docs/modules/landing/live-report.md` |
| `QUICK_START_GUIDE.md` (root) | `docs/modules/landing/quick-start.md` |
| `ADMIN_LANDING_BUILDER_TESTING_GUIDE.md` (root) | `docs/modules/landing/testing-guide.md` |

---

### Dashboard

**Source**: `src/app/(dashboard)/`, `src/components/dashboard/`
**Documentation Home**: `docs/modules/dashboard/`

| Current File | Target Location |
|-------------|-----------------|
| `ADMIN_DASHBOARD_REDESIGN.md` (root) | `docs/modules/dashboard/redesign.md` |
| `dashboard-live-report.md` (root) | `docs/modules/dashboard/live-report.md` |
| `QUICK_START_RECHARTS.md` (root) | `docs/modules/dashboard/recharts-quick-start.md` |
| `RECHARTS_INTEGRATION_GUIDE.md` (root) | `docs/modules/dashboard/recharts-guide.md` |
| `RECHARTS_DASHBOARD_INTEGRATION.md` (root) | `docs/modules/dashboard/recharts-integration.md` |
| `user-dashboard-architecture.md` (docs/) | `docs/modules/dashboard/architecture.md` |

---

### Payment

**Source**: `src/core/payment/`, `src/core/commerce/payment/`
**Documentation Home**: `docs/modules/payment/`

| Current File | Target Location |
|-------------|-----------------|
| `payment-live-report.md` (root) | `docs/modules/payment/live-report.md` |

---

### Email

**Source**: `src/modules/email/`, `src/core/email/`
**Documentation Home**: `docs/modules/email/`

| Current File | Target Location |
|-------------|-----------------|
| `email-provider-report.md` (root) | `docs/modules/email/provider-report.md` |

---

### Admin

**Source**: `src/core/admin/`, `src/app/admin/`, `src/components/admin/`
**Documentation Home**: `docs/modules/admin/`

| Current File | Target Location |
|-------------|-----------------|
| `ADMIN_PANEL_REPORT.md` (root) | `docs/modules/admin/panel-report.md` |
| `admin-live-report.md` (root) | `docs/modules/admin/live-report.md` |

---

### Events

**Source**: `src/core/events/`
**Documentation Home**: `docs/modules/events/`

| Current File | Target Location |
|-------------|-----------------|
| `event-bus-report.md` (root) | `docs/modules/events/bus-report.md` |
| `event-runtime-completion-report.md` (root) | `docs/modules/events/runtime-report.md` |

---

### Cache

**Source**: `src/core/cache/`
**Documentation Home**: `docs/modules/cache/`

| Current File | Target Location |
|-------------|-----------------|
| `cache-report.md` (root) | `docs/modules/cache/audit-report.md` |

---

### Middleware

**Source**: `src/core/middleware/`
**Documentation Home**: `docs/modules/middleware/`

| Current File | Target Location |
|-------------|-----------------|
| `middleware-report.md` (root) | `docs/modules/middleware/standardization-report.md` |

---

### Observability

**Source**: `src/core/observability/`
**Documentation Home**: `docs/modules/observability/`

| Current File | Target Location |
|-------------|-----------------|
| `observability-report.md` (root) | `docs/modules/observability/audit-report.md` |

---

### Scaling

**Source**: `src/core/scaling/`
**Documentation Home**: `docs/modules/scaling/`

| Current File | Target Location |
|-------------|-----------------|
| `SCALE-01-Architecture.md` (docs/) | `docs/modules/scaling/architecture.md` |

---

### Security

**Source**: `src/core/security/`, `src/core/security-hub/`
**Documentation Home**: `docs/modules/security/`

| Current File | Target Location |
|-------------|-----------------|
| `SEC-01-Architecture.md` (docs/) | `docs/modules/security/architecture.md` |
| `SECURITY_BASELINE_SPEC.md` (root) | `docs/modules/security/baseline-spec.md` |

---

### Automation

**Source**: `src/core/automation/`
**Documentation Home**: `docs/modules/automation/`

| Current File | Target Location |
|-------------|-----------------|
| `AUTO-01-Architecture.md` (docs/) | `docs/modules/automation/architecture.md` |

---

### Orchestrator

**Source**: `src/core/orchestrator/`
**Documentation Home**: `docs/modules/orchestrator/`

| Current File | Target Location |
|-------------|-----------------|
| `AI-ORCHESTRATOR-01-Architecture.md` (docs/) | `docs/modules/orchestrator/architecture.md` |

---

### Quality Assurance

**Source**: `src/core/quality-assurance/`
**Documentation Home**: `docs/modules/quality-assurance/`

| Current File | Target Location |
|-------------|-----------------|
| `AI-QA-01-Architecture.md` (docs/) | `docs/modules/quality-assurance/architecture.md` |

---

### Publishing

**Source**: `src/core/publishing/`
**Documentation Home**: `docs/modules/publishing/`

| Current File | Target Location |
|-------------|-----------------|
| `WEB-PUBLISH-01-Final-Report.md` (docs/) | `docs/modules/publishing/final-report.md` |

---

### Commerce

**Source**: `src/core/commerce/`
**Documentation Home**: `docs/modules/commerce/`

| Current File | Target Location |
|-------------|-----------------|
| `BUS-PAYMENT-01-Final-Report.md` (docs/) | `docs/modules/commerce/payment-report.md` |
| `BUS-PRICING-01-Final-Report.md` (docs/) | `docs/modules/commerce/pricing-report.md` |
| `BUS-CAMPAIGN-01-Final-Report.md` (docs/) | `docs/modules/commerce/campaign-report.md` |

---

### Foundation

**Source**: `src/core/foundation/`
**Documentation Home**: `docs/modules/foundation/`

| Current File | Target Location |
|-------------|-----------------|
| `dependency-injection-report.md` (root) | `docs/modules/foundation/di-report.md` |
| `configuration-report.md` (root) | `docs/modules/foundation/config-report.md` |
| `storage-provider-report.md` (root) | `docs/modules/foundation/storage-report.md` |
| `request-context-report.md` (root) | `docs/modules/foundation/request-context.md` |

---

### Storage

**Source**: `src/core/storage/`, `src/core/assets/`
**Documentation Home**: `docs/modules/storage/`

| Current File | Target Location |
|-------------|-----------------|
| `WEB-STORAGE-01-Final-Report.md` (docs/) | `docs/modules/storage/final-report.md` |

---

### Users

**Source**: `src/core/users/`
**Documentation Home**: `docs/modules/users/`

| Current File | Target Location |
|-------------|-----------------|
| (no root-level user reports) | `docs/modules/users/README.md` (new) |

---

### Workspace

**Source**: `src/core/workspace/`, `src/features/workspace/`
**Documentation Home**: `docs/modules/workspace/`

| Current File | Target Location |
|-------------|-----------------|
| (no root-level workspace reports) | `docs/modules/workspace/README.md` (new) |

---

## Cross-Cutting Documentation

| Topic | Current Location | Target Location |
|-------|-----------------|-----------------|
| Architecture Overview | `docs/ARCHITECTURE_OVERVIEW.md` | `docs/architecture/overview.md` |
| Master Blueprint | `MASTER_ARCHITECTURE_BLUEPRINT.md` (root) | `docs/architecture/master-blueprint.md` |
| Database Architecture | `docs/database-architecture.md` | `docs/architecture/database-layer.md` |
| Application Layer Standard | `APPLICATION_LAYER_STANDARD.md` (root) | `docs/standards/application-layer.md` |
| Infrastructure Standard | `INFRASTRUCTURE_ARCHITECTURE_STANDARD.md` (root) | `docs/standards/infrastructure.md` |
| Error Playbook | `docs/ERROR_PLAYBOOK.md` | `docs/modules/foundation/error-playbook.md` |
| Engineering Playbook | `docs/ENGINEERING_PLAYBOOK.md` | `docs/standards/engineering-playbook.md` |
| Git Workflow | `docs/GIT_WORKFLOW.md` | `docs/standards/git-workflow.md` |
| Contributing | `docs/CONTRIBUTING.md` | `docs/developer/contributing.md` |
| Testing Guidelines | `docs/TESTING_GUIDELINES.md` | `docs/standards/testing-guidelines.md` |
| Release Policy | `docs/RELEASE_POLICY.md` | `docs/release/policy.md` |
| Support Policy | `docs/SUPPORT_POLICY.md` | `docs/deployment/support-policy.md` |
| Product Definition | `docs/PRODUCT.md` | `docs/01_PRODUCT/PRODUCT.md` |
| Brand DNA | `docs/BRAND_DNA.md` | `docs/01_PRODUCT/BRAND_DNA.md` |
| Roadmap | `docs/ROADMAP.md` | `docs/01_PRODUCT/ROADMAP.md` |
| Glossary | `docs/UNIFIED_GLOSSARY.md` | `docs/UNIFIED_GLOSSARY.md` (keep) |
| Traceability Matrix | `docs/TRACEABILITY_MATRIX.md` | `docs/TRACEABILITY_MATRIX.md` (keep) |
| Domain Dependency Map | `docs/DOMAIN_DEPENDENCY_MAP.md` | `docs/architecture/domain-dependency-map.md` |
| Domain Relationship Matrix | `docs/DOMAIN_RELATIONSHIP_MATRIX.md` | `docs/architecture/domain-relationship-matrix.md` |

---

## Module Count Summary

| Category | Module Count | Documentation Files to Create/Move |
|----------|-------------|-----------------------------------|
| Core Modules (src/core/) | 89 | ~89 README.md + reports |
| Feature Modules (src/features/) | 7 | Covered by core modules |
| Component Groups (src/components/) | 18 | Covered by core modules |
| Total Unique Documentation Homes | ~40 | ~200 files to organize |

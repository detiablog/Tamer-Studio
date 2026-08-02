# Tamer Studio Documentation

Welcome to the Tamer Studio documentation portal.

**Source code is always the Single Source of Truth.**

Documentation exists only to explain the implementation.

---

## Quick Links

| Section | Description |
|---------|-------------|
| [Architecture](#architecture) | System architecture and design decisions |
| [Modules](#modules) | Per-module documentation |
| [Standards](#standards) | Coding standards and conventions |
| [Sprint](#sprint) | Active sprint documentation |
| [Audit](#audit) | Documentation audit reports |
| [Verification](#verification) | E2E verification reports |
| [Reports](#reports) | Sprint and audit reports |
| [Deployment](#deployment) | Deployment and operations |
| [Release](#release) | Release notes and changelogs |
| [ADR](#adr) | Architecture Decision Records |
| [Archive](#archive) | Archived documentation |

---

## Architecture

System-wide architecture documentation.

| Document | Description |
|----------|-------------|
| [Architecture Overview](architecture/overview.md) | High-level architecture overview |
| [Master Blueprint](architecture/master-blueprint.md) | Target architecture blueprint |
| [AI Layer](architecture/ai-layer.md) | AI architecture |
| [Backend Layer](architecture/backend-layer.md) | Backend architecture |
| [Frontend Layer](architecture/frontend-layer.md) | Frontend architecture |
| [Database Layer](architecture/database-layer.md) | Database architecture |
| [Infrastructure Layer](architecture/infrastructure-layer.md) | Infrastructure architecture |
| [Security Layer](architecture/security-layer.md) | Security architecture |
| [Domain Dependency Map](architecture/domain-dependency-map.md) | Module dependencies |
| [Domain Relationship Matrix](architecture/domain-relationship-matrix.md) | Cross-domain relationships |

---

## Modules

Each module has exactly one documentation home.

| Module | Documentation | Source Code |
|--------|--------------|-------------|
| [Admin](modules/admin/README.md) | Admin panel | `src/core/admin/` |
| [AI](modules/ai/README.md) | AI platform | `src/core/ai/` |
| [Analytics](modules/analytics/README.md) | Analytics engine | `src/core/analytics/` |
| [Auth](modules/auth/README.md) | Authentication | `src/core/auth/` |
| [Automation](modules/automation/README.md) | Automation center | `src/core/automation/` |
| [Billing](modules/billing/README.md) | Billing engine | `src/core/billing/` |
| [Cache](modules/cache/README.md) | Cache layer | `src/core/cache/` |
| [CMS](modules/cms/README.md) | Content management | `src/core/cms/` |
| [Commerce](modules/commerce/README.md) | Commerce engine | `src/core/commerce/` |
| [Email](modules/email/README.md) | Email system | `src/modules/email/` |
| [Events](modules/events/README.md) | Event bus | `src/core/events/` |
| [Foundation](modules/foundation/README.md) | Foundation layer | `src/core/foundation/` |
| [Homepage](modules/homepage/README.md) | Homepage runtime | `src/core/homepage/` |
| [Landing](modules/landing/README.md) | Landing page | `src/core/landing/` |
| [Localization](modules/localization/README.md) | Localization | `src/core/localization/` |
| [Media](modules/media/README.md) | Media management | `src/core/media/` |
| [Middleware](modules/middleware/README.md) | Middleware layer | `src/core/middleware/` |
| [Navigation](modules/navigation/README.md) | Navigation system | `src/core/navigation/` |
| [Notifications](modules/notifications/README.md) | Notifications | `src/core/notifications/` |
| [Observability](modules/observability/README.md) | Observability | `src/core/observability/` |
| [Operations](modules/operations/README.md) | Operations center | `src/core/operations/` |
| [Orchestrator](modules/orchestrator/README.md) | AI orchestrator | `src/core/orchestrator/` |
| [Payment](modules/payment/README.md) | Payment system | `src/core/payment/` |
| [Pricing](modules/pricing/README.md) | Pricing engine | `src/core/pricing/` |
| [Publishing](modules/publishing/README.md) | Publishing hub | `src/core/publishing/` |
| [Quality Assurance](modules/quality-assurance/README.md) | QA system | `src/core/quality-assurance/` |
| [Scaling](modules/scaling/README.md) | Scalability | `src/core/scaling/` |
| [Security](modules/security/README.md) | Security hub | `src/core/security/` |
| [SEO](modules/seo/README.md) | SEO runtime | `src/core/seo/` |
| [Storage](modules/storage/README.md) | Storage engine | `src/core/storage/` |
| [Templates](modules/templates/README.md) | Template system | `src/core/templates/` |
| [Users](modules/users/README.md) | User management | `src/core/users/` |
| [Workspace](modules/workspace/README.md) | Workspace system | `src/core/workspace/` |

---

## Standards

Coding standards, conventions, and guidelines.

| Document | Description |
|----------|-------------|
| [Application Layer](standards/application-layer.md) | API route standards |
| [Infrastructure](standards/infrastructure.md) | Infrastructure standards |
| [API Guidelines](standards/api-guidelines.md) | API design guidelines |
| [Commit Convention](standards/commit-convention.md) | Git commit conventions |
| [Database Guidelines](standards/database-guidelines.md) | Database design guidelines |
| [Design Patterns](standards/design-patterns.md) | Design pattern catalog |
| [Engineering Playbook](standards/engineering-playbook.md) | Engineering playbook |
| [Git Workflow](standards/git-workflow.md) | Git workflow standards |
| [Testing Guidelines](standards/testing-guidelines.md) | Testing standards |

---

## Sprint

Active sprint documentation.

| Sprint | Documentation |
|--------|--------------|
| [Sprint README](sprint/README.md) | Active sprint overview |

---

## Audit

Documentation audit and validation reports.

| Document | Description |
|----------|-------------|
| [Documentation Inventory](audit/documentation-inventory.md) | Complete file inventory |
| [Documentation Validation](audit/documentation-validation.md) | Validation against source code |
| [Documentation Mapping](audit/documentation-mapping.md) | Module documentation mapping |
| [Documentation Cleanup Plan](audit/documentation-cleanup-plan.md) | Cleanup action plan |
| [Root Cleanup Plan](audit/root-cleanup-plan.md) | Root folder cleanup plan |

---

## Verification

E2E verification and test reports.

| Document | Description |
|----------|-------------|
| [Verification README](verification/README.md) | Verification overview |

---

## Reports

Sprint completion reports and audit findings.

| Document | Description |
|----------|-------------|
| [Reports README](reports/README.md) | Reports overview |

---

## Deployment

Deployment guides, runbooks, and checklists.

| Document | Description |
|----------|-------------|
| [Deployment README](deployment/README.md) | Deployment overview |
| [Support Policy](deployment/support-policy.md) | Support levels |

---

## Release

Release notes and changelogs.

| Document | Description |
|----------|-------------|
| [Release README](release/README.md) | Release overview |
| [Release Policy](release/policy.md) | Release versioning policy |

---

## ADR

Architecture Decision Records.

| Document | Description |
|----------|-------------|
| [ADR README](adr/README.md) | ADR index and list |
| [ADR-000](adr/ADR-000-architecture-principles.md) | Architecture principles |
| [ADR-001](adr/ADR-001-authentication-architecture.md) | Authentication architecture |
| [ADR-002](adr/ADR-002-hybrid-admin-authentication.md) | Hybrid admin authentication |
| [ADR-003](adr/ADR-003-routing-architecture.md) | Routing architecture |
| [ADR-004](adr/ADR-004-middleware-architecture.md) | Middleware architecture |
| [ADR-005](adr/ADR-005-better-auth-integration.md) | Better Auth integration |
| [ADR-006](adr/ADR-006-session-management.md) | Session management |
| [ADR-007](adr/ADR-007-platform-core.md) | Platform core |
| [ADR-008](adr/ADR-008-event-bus.md) | Event bus |
| [ADR-009](adr/ADR-009-security-standards.md) | Security standards |
| [ADR-010](adr/ADR-010-ai-gateway-strategy.md) | AI gateway strategy |
| [ADR-011](adr/ADR-011-ai-platform-core-architecture.md) | AI platform core |
| [ADR-012](adr/ADR-012-production-engineering-rules.md) | Production rules |
| [ADR-013](adr/ADR-013-Navigation & Information Architecture.md) | Navigation architecture |

---

## Archive

Archived documentation with historical value.

| Section | Description |
|---------|-------------|
| [Archive README](archive/README.md) | Archive overview |
| [Root Reports](archive/root-reports/) | Archived root-level reports |
| [Sprint Reports](archive/sprint-reports/) | Archived sprint reports |
| [Superseded](archive/superseded/) | Superseded documentation |

---

## Cross-Cutting

| Document | Description |
|----------|-------------|
| [Unified Glossary](UNIFIED_GLOSSARY.md) | Core terms definitions |
| [Traceability Matrix](TRACEABILITY_MATRIX.md) | Product to source traceability |
| [Product](01_PRODUCT/PRODUCT.md) | Product definition |
| [Brand DNA](01_PRODUCT/BRAND_DNA.md) | Brand identity |
| [Roadmap](01_PRODUCT/ROADMAP.md) | Product roadmap |

---

## Documentation Policy

All documentation must comply with [Documentation Policy](documentation-policy.md).

Key rules:
- Source code is the Single Source of Truth
- Documentation lives only in `/docs`
- Never create Markdown in root
- Update existing docs before creating new ones
- Archive obsolete docs, never delete
- One module = one documentation home
- Use lowercase-kebab-case filenames

---

## Contributing

See [Contributing Guide](developer/contributing.md) for documentation contribution workflow.

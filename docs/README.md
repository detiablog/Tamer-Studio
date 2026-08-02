# Tamer Studio Documentation

> **From Intent to Production.**

Welcome to the Tamer Studio documentation.

This portal organizes **product knowledge**, not file locations.

> **Source Code is the Single Source of Truth.**

Documentation exists to explain the implementation.

The root `README.md` defines project philosophy.

This document defines documentation navigation.

---

# Getting Started

Follow this order if you are new to the project.

1. **Project Overview** — What Tamer Studio is and why it exists
2. **Architecture** — How the platform is built
3. **Development Rules** — How contributors work
4. **Core Modules** — The major business capabilities
5. **Development Guides** — Standards, patterns, and conventions
6. **Current Sprint** — What is being worked on now

---

# Project

What Tamer Studio is.

| Topic | Location |
|-------|----------|
| Product Overview | Root [README.md](../README.md) |
| Brand Identity | [docs/PRODUCT.md](PRODUCT.md) |
| Product Roadmap | [docs/ROADMAP.md](ROADMAP.md) |

---

# Architecture

How the platform is built.

| Topic | Location |
|-------|----------|
| System Architecture | [docs/architecture/](architecture/) |
| Documentation Architecture | [docs/architecture/documentation-architecture.md](architecture/documentation-architecture.md) |
| Information Architecture | [docs/architecture/documentation-information-architecture.md](architecture/documentation-information-architecture.md) |
| Platform Architecture | [docs/PLATFORM/PLATFORM_ARCHITECTURE.md](PLATFORM/PLATFORM_ARCHITECTURE.md) |
| Platform Runtime | [docs/PLATFORM/PLATFORM_RUNTIME.md](PLATFORM/PLATFORM_RUNTIME.md) |
| Platform Dependency Map | [docs/PLATFORM/PLATFORM_DEPENDENCY_MAP.md](PLATFORM/PLATFORM_DEPENDENCY_MAP.md) |
| Database Architecture | [docs/PLATFORM/](PLATFORM/) |
| Event System | [docs/PLATFORM/EVENT_BUS.md](PLATFORM/EVENT_BUS.md) |
| Cache Strategy | [docs/PLATFORM/CACHE_STRATEGY.md](PLATFORM/CACHE_STRATEGY.md) |
| Feature Flags | [docs/PLATFORM/FEATURE_FLAGS.md](PLATFORM/FEATURE_FLAGS.md) |
| Module Registry | [docs/PLATFORM/MODULE_REGISTRY.md](PLATFORM/MODULE_REGISTRY.md) |
| Error Handling | [docs/PLATFORM/ERROR_HANDLING.md](PLATFORM/ERROR_HANDLING.md) |
| Health Checks | [docs/PLATFORM/HEALTH_CHECKS.md](PLATFORM/HEALTH_CHECKS.md) |
| Observability | [docs/PLATFORM/OBSERVABILITY.md](PLATFORM/OBSERVABILITY.md) |
| Scaling Strategy | [docs/PLATFORM/SCALING_STRATEGY.md](PLATFORM/SCALING_STRATEGY.md) |
| Security | [docs/PLATFORM/PLATFORM_SECURITY.md](PLATFORM/PLATFORM_SECURITY.md) |
| Plugin System | [docs/PLATFORM/PLUGIN_SYSTEM.md](PLATFORM/PLUGIN_SYSTEM.md) |

---

# Core Modules

The major business capabilities of Tamer Studio.

## Authentication

Login, registration, roles, permissions, sessions.

| Topic | Location |
|-------|----------|
| Authentication Architecture | [docs/ADR/ADR-001-authentication-architecture.md](ADR/ADR-001-authentication-architecture.md) |
| Better Auth Integration | [docs/ADR/ADR-005-better-auth-integration.md](ADR/ADR-005-better-auth-integration.md) |
| Hybrid Admin Authentication | [docs/ADR/ADR-002-hybrid-admin-authentication.md](ADR/ADR-002-hybrid-admin-authentication.md) |
| Session Management | [docs/ADR/ADR-006-session-management.md](ADR/ADR-006-session-management.md) |
| Auth Refactor Report | [docs/REPORTS/auth-refactor-report.md](REPORTS/auth-refactor-report.md) |

Source: `src/core/auth/`, `src/features/auth/`, `src/components/auth/`

---

## AI Studio

Image generation, video generation, workflows, providers, gateway.

| Topic | Location |
|-------|----------|
| AI Gateway Strategy | [docs/ADR/ADR-010-ai-gateway-strategy.md](ADR/ADR-010-ai-gateway-strategy.md) |
| AI Platform Core | [docs/ADR/ADR-011-ai-platform-core-architecture.md](ADR/ADR-011-ai-platform-core-architecture.md) |
| AI Runtime Report | [docs/REPORTS/ai-runtime-report.md](REPORTS/ai-runtime-report.md) |

Source: `src/core/ai/`, `src/core/ai-gateway/`, `src/features/ai/`

---

## CMS & Content

Content management, pages, sections, components, media, publishing.

| Topic | Location |
|-------|----------|
| Navigation Architecture | [docs/ADR/ADR-013-Navigation & Information Architecture.md](<ADR/ADR-013-Navigation & Information Architecture.md>) |

Source: `src/core/cms/`, `src/core/navigation/`, `src/core/seo/`, `src/core/publishing/`

---

## Landing & Homepage

Landing page builder, homepage composition, SEO.

| Topic | Location |
|-------|----------|
| Landing Builder Audit | [docs/REPORTS/landing-builder-audit-report.md](REPORTS/landing-builder-audit-report.md) |

Source: `src/core/landing/`, `src/core/homepage/`, `src/components/landing/`

---

## Administration

Admin dashboard, system configuration, monitoring, providers.

| Topic | Location |
|-------|----------|
| Admin Panel Specification | [docs/01_PRODUCT/ADMIN_PANEL_FEATURE_SPECIFICATION.md](01_PRODUCT/ADMIN_PANEL_FEATURE_SPECIFICATION.md) |

Source: `src/core/admin/`, `src/app/admin/`, `src/components/admin/`

---

## User Workspace

Projects, media, history, credits, subscription, settings.

Source: `src/core/workspace/`, `src/core/users/`, `src/features/workspace/`

---

## Billing & Commerce

Credits, subscriptions, payments, invoices, pricing.

Source: `src/core/billing/`, `src/core/commerce/`, `src/core/payment/`

---

## Localization

Languages, translations, currencies, regional settings.

| Topic | Location |
|-------|----------|
| Localization Docs | [docs/LOCALIZATION/](LOCALIZATION/) |

Source: `src/core/localization/`, `src/lib/localization/`, `src/providers/localization/`

---

# Development

Standards, patterns, and conventions for contributors.

| Topic | Location |
|-------|----------|
| Getting Started | [docs/DEVELOPER/GETTING_STARTED.md](DEVELOPER/GETTING_STARTED.md) |
| First 30 Minutes | [docs/DEVELOPER/FIRST_30_MINUTES.md](DEVELOPER/FIRST_30_MINUTES.md) |
| Project Structure | [docs/DEVELOPER/PROJECT_STRUCTURE.md](DEVELOPER/PROJECT_STRUCTURE.md) |
| Development Workflow | [docs/DEVELOPER/DEVELOPMENT_WORKFLOW.md](DEVELOPER/DEVELOPMENT_WORKFLOW.md) |
| Best Practices | [docs/DEVELOPER/BEST_PRACTICES.md](DEVELOPER/BEST_PRACTICES.md) |
| Common Mistakes | [docs/DEVELOPER/COMMON_MISTAKES.md](DEVELOPER/COMMON_MISTAKES.md) |
| Code Review Guide | [docs/DEVELOPER/CODE_REVIEW_GUIDE.md](DEVELOPER/CODE_REVIEW_GUIDE.md) |
| Contribution Guide | [docs/DEVELOPER/CONTRIBUTION_GUIDE.md](DEVELOPER/CONTRIBUTION_GUIDE.md) |
| Debugging Guide | [docs/DEVELOPER/DEBUGGING_GUIDE.md](DEVELOPER/DEBUGGING_GUIDE.md) |
| FAQ | [docs/DEVELOPER/FAQ.md](DEVELOPER/FAQ.md) |
| Troubleshooting | [docs/DEVELOPER/TROUBLESHOOTING.md](DEVELOPER/TROUBLESHOOTING.md) |
| New Module Tutorial | [docs/DEVELOPER/NEW_MODULE_TUTORIAL.md](DEVELOPER/NEW_MODULE_TUTORIAL.md) |
| Local Development | [docs/DEVELOPER/LOCAL_DEVELOPMENT.md](DEVELOPER/LOCAL_DEVELOPMENT.md) |
| Pull Request Guide | [docs/DEVELOPER/PULL_REQUEST_GUIDE.md](DEVELOPER/PULL_REQUEST_GUIDE.md) |
| Release Workflow | [docs/DEVELOPER/RELEASE_WORKFLOW.md](DEVELOPER/RELEASE_WORKFLOW.md) |
| Development Checklist | [docs/DEVELOPER/DEVELOPMENT_CHECKLIST.md](DEVELOPER/DEVELOPMENT_CHECKLIST.md) |
| Architecture Journey | [docs/DEVELOPER/ARCHITECTURE_JOURNEY.md](DEVELOPER/ARCHITECTURE_JOURNEY.md) |
| Developer Glossary | [docs/DEVELOPER/DEVELOPER_GLOSSARY.md](DEVELOPER/DEVELOPER_GLOSSARY.md) |

---

# Standards

Engineering standards and conventions.

| Topic | Location |
|-------|----------|
| API Guidelines | [docs/STANDARTS/API_GUIDELINES.md](STANDARTS/API_GUIDELINES.md) |
| Database Guidelines | [docs/STANDARTS/DATABASE_GUIDELINES.md](STANDARTS/DATABASE_GUIDELINES.md) |
| Design Patterns | [docs/STANDARTS/DESIGN_PATTERNS.md](STANDARTS/DESIGN_PATTERNS.md) |
| Commit Convention | [docs/STANDARTS/COMMIT_CONVENTION.md](STANDARTS/COMMIT_CONVENTION.md) |

---

# Quality

Quality assurance, performance, and security reviews.

| Topic | Location |
|-------|----------|
| Quality Reports | [docs/QUALITY/](QUALITY/) |
| Performance Review | [docs/QUALITY/performance-review.md](QUALITY/performance-review.md) |
| Security Review | [docs/QUALITY/security-review.md](QUALITY/security-review.md) |
| Release Readiness | [docs/QUALITY/release-readiness.md](QUALITY/release-readiness.md) |
| Technical Debt | [docs/QUALITY/technical-debt.md](QUALITY/technical-debt.md) |
| Repository Audit | [docs/QUALITY/repository-audit.md](QUALITY/repository-audit.md) |
| QA Report | [docs/QUALITY/qa-report.md](QUALITY/qa-report.md) |

---

# Active Development

Current engineering activities.

| Topic | Location |
|-------|----------|
| Sprint Reports | [docs/REPORTS/](REPORTS/) |
| Audit Reports | [docs/audit/](audit/) |
| Documentation Inventory | [docs/audit/documentation-inventory.md](audit/documentation-inventory.md) |
| Documentation Validation | [docs/audit/documentation-validation.md](audit/documentation-validation.md) |
| Documentation Cleanup Plan | [docs/audit/documentation-cleanup-plan.md](audit/documentation-cleanup-plan.md) |
| Root Cleanup Plan | [docs/audit/root-cleanup-plan.md](audit/root-cleanup-plan.md) |
| Architecture Review | [docs/audit/documentation-architecture-review.md](audit/documentation-architecture-review.md) |
| Architecture Recommendation | [docs/audit/documentation-architecture-recommendation.md](audit/documentation-architecture-recommendation.md) |

Only active work belongs here.

Historical documents are in the archive.

---

# Sprint History

Previous sprints and their documentation.

| Sprint | Location |
|--------|----------|
| CMS-01 B1 | [docs/sprints/CMS-01_B1/](sprints/CMS-01_B1/) |
| CMS-01 B2 | [docs/sprints/CMS-01_B2/](sprints/CMS-01_B2/) |
| CMS-01 B8 | [docs/sprints/CMS-01_B8/](sprints/CMS-01_B8/) |
| CMS-01 B9 | [docs/sprints/CMS-01_B9/](sprints/CMS-01_B9/) |
| CMS-01 B10 | [docs/sprints/CMS-01_B10/](sprints/CMS-01_B10/) |
| CMS-01 B11 | [docs/sprints/CMS-01_B11/](sprints/CMS-01_B11/) |
| Core Platform | [docs/sprints/core platform/](<sprints/core platform/>) |

---

# Architecture Decisions

Why important technical decisions were made.

| ADR | Topic |
|-----|-------|
| [ADR-000](ADR/ADR-000-architecture-principles.md) | Architecture Principles |
| [ADR-001](ADR/ADR-001-authentication-architecture.md) | Authentication Architecture |
| [ADR-002](ADR/ADR-002-hybrid-admin-authentication.md) | Hybrid Admin Authentication |
| [ADR-003](ADR/ADR-003-routing-architecture.md) | Routing Architecture |
| [ADR-004](ADR/ADR-004-middleware-architecture.md) | Middleware Architecture |
| [ADR-005](ADR/ADR-005-better-auth-integration.md) | Better Auth Integration |
| [ADR-006](ADR/ADR-006-session-management.md) | Session Management |
| [ADR-007](ADR/ADR-007-platform-core.md) | Platform Core |
| [ADR-008](ADR/ADR-008-event-bus.md) | Event Bus |
| [ADR-009](ADR/ADR-009-security-standards.md) | Security Standards |
| [ADR-010](ADR/ADR-010-ai-gateway-strategy.md) | AI Gateway Strategy |
| [ADR-011](ADR/ADR-011-ai-platform-core-architecture.md) | AI Platform Core |
| [ADR-012](ADR/ADR-012-production-engineering-rules.md) | Production Engineering Rules |
| [ADR-013](<ADR/ADR-013-Navigation & Information Architecture.md>) | Navigation Architecture |

Full list: [docs/ADR/README.md](ADR/README.md)

---

# Archive

Historical documentation that is no longer part of the active project.

| Topic | Location |
|-------|----------|
| Archive Index | [docs/99_ARCHIVE/](99_ARCHIVE/) |
| Archived Reports | [docs/99_ARCHIVE/Reports/](99_ARCHIVE/Reports/) |
| Legacy Architecture Blueprint | [docs/99_ARCHIVE/MASTER_ARCHITECTURE_BLUEPRINT_v1.md](99_ARCHIVE/MASTER_ARCHITECTURE_BLUEPRINT_v1.md) |

Archive is read-only.

Do not mix active documentation with historical reports.

---

# Documentation Rules

Every contributor must follow these rules.

| Rule | Description |
|------|-------------|
| Source Code First | Source code is the Single Source of Truth |
| Explain Implementation | Documentation explains what exists, not what should exist |
| No Root Markdown | Never create Markdown files in the project root |
| Update Before Create | Always update existing documentation first |
| Archive Before Delete | Never permanently delete documentation |
| One Module One Home | Each module has exactly one documentation location |
| No Duplication | Never duplicate content across files |
| Stay Synchronized | Keep documentation aligned with source code |

Full policy: [docs/documentation-policy.md](documentation-policy.md)

---

# Navigation

Three paths through the documentation.

## New Developer

```
Project README → Architecture → Core Modules → Development Rules → Current Sprint → Source Code
```

## Existing Developer

```
Current Sprint → Verification → Architecture Changes → Implementation
```

## AI Coding Assistant

```
Root README → docs/README → Architecture → Relevant Module → Source Code → Update Documentation
```

---

# Documentation Philosophy

The objective of this documentation is not to document every implementation detail.

The objective is to make Tamer Studio **understandable**, **maintainable**, and **scalable**.

Documentation should help developers and AI understand the product quickly without searching through hundreds of markdown files.

Fewer documents with higher quality.

Knowledge that is discoverable, not buried.

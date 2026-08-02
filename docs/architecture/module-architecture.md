# Module Architecture

**Date:** 2026-08-03
**Scope:** All business modules in `src/core/`, `src/modules/`, `src/features/`

---

## Module Inventory

### Tier 1 — Core Business Modules (High complexity, well-structured)

| Module | Location | Files | Responsibility |
|--------|----------|-------|----------------|
| `auth` | `core/auth/` | 10 | Authentication, sessions, TOTP, permissions, RBAC |
| `users` | `core/users/` | 4 | User CRUD, user types |
| `workspace` | `core/workspace/` | 4 | Workspace management, multi-tenancy |
| `billing` | `core/billing/` | 3 | Billing engine, plan management |
| `subscription` | `core/subscription/` | 3 | Subscription lifecycle, plan definitions |
| `payment` | `core/payment/` | 11 | Payment processing, Stripe/manual/iPaymu gateways |
| `commerce` | `core/commerce/` | 31 | E-commerce: checkout, orders, coupons, refunds, tax, vouchers |
| `credits` | `core/credits/` | 2 | Credit engine for AI usage |
| `cms` | `core/cms/` | 26 | Content management: pages, sections, blocks, components, versions |
| `landing` | `core/landing/` | 3 | Landing page service and repository |
| `templates` | `core/templates/` | 5 | Template system with rendering engine |
| `identity` | `core/identity/` | 3 | Identity service, auth provider integration |
| `admin` | `core/admin/` | 37 | Admin panel: dashboard, RBAC, settings, moderation, providers |

### Tier 2 — AI & Content Modules (Medium complexity)

| Module | Location | Files | Responsibility |
|--------|----------|-------|----------------|
| `ai` | `core/ai/` | 9 | AI runtime, prompt service, provider routing |
| `ai-gateway` | `core/ai-gateway/` | 8 | AI gateway: routing, queue, metrics, circuit breakers |
| `prompt-intelligence` | `core/prompt-intelligence/` | 11 | Prompt analysis, optimization, templates, testing |
| `creative-memory` | `core/creative-memory/` | 5 | Context building, learning, style engines |
| `drama-studio` | `core/drama-studio/` | 1 | Drama project management |
| `image-studio` | `core/image-studio/` | 1 | Image generation management |
| `video-studio` | `core/video-studio/` | 1 | Video generation management |
| `story-engine` | `core/story-engine/` | 1 | Story generation engine |
| `project-studio` | `core/project-studio/` | 1 | Project studio service |

### Tier 3 — Operations Modules (Infrastructure)

| Module | Location | Files | Responsibility |
|--------|----------|-------|----------------|
| `jobs` | `core/jobs/` | 10 | Job queue, dispatching, scheduling, cron, dead letter |
| `events` | `core/events/` | 14 | Event bus, pub/sub, subscribers |
| `cache` | `core/cache/` | 7 | Cache manager, memory/Redis implementations |
| `config` | `core/config/` | 5 | App configuration, env validation, feature flags |
| `errors` | `core/errors/` | 7 | Error hierarchy: auth, payment, AI, data errors |
| `foundation` | `core/foundation/` | 12 | DI container, lifecycle, registry, repository interface |
| `middleware` | `core/middleware/` | 10 | HTTP middleware: auth, CSRF, rate-limit, audit |
| `security` | `core/security/` | 10 | Security primitives: headers, CSRF, hashing, rate-limit |
| `monitoring` | `core/monitoring/` | 1 | Monitoring engine |
| `observability` | `core/observability/` | 15 | Logging, tracing, metrics, alerts, dashboards |

### Tier 4 — Feature Modules (Domain-specific)

| Module | Location | Files | Responsibility |
|--------|----------|-------|----------------|
| `analytics` | `core/analytics/` | 4 | Analytics engine, aggregation |
| `automation` | `core/automation/` | 7 | Rule engine, queue, scheduling, templates |
| `orchestrator` | `core/orchestrator/` | 8 | Task orchestration, pipeline building |
| `navigation` | `core/navigation/` | 14 | Navigation runtime, breadcrumbs, menus |
| `seo` | `core/seo/` | 15 | SEO runtime: metadata, sitemap, robots, OG |
| `localization` | `core/localization/` | 12 | i18n runtime, currency, formatting |
| `email` | `core/email/` | 3 | Email admin service |
| `notifications` | `core/notifications/` | 10 | Notification dispatch, channels |
| `media` | `core/media/` | 4 | Media management |
| `storage` | `core/storage/` | 1 | Storage engine |
| `publishing` | `core/publishing/` (via features) | 1 | Publishing workflow |
| `pricing` | `core/pricing/` | 5 | Pricing engine |
| `assets` | `core/assets/` | 7 | Asset management, S3/R2/local storage |
| `asset-intelligence` | `core/asset-intelligence/` | 12 | Asset classification, tagging, quality scoring |
| `audit` | `core/audit/` | 4 | Audit trail |
| `calendar` | `core/calendar/` | 1 | Calendar service |
| `campaign` | `core/campaign/` | 3 | Campaign management |
| `feedback` | `core/feedback/` | 4 | Feedback collection |
| `knowledge` | `core/knowledge/` | 4 | Knowledge base |
| `inbox` | `core/inbox/` | 4 | Internal messaging |
| `sla` | `core/sla/` | 4 | SLA management |
| `preferences` | `core/preferences/` | 4 | User preferences |

### Tier 5 — Thin/Single-File Modules (Potential consolidation candidates)

| Module | Files | Recommendation |
|--------|-------|----------------|
| `affiliate-studio` | 1 | Merge into `campaign/` or `commerce/` |
| `agent-platform` | 1 | Merge into `ai-gateway/` |
| `bi` | 1 | Merge into `analytics/` |
| `conversion-optimizer` | 1 | Merge into `analytics/` |
| `customer` | 4 | Keep — distinct domain |
| `drama-studio` | 1 | Merge into `core/` under creative studios |
| `hypercare` | 2 | Keep — distinct lifecycle phase |
| `image-studio` | 1 | Merge into creative studios group |
| `internal-notes` | 4 | Keep — distinct feature |
| `invoice` | 2 | Merge into `billing/` |
| `launch` | 7 | Keep — distinct lifecycle phase |
| `learning-engine` | 8 | Keep — substantial module |
| `push` | 3 | Merge into `notifications/` |
| `scaling` | 9 | Keep — substantial module |
| `security-hub` | 10 | Merge with `security/` or clarify boundary |
| `sms` | 3 | Merge into `notifications/` |
| `story-engine` | 1 | Merge into creative studios group |
| `trend-analyzer` | 1 | Merge into `analytics/` |
| `video-studio` | 1 | Merge into creative studios group |
| `workflow` | 2 | Merge into `orchestrator/` |

---

## Module Dependency Map

### Foundation Dependencies (used by most modules)
```
foundation/container.ts ← DI Container
foundation/registry.ts ← Service Registry
foundation/lifecycle.ts ← Lifecycle Management
foundation/bootstrap.ts ← App Bootstrap
foundation/repository.interface.ts ← Repository Pattern
```

### Cross-Module Dependencies (Critical)

| From | To | Nature |
|------|----|--------|
| `core/security-hub/` | `modules/email/email.encryption` | `generateId()` import |
| `core/workflow/` | `modules/email/email.encryption` | `generateId()` import |
| `core/storage/` | `modules/email/email.encryption` | `generateId()` import |
| `core/scaling/` | `modules/email/email.encryption` | `generateId()` import |
| `core/automation/` | `modules/email/email.encryption` | `generateId()` import |
| `core/analytics/` | `modules/email/email.encryption` | `generateId()` import |
| `core/payment/` | `modules/email/email.encryption` | `generateId()` import |
| `core/api-platform/` | `modules/email/email.encryption` | `generateId()` import |
| `core/operations/` | `modules/email/email.encryption` | `generateId()` import |
| `core/ai-gateway/` | `modules/email/email.encryption` | `generateId()` import |
| `core/observability/` | `modules/email/email.encryption` | `generateId()` import |
| `core/beta-program/` | `modules/email/email.encryption` | `generateId()` import |
| `core/asset-intelligence/` | `modules/email/email.encryption` | `generateId()` import |
| `core/prompt-intelligence/` | `modules/email/email.encryption` | `generateId()` import |
| `core/creative-memory/` | `modules/email/email.encryption` | `generateId()` import |
| `core/publishing/` | `modules/email/email.encryption` | `generateId()` import |
| `core/email/` | `modules/email/` | Service dependency |
| `core/email/` | `lib/email/templates` | Dynamic import |
| `lib/email/` | `modules/email/email.encryption` | Utility import |

**Critical Issue:** `generateId()` — a general-purpose ID generator — lives in `modules/email/email.encryption` but is imported by 100+ files across the codebase. This creates an artificial dependency where virtually every module depends on the email module.

---

## Module Boundary Violations

| Violation | Severity | Description |
|-----------|----------|-------------|
| `generateId` in email module | P0 | General utility misplaced in email domain |
| `core/mail/` vs `modules/email/` | P1 | Two overlapping mail abstractions |
| `core/email/` imports `modules/email/` | P1 | Core depends on module (inverted) |
| `core/email/` imports `lib/email/` | P1 | Cross-layer dependency |
| `lib/email/` imports `modules/email/` | P1 | Utility depends on domain module |
| `security-hub/` imports email encryption | P1 | Security depends on email for ID generation |
| `features/auth/` has full stack | P2 | Components + hooks + schemas + lib in features |

---

## Recommendations

### P0 — Critical
1. **Extract `generateId()` to `core/foundation/`** — Remove the email dependency from 100+ files
2. **Consolidate email implementations** — Single email module in `core/email/` or `modules/email/`

### P1 — High
3. **Merge thin modules** — Consolidate single-file modules into parent domains
4. **Clarify core vs modules boundary** — Decide: everything in `core/` or properly separated `modules/`
5. **Merge security-hub into security/** — Or clearly define monitoring vs primitives boundary

### P2 — Medium
6. **Consolidate features/** — Either use it consistently for all features or remove it
7. **Move creative studios** — Group `drama-studio`, `image-studio`, `video-studio`, `story-engine` under a shared creative domain

---

## Score

| Dimension | Score |
|-----------|-------|
| Module organization | 6/10 |
| Module boundaries | 4/10 |
| Module dependencies | 3/10 (due to generateId coupling) |
| Module ownership | 5/10 |
| **Overall** | **4.5/10** |

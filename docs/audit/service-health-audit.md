# Service Health Audit

**Date:** 2026-08-03
**Scope:** All services in `src/core/`, `src/modules/`, `src/features/`

---

## Service Inventory

### Well-Structured Services (Types + Service + Repository + Index)

| Service | Location | Files | Health |
|---------|----------|-------|--------|
| `users` | `core/users/` | 4 | Healthy |
| `workspace` | `core/workspace/` | 4 | Healthy |
| `templates` | `core/templates/` | 5 | Healthy |
| `identity` | `core/identity/` | 3 | Healthy |
| `subscription` | `core/subscription/` | 3 | Healthy |
| `payment` | `core/payment/` | 11 | Healthy |
| `landing` | `core/landing/` | 3 | Healthy |
| `media` | `core/media/` | 4 | Healthy |
| `audit` | `core/audit/` | 4 | Healthy |
| `preferences` | `core/preferences/` | 4 | Healthy |
| `tickets` | `core/tickets/` | 4 | Healthy |
| `feedback` | `core/feedback/` | 4 | Healthy |
| `inbox` | `core/inbox/` | 4 | Healthy |
| `knowledge` | `core/knowledge/` | 4 | Healthy |
| `customer` | `core/customer/` | 4 | Healthy |
| `attachments` | `core/attachments/` | 4 | Healthy |
| `sla` | `core/sla/` | 4 | Healthy |
| `apikey` | `core/apikey/` | 4 | Healthy |

### Large Services (Potential decomposition candidates)

| Service | Location | Files | Concern |
|---------|----------|-------|---------|
| `admin` | `core/admin/` | 37 | Very large — 7 sub-domains |
| `commerce` | `core/commerce/` | 31 | Very large — 8 sub-domains |
| `cms` | `core/cms/` | 26 | Large — repositories layer |
| `navigation` | `core/navigation/` | 14 | Large — many runtime files |
| `seo` | `core/seo/` | 15 | Large — many runtime files |
| `observability` | `core/observability/` | 15 | Large — many services |
| `events` | `core/events/` | 14 | Large — full event system |
| `localization` | `core/localization/` | 12 | Large — many runtime files |
| `notifications` | `core/notifications/` | 10 | Moderate — multiple channels |
| `security` | `core/security/` | 10 | Moderate — multiple mechanisms |
| `middleware` | `core/middleware/` | 10 | Moderate — many middleware types |
| `jobs` | `core/jobs/` | 10 | Moderate — full job system |
| `prompt-intelligence` | `core/prompt-intelligence/` | 11 | Large — many sub-services |
| `quality-assurance` | `core/quality-assurance/` | 12 | Large — many validators |
| `asset-intelligence` | `core/asset-intelligence/` | 12 | Large — many sub-services |
| `beta-program` | `core/beta-program/` | 11 | Large — many sub-services |
| `operations` | `core/operations/` | 11 | Large — many sub-services |
| `scaling` | `core/scaling/` | 9 | Moderate — many metrics |
| `learning-engine` | `core/learning-engine/` | 8 | Moderate — many engines |
| `orchestrator` | `core/orchestrator/` | 8 | Moderate — many services |
| `ai` | `core/ai/` | 9 | Moderate — runtime + services |
| `ai-gateway` | `core/ai-gateway/` | 8 | Moderate — many services |
| `automation` | `core/automation/` | 7 | Moderate — many engines |
| `foundation` | `core/foundation/` | 12 | Infrastructure — appropriate size |

### Single-File Services (Thin wrappers)

| Service | Location | Concern |
|---------|----------|---------|
| `bi` | `core/bi/bi-engine.ts` | Should merge into analytics |
| `calendar` | `core/calendar/calendar.service.ts` | Thin — may need more logic |
| `conversion-optimizer` | `core/conversion-optimizer/` | Should merge into analytics |
| `drama-studio` | `core/drama-studio/` | Thin — may need more logic |
| `image-studio` | `core/image-studio/` | Thin — may need more logic |
| `video-studio` | `core/video-studio/` | Thin — may need more logic |
| `story-engine` | `core/story-engine/` | Thin — may need more logic |
| `trend-analyzer` | `core/trend-analyzer/` | Thin — should merge into analytics |
| `monitoring` | `core/monitoring/monitoring-engine.ts` | Thin — should merge into observability |
| `storage` | `core/storage/storage-engine.ts` | Thin — may need more logic |

---

## Duplicate Services

| Duplicate A | Duplicate B | Overlap | Severity |
|-------------|-------------|---------|----------|
| `core/mail/mail.service.ts` | `modules/email/email.service.ts` | Mail abstraction vs email service | P0 |
| `core/email/email-admin.service.ts` | `modules/email/email.service.ts` | Admin CRUD vs email sending | P1 |
| `lib/email/queue.ts` | `modules/email/email.queue.ts` | Queue implementation | P0 |
| `lib/email/logs.ts` | `modules/email/email.queue.ts` | Log implementation | P0 |
| `lib/email/templates.ts` | `modules/email/email.template.ts` | Template system | P0 |
| `lib/email/smtp.ts` | `modules/email/providers/smtp.provider.ts` | SMTP transport | P1 |
| `lib/cache.ts` | `core/cache/memory-cache.ts` | In-memory cache | P1 |
| `core/security/rate-limit.ts` | `core/security/rate-limiter.ts` | In-memory rate limiting | P1 |
| `core/security/ratelimit.ts` | `core/security-hub/threat-detector.ts` | Rate limiting (Redis vs DB) | P2 |

---

## Business Logic Leakage

| Location | Leakage | Description |
|----------|---------|-------------|
| `app/api/` routes | Heavy logic | Some routes contain 100+ lines of business logic instead of delegating to services |
| `components/dashboard/` | Data fetching | Dashboard components fetch data directly instead of through hooks |
| `components/landing/` | Rendering logic | Landing components contain complex rendering logic that could be in core |
| `lib/localization/` | Runtime logic | Contains runtime translation logic that overlaps with `core/localization/` |

---

## Service Health Score

| Category | Count | Health |
|----------|-------|--------|
| Well-structured | 18 | Green |
| Large but functional | 18 | Amber |
| Thin/single-file | 10 | Red |
| Duplicate | 9 pairs | Red |
| **Overall** | **55 modules** | **Amber** |

### Score

| Dimension | Score |
|-----------|-------|
| Service structure | 6/10 |
| Service boundaries | 4/10 |
| Duplicate detection | 3/10 |
| Business logic placement | 5/10 |
| **Overall** | **4.5/10** |

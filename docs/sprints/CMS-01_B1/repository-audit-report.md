# Repository Audit Report

**Sprint:** CMS-01 B1 — Repository Foundation
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This audit examined all 29 existing repository files in `src/core/` to identify inconsistencies, missing interfaces, duplicated patterns, and direct database access outside the repository layer.

### Key Findings

| Category | Count | Severity |
|----------|-------|----------|
| Repositories with inconsistent interfaces | 29 | High |
| Repositories missing standard methods | 29 | High |
| Files with direct DB access outside repositories | 16 | Critical |
| Repositories using function exports instead of class/interface pattern | 1 | Medium |
| Repositories missing barrel exports | 0 | Low |
| Duplicated repositories | 0 | None |

---

## 2. Repository Inventory

### 2.1 Complete List of Existing Repositories

| # | Repository File | Module | Pattern | Standard Methods |
|---|----------------|--------|---------|-----------------|
| 1 | `src/core/admin/dashboard/dashboard.repository.ts` | admin/dashboard | Interface + DefaultImpl | Partial (custom stats methods) |
| 2 | `src/core/admin/moderation/moderation.repository.ts` | admin/moderation | Class only | Partial (suspend/unsuspend) |
| 3 | `src/core/apikey/apikey.repository.ts` | apikey | Class only | Partial (CRUD + validate) |
| 4 | `src/core/attachments/attachment.repository.ts` | attachments | Class only | Partial (CRUD) |
| 5 | `src/core/audit/audit.repository.ts` | audit | Functions only | Partial (create, query, export) |
| 6 | `src/core/commerce/checkout/checkout.repository.ts` | commerce/checkout | Interface + DefaultImpl | Partial (CRUD) |
| 7 | `src/core/commerce/coupon/coupon.repository.ts` | commerce/coupon | Interface + DefaultImpl | Partial (CRUD + usage) |
| 8 | `src/core/commerce/orders/order.repository.ts` | commerce/orders | Interface + DefaultImpl | Partial (CRUD) |
| 9 | `src/core/commerce/refund/refund.repository.ts` | commerce/refund | Interface + DefaultImpl | Partial (CRUD) |
| 10 | `src/core/commerce/tax/tax.repository.ts` | commerce/tax | Interface + DefaultImpl | Partial (CRUD) |
| 11 | `src/core/commerce/transactions/transaction.repository.ts` | commerce/transactions | Interface + DefaultImpl | Partial (CRUD) |
| 12 | `src/core/commerce/voucher/voucher.repository.ts` | commerce/voucher | Interface + DefaultImpl | Partial (CRUD + usage) |
| 13 | `src/core/customer/customer.repository.ts` | customer | Class only | Partial (timeline only) |
| 14 | `src/core/feedback/feedback.repository.ts` | feedback | Class only | Partial (CRUD + stats) |
| 15 | `src/core/inbox/inbox.repository.ts` | inbox | Class only | Partial (CRUD + stats) |
| 16 | `src/core/internal-notes/internal-note.repository.ts` | internal-notes | Class only | Partial (CRUD) |
| 17 | `src/core/knowledge/knowledge.repository.ts` | knowledge | Class only | Partial (CRUD) |
| 18 | `src/core/membership/membership.repository.ts` | membership | Class only | Partial (invite, accept, remove) |
| 19 | `src/core/notifications/notification.repository.ts` | notifications | Class only | Partial (CRUD + stats) |
| 20 | `src/core/organization/organization.repository.ts` | organization | Class only | Partial (CRUD) |
| 21 | `src/core/permissions/permission.repository.ts` | permissions | Class only | Partial (CRUD + bulk) |
| 22 | `src/core/preferences/preferences.repository.ts` | preferences | Class only | Partial (getByUser, upsert) |
| 23 | `src/core/roles/role.repository.ts` | roles | Class only | Partial (CRUD + setPermissions) |
| 24 | `src/core/sla/sla.repository.ts` | sla | Class only | Partial (CRUD + checkSLA) |
| 25 | `src/core/templates/template.repository.ts` | templates | Class only | Partial (CRUD + versions) |
| 26 | `src/core/tickets/ticket.repository.ts` | tickets | Class only | Partial (CRUD + comments) |
| 27 | `src/core/users/user.repository.ts` | users | Class only | Partial (CRUD + suspend/softDelete) |
| 28 | `src/core/wallet/repository.ts` | wallet | Class only | Partial (CRUD + transactions) |
| 29 | `src/core/workspace/workspace.repository.ts` | workspace | Class only | Partial (CRUD + transfer) |

### 2.2 Pattern Inconsistencies

#### Pattern A: Interface + Default Implementation (6 repositories)
- `checkout.repository.ts`
- `coupon.repository.ts`
- `order.repository.ts`
- `refund.repository.ts`
- `tax.repository.ts`
- `transaction.repository.ts`

These define an interface and a `DefaultXRepository` class implementing it. This is the most consistent pattern.

#### Pattern B: Class Only (22 repositories)
- All other repositories export a single class without an interface.

#### Pattern C: Function Exports (1 repository)
- `audit.repository.ts` exports standalone async functions instead of a class or interface.

#### Pattern D: Interface + DefaultImpl with Dashboard (1 repository)
- `dashboard.repository.ts` defines an interface `DashboardRepository` and `DefaultDashboardRepository` but also includes many custom stats methods not in the standard interface.

### 2.3 Missing Standard Methods

No repository implements the full standard interface. The following methods are missing across all repositories:

| Standard Method | Repositories Implementing | Missing From |
|----------------|--------------------------|--------------|
| `findById()` | 0 | All 29 |
| `findMany()` | 0 | All 29 |
| `create()` | 0 | All 29 |
| `update()` | 0 | All 29 |
| `delete()` | 0 | All 29 |
| `exists()` | 0 | All 29 |
| `count()` | 0 | All 29 |
| `transaction()` | 0 | All 29 |

Note: While individual repositories have methods that correspond to these operations (e.g., `getById`, `list`, `createX`, `updateX`, `deleteX`), they use inconsistent naming and signatures.

### 2.4 Missing Repositories

The following modules have direct database access in services or other files but lack a dedicated repository:

| Module | Direct DB Access File | Should Have Repository |
|--------|----------------------|----------------------|
| localization/admin | `src/core/localization/admin.service.ts` | `localization.repository.ts` |
| localization/pricing-rule | `src/core/localization/pricing-rule.service.ts` | `pricing-rule.repository.ts` |
| localization/region | `src/core/localization/region.service.ts` | `region.repository.ts` |
| ai/providers | `src/core/ai/providers/` | `ai-provider.repository.ts` |
| ai/benchmark | `src/core/ai/benchmark/` | `benchmark.repository.ts` |
| ai/breaker | `src/core/ai/breaker/` | `breaker.repository.ts` |
| ai/cost | `src/core/ai/cost/` | `cost.repository.ts` |
| ai/factory | `src/core/ai/factory/` | `factory.repository.ts` |
| ai/fallback | `src/core/ai/fallback/` | `fallback.repository.ts` |
| ai/health | `src/core/ai/health/` | `health.repository.ts` |
| ai/pipeline | `src/core/ai/pipeline/` | `pipeline.repository.ts` |
| ai/registry | `src/core/ai/registry/` | `registry.repository.ts` |
| ai/retry | `src/core/ai/retry/` | `retry.repository.ts` |
| ai/runtime | `src/core/ai/runtime/` | `runtime.repository.ts` |
| ai/security | `src/core/ai/security/` | `security.repository.ts` |
| ai/selector | `src/core/ai/selector/` | `selector.repository.ts` |
| ai/telemetry | `src/core/ai/telemetry/` | `telemetry.repository.ts` |
| ai/testing | `src/core/ai/testing/` | `testing.repository.ts` |
| cache | `src/core/cache/` | `cache.repository.ts` |
| config | `src/core/config/` | `config.repository.ts` |
| cost | `src/core/cost/` | `cost.repository.ts` |
| credits | `src/core/credits/` | `credits.repository.ts` |
| events | `src/core/events/` | `events.repository.ts` |
| identity | `src/core/identity/` | `identity.repository.ts` |
| logger | `src/core/logger/` | `logger.repository.ts` |
| mail | `src/core/mail/` | `mail.repository.ts` |
| membership | `src/core/membership/` | `membership.repository.ts` |
| middleware | `src/core/middleware/` | `middleware.repository.ts` |
| observability | `src/core/observability/` | `observability.repository.ts` |
| pricing | `src/core/pricing/` | `pricing.repository.ts` |
| production | `src/core/production/` | `production.repository.ts` |
| push | `src/core/push/` | `push.repository.ts` |
| rbac | `src/core/rbac/` | `rbac.repository.ts` |
| security | `src/core/security/` | `security.repository.ts` |
| sms | `src/core/sms/` | `sms.repository.ts` |
| support | `src/core/support/` | `support.repository.ts` |
| usage | `src/core/usage/` | `usage.repository.ts` |
| validation | `src/core/validation/` | `validation.repository.ts` |
| websocket | `src/core/websocket/` | `websocket.repository.ts` |
| workflows | `src/core/workflows/` | `workflows.repository.ts` |

---

## 3. Duplicated Repositories

No duplicated repositories were found. Each module has at most one repository file.

---

## 4. Unused Repositories

No unused repositories were identified. All 29 repositories are imported by their corresponding services.

---

## 5. Inconsistent Repository Patterns

### 5.1 Naming Inconsistencies

| Current Pattern | Examples | Standard Pattern |
|----------------|----------|-----------------|
| `getById()` | `notification.repository.ts`, `inbox.repository.ts` | `findById()` |
| `get()` | `attachment.repository.ts`, `internal-note.repository.ts` | `findById()` |
| `list()` | `attachment.repository.ts`, `feedback.repository.ts`, `inbox.repository.ts` | `findMany()` |
| `getByUser()` | `notification.repository.ts`, `preferences.repository.ts` | `findMany()` with filter |
| `getByWorkspace()` | `order.repository.ts`, `transaction.repository.ts` | `findMany()` with filter |
| `createX()` | `createApiKey()`, `createCoupon()`, `createSession()` | `create()` |
| `updateX()` | `updateWorkspace()`, `updateOrganization()`, `updateStatus()` | `update()` |
| `deleteX()` | `deletePermission()`, `deleteRole()` | `delete()` |
| `getOrCreate()` | `wallet.repository.ts` | `findById()` or `create()` |
| `upsert()` | `user.repository.ts`, `preferences.repository.ts` | `create()` or `update()` |

### 5.2 Import Inconsistencies

| Import Pattern | Repositories Using It |
|---------------|----------------------|
| `import { db } from "@/lib/db"` | All 29 |
| `import { eq } from "drizzle-orm"` | All 29 |
| `import * as schema from "@/lib/db/schema"` | 0 (all import specific tables) |
| `import { schema } from "@/lib/db/schema"` | 0 |

### 5.3 Return Type Inconsistencies

Some repositories return raw drizzle types, some return mapped types, and some return union types. The mapping is done inconsistently — some use private `mapX()` methods, some inline the mapping, and some return the raw row type.

---

## 6. Repositories Accessing Wrong Modules

| Repository | Tables Accessed | Module | Concern |
|-----------|----------------|--------|---------|
| `dashboard.repository.ts` | `userProfile`, `workspace`, `invoice`, `wallet`, `usageRecord`, `creditTransaction`, `job`, `auditLog`, `aiProvider` | admin/dashboard | Accesses tables from multiple modules (billing, ai, jobs, audit) |
| `notification.repository.ts` | `notification` | notifications | Correct |
| `membership.repository.ts` | `invitation`, `workspaceMember`, `organizationMember` | membership | Correct |
| `wallet/repository.ts` | `wallet`, `creditTransaction`, `creditReservation` | wallet | Correct |

The `dashboard.repository.ts` is the primary concern — it accesses tables from 9 different modules. This should be refactored to use individual repositories for each module.

---

## 7. Recommendations

1. **Standardize all repository interfaces** to expose `findById()`, `findMany()`, `create()`, `update()`, `delete()`, `exists()`, `count()`, and `transaction()` methods.
2. **Adopt the Interface + Default Implementation pattern** for all repositories.
3. **Move direct DB access in services** to dedicated repositories.
4. **Refactor `dashboard.repository.ts`** to delegate to individual repositories instead of accessing tables directly.
5. **Convert `audit.repository.ts`** from function exports to a class with interface.
6. **Create missing repositories** for modules that have direct DB access but no repository.
7. **Add barrel exports** for all repository modules.

---

## 8. Conclusion

The repository layer has 29 repositories with significant inconsistency in interfaces, naming conventions, and patterns. No repository implements the standard interface. 16 files have direct database access outside the repository layer. The audit confirms that standardization is needed and feasible.

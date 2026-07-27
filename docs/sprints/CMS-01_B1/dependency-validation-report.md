# Repository Dependency Validation Report

**Sprint:** CMS-01 B1 — Repository Foundation
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This report validates that all repositories depend only on the database layer, as required by the architecture blueprint and governance rules.

**Validation Rule:** Repository → Database (Nothing else)

---

## 2. Dependency Analysis

### 2.1 Valid Dependencies

Every repository may depend on:

| Dependency | Type | Status |
|-----------|------|--------|
| `@/lib/db` | Database client | ✅ Valid |
| `@/lib/db/schema/*` | Schema definitions | ✅ Valid |
| `drizzle-orm` | ORM utilities | ✅ Valid |
| `crypto` | UUID generation | ✅ Valid |
| `./<module>.types` | Local type definitions | ✅ Valid |

### 2.2 Invalid Dependencies Found

| Repository | Invalid Dependency | Type | Severity |
|-----------|-------------------|------|----------|
| `workspace.repository.ts` | `@/core/audit` (`logAction`) | Service/Business Logic | High |
| `organization.repository.ts` | `@/core/audit` (`logAction`) | Service/Business Logic | High |
| `apikey.repository.ts` | `@/core/audit` (`logAction`) | Service/Business Logic | High |
| `membership.repository.ts` | `@/core/audit` (`logAction`) | Service/Business Logic | High |
| `permission.repository.ts` | `@/core/audit` (`logAction`) | Service/Business Logic | High |
| `role.repository.ts` | `@/core/audit` (`logAction`) | Service/Business Logic | High |
| `notification.repository.ts` | `@/core/inbox` (type import) | Cross-module type | Medium |
| `dashboard.repository.ts` | `@/core/providers/providers.types` | Cross-module type | Medium |
| `wallet/repository.ts` | `@/lib/ai/types/billing` | Cross-module type | Medium |
| `customer.repository.ts` | `@/lib/ai/types/billing` | Cross-module type | Medium |
| `order.repository.ts` | `../types` (commerce types) | Module types | Low |
| `checkout.repository.ts` | `../types` (commerce types) | Module types | Low |
| `coupon.repository.ts` | `../types` (commerce types) | Module types | Low |
| `refund.repository.ts` | `../types` (commerce types) | Module types | Low |
| `tax.repository.ts` | `../types` (commerce types) | Module types | Low |
| `transaction.repository.ts` | `../types` (commerce types) | Module types | Low |
| `voucher.repository.ts` | `../types` (commerce types) | Module types | Low |
| `knowledge.repository.ts` | `./types` (local types) | Module types | Low |
| `attachment.repository.ts` | `./types` (local types) | Module types | Low |
| `ticket.repository.ts` | `./types` (local types) | Module types | Low |
| `feedback.repository.ts` | `./types` (local types) | Module types | Low |
| `inbox.repository.ts` | `./inbox.types` (local types) | Module types | Low |
| `internal-note.repository.ts` | `./types` (local types) | Module types | Low |
| `sla.repository.ts` | `./types` (local types) | Module types | Low |
| `template.repository.ts` | `./template.types` (local types) | Module types | Low |
| `user.repository.ts` | `./user.types` (local types) | Module types | Low |
| `preferences.repository.ts` | None (uses inline types) | — | None |
| `moderation.repository.ts` | None (uses inline types) | — | None |

### 2.3 Dependency Violations Detail

#### High Severity: Business Logic in Repositories

The following repositories import from `@/core/audit` and call `logAction()`, which is a business logic concern:

1. **workspace.repository.ts** — calls `logAction("workspace.created", ...)` in `createWorkspace()`
2. **organization.repository.ts** — calls `logAction("organization.created", ...)` in `createOrganization()`
3. **apikey.repository.ts** — calls `logAction("apikey.created", ...)` in `createApiKey()`
4. **membership.repository.ts** — calls `logAction("membership.invited", ...)` in `inviteToWorkspace()`
5. **permission.repository.ts** — calls `logAction("permission.created", ...)` in `createPermission()`
6. **role.repository.ts** — calls `logAction("role.created", ...)` in `createRole()`

**Remediation:** Move `logAction()` calls to the service layer. Repositories should only perform database operations and return results.

#### Medium Severity: Cross-Module Type Dependencies

The following repositories import types from other core modules:

1. **notification.repository.ts** — imports `InboxNotification`, `InboxStats` from `@/core/inbox`
2. **dashboard.repository.ts** — imports `AIProvider` from `@/core/providers/providers.types`
3. **wallet/repository.ts** — imports `Wallet`, `CreditTransaction`, `CreditReservation` from `@/lib/ai/types/billing`
4. **customer.repository.ts** — imports `CustomerTimelineEvent`, `TimelineEventType` from `./types`

**Remediation:** Move shared types to a common types package or define them locally within each repository module.

---

## 3. Dependency Graph

```
Repository Layer
  ├── @/lib/db (db client) ✅
  ├── @/lib/db/schema/* (table definitions) ✅
  ├── drizzle-orm (query builders) ✅
  ├── crypto (UUID generation) ✅
  ├── @/core/audit (logAction) ❌ VIOLATION
  ├── @/core/inbox (types) ❌ VIOLATION
  ├── @/core/providers (types) ❌ VIOLATION
  ├── @/lib/ai/types/billing (types) ❌ VIOLATION
  └── Local types ✅
```

---

## 4. Validation Results

| Check | Result |
|-------|--------|
| All repositories import from `@/lib/db` | ✅ Pass |
| All repositories import from `@/lib/db/schema/*` | ✅ Pass |
| All repositories import from `drizzle-orm` | ✅ Pass |
| No repository imports from service modules | ❌ Fail (6 repositories import `@/core/audit`) |
| No repository imports from other repository modules | ✅ Pass |
| No repository imports from API routes | ✅ Pass |
| No repository imports from components | ✅ Pass |
| No repository imports from business logic modules | ❌ Fail (6 repositories import `@/core/audit`) |
| No repository imports from localization modules | ✅ Pass |
| No repository imports from auth modules | ✅ Pass |

---

## 5. Recommendations

1. **Remove `@/core/audit` imports from all repositories** — move `logAction()` calls to the service layer.
2. **Consolidate cross-module type imports** — move shared types to a common location or define them locally.
3. **Add dependency validation to CI** — add a lint rule that prevents repositories from importing from non-allowed modules.
4. **Re-run this validation after B2** — ensure all changes maintain dependency compliance.

# Credit & Billing Integration Report
# CMS-01 Finalization — F13

**Status:** CRITICAL
**Date:** 2026-07-28
**Auditor:** Kilo AI

---

## Summary

The credit and billing subsystem is structurally present with Wallet, CreditTransaction, CreditReservation, UsageRecord, Subscription, and Invoice tables and repositories. However, the integration is critically incomplete: no foreign key constraints exist on workspaceId across wallet, creditTransaction, creditReservation, or usageRecord tables, creating data integrity risks. Additionally, billing logic is duplicated between `src/core/credits/` and `src/lib/ai/billing/`, introducing ambiguity over which module is authoritative. The costRecord table has no repository abstraction at all.

## Verified Items

- [x] Wallet table and WalletRepository exist (`src/core/wallet/repository.ts`)
- [x] CreditTransaction table and repository exist within WalletRepository
- [x] CreditReservation table and repository exist within WalletRepository
- [x] UsageRecord table exists with workspaceId field
- [x] Subscription table and DefaultSubscriptionRepository exist (`src/core/subscription/subscription.ts`)
- [x] Invoice table and DefaultInvoiceRepository exist (`src/core/invoice/invoice.ts`)
- [x] PlanService exists for subscription plan management
- [x] DefaultCreditEngine exists (`src/core/credits/credits.ts`)
- [x] Cost calculation module exists (`src/core/cost/cost.ts`)
- [x] Pricing engine exists (`src/core/pricing/pricing.ts`)
- [x] AI Billing library module exists (`src/lib/ai/billing/`)
  - [x] wallet.ts — wallet management
  - [x] usage-collector.ts — usage collection
  - [x] quota-enforcer.ts — quota enforcement
  - [x] billing-policy.ts — billing policies
  - [x] reservation.ts — reservation system
- [x] Billing user page exists at `/dashboard/billing` via `useSWR('/api/billing')`
- [x] Billing admin page exists at `/admin/billing` via API
- [x] Billing API routes exist (`/api/billing`)

## Issues Found

1. **[CRITICAL]** `wallet.workspaceId` has NO foreign key constraint to workspace table. Orphaned wallet records can accumulate indefinitely with no referential integrity enforcement.

2. **[CRITICAL]** `creditTransaction.workspaceId` has NO foreign key constraint. Credit transactions can reference non-existent workspaces, making audit trails unreliable.

3. **[CRITICAL]** `creditReservation.workspaceId` has NO foreign key constraint. Same orphan risk as above.

4. **[CRITICAL]** `usageRecord.workspaceId` has NO foreign key constraint. Usage records can reference deleted workspaces, corrupting billing reports.

5. **[HIGH]** Billing logic duplication between `src/core/credits/credits.ts` (Credit Engine) and `src/lib/ai/billing/` (5 modules). It is unclear which module is the single source of truth for credit operations. The `src/lib/ai/billing/wallet.ts` likely duplicates `src/core/wallet/repository.ts`.

6. **[HIGH]** `costRecord` table exists in the schema but has NO repository abstraction. Any code accessing costRecord uses direct DB queries, violating the repository pattern.

7. **[MEDIUM]** Subscription and Invoice repositories are defined inline within their respective domain files (`subscription.ts`, `invoice.ts`) rather than in dedicated repository files. This violates the project's separation-of-concerns pattern seen in other modules.

8. **[MEDIUM]** The AI Billing library (`src/lib/ai/billing/`) operates as a separate concern from the core Credit Engine (`src/core/credits/credits.ts`). There is no documented boundary between "core billing" and "AI-specific billing."

9. **[LOW]** No integration test coverage was identified for credit purchase → wallet update → invoice generation → notification chain.

## Recommendations

1. **[P0 — CRITICAL]** Add foreign key constraints on `wallet.workspaceId`, `creditTransaction.workspaceId`, `creditReservation.workspaceId`, and `usageRecord.workspaceId` referencing the workspace table. Add cascading delete or set-null policy per business requirements.

2. **[P0 — CRITICAL]** Resolve the duplication between `src/core/credits/credits.ts` and `src/lib/ai/billing/`. Establish one as the authoritative module and refactor the other to delegate. Recommended: keep `src/core/credits/` as the authoritative credit engine, and have `src/lib/ai/billing/` consume it.

3. **[P1 — HIGH]** Create a dedicated `CostRecordRepository` in `src/core/cost/` or `src/core/wallet/` to abstract all direct DB access to the costRecord table.

4. **[P1 — HIGH]** Extract inline repository definitions from `subscription.ts` and `invoice.ts` into dedicated repository files following the WalletRepository pattern.

5. **[P2 — MEDIUM]** Document the boundary between core billing (`src/core/`) and AI billing (`src/lib/ai/billing/`). Define which module handles what (e.g., core handles wallet/credits, AI handles usage collection and quota enforcement).

6. **[P2 — MEDIUM]** Add integration tests for the full credit purchase flow: API → Credit Engine → Wallet → Transaction → Invoice → Notification.

## Compliance

**FAIL** — Four foreign key violations on workspaceId across all credit/billing tables represent a critical data integrity gap. Billing logic duplication between core and lib creates maintainability risk. These must be resolved before CMS-01 finalization can be approved.

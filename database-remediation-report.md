# R2: Database Remediation Report — CMS-01.5 Production Readiness Remediation

**Status:** PASS
**Date:** 2026-07-28

---

## Summary of Findings

Database schema inspection revealed copy-paste bugs in column references, incorrect relation mappings, a type mismatch on a billing column, ambiguous re-exports, and widespread missing indexes. Additionally, 17 orphan tables and 39 missing foreign keys were documented for future cleanup.

---

## Changes Made

### 1. Schema Bug Fixes
- **`localization.ts`**: Fixed 4 `updatedAt` columns using wrong column name (copy-paste bug)
- **`jobs.ts`**: Fixed broken `jobRelations` — was mapping `job.id → user.id` incorrectly
- **`billing.ts`**: Changed `cancelAtPeriodEnd` from `text` to `boolean`
- **`identity.ts`**: Fixed ambiguous re-export of `user` that caused shadowing

### 2. Migration Created
Created `0032_schema_fixes.sql` containing:
- `cancelAtPeriodEnd` type conversion (`text → boolean`)
- 15 missing indexes added across performance-critical tables

### 3. Documentation of Outstanding Issues
- **17 orphan tables** identified: asset (7), billing-admin (1), feature-flags (2), workflows (2), and others
- **39 missing foreign keys** documented with source and target tables
- **7 missing ON DELETE behaviors** documented (RESTRICT, CASCADE, SET NULL recommendations)

---

## Remaining Issues

| Category | Count | Priority |
|---|---|---|
| Orphan tables | 17 | Medium — can be dropped after confirming no runtime usage |
| Missing foreign keys | 39 | High — data integrity risk |
| Missing ON DELETE behaviors | 7 | High — cascading deletes undefined |

---

## Recommendations

1. **Immediate**: Apply `0032_schema_fixes.sql` to all environments (dev, staging, prod).
2. **Short-term**: Add foreign keys for the 39 documented missing references, starting with billing and user-facing tables.
3. **Short-term**: Define ON DELETE behaviors for the 7 columns with undefined cascade rules.
4. **Medium-term**: Drop the 17 orphan tables after confirming no runtime code references them.
5. **Long-term**: Add a CI check (e.g., `drizzle-kit check`) that fails on missing indexes or undefined foreign keys.

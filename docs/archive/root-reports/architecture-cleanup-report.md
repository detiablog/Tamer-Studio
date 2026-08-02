# R1: Architecture Cleanup Report — CMS-01.5 Production Readiness Remediation

**Status:** PASS
**Date:** 2026-07-28

---

## Summary of Findings

The codebase accumulated significant dead code through iterative development, including duplicate module re-exports, abandoned AI/workflow subsystems, and orphan placeholder directories. This report documents the full cleanup performed to eliminate dead code paths, resolve import ambiguities, and establish clean module boundaries.

---

## Changes Made

### 1. Auth Module Consolidation
- Removed `src/lib/auth/` (6 files) — pure re-exports of `src/core/auth/`
- Moved `events.ts` from `lib/auth/` to `core/auth/`
- Updated 14 import sites from `@/lib/auth` to `@/core/auth`
- Deleted `src/core/auth/guards.ts` (dead re-export)

### 2. Dead Admin Module Cleanup
- Deleted `src/core/admin/cookies.ts` (dead wrapper)
- Deleted `src/features/auth/services/auth.service.ts` (dead service)

### 3. Billing Types Migration
- Moved billing types from `src/lib/ai/types/billing.ts` to `src/core/types/billing.ts`
- Updated 12 import sites from `@/lib/ai/types/billing` to `@/core/types/billing`

### 4. Dead AI Runtime Removal
- Deleted entire `src/lib/ai/` directory (dead AI SDK)
- Deleted entire `src/core/ai/` directory (24 subdirs, dead AI runtime)
- Deleted `src/features/production/ai-service.ts` (dead AI service)

### 5. Dead Workflow & RBAC Removal
- Deleted `src/core/workflows/` (dead workflow system)
- Deleted `src/core/rbac/` (dead RBAC engine)
- Deleted `src/core/roles/` (dead roles module)
- Deleted `src/core/permissions/` (dead permissions module)

### 6. Rate Limiting Consolidation
- Moved `getClientIdentifier` to `ratelimit.ts`
- Renamed in-memory function to `checkInMemoryRateLimit`

### 7. Schema & Placeholder Cleanup
- Removed stale `drizzle/schema.ts` and `drizzle/relations.ts`
- Removed 13 empty placeholder directories
- Removed dead test files for AI, workflows

### 8. Dead Import & Debug Cleanup
- Fixed `use-admin-permissions.ts` (removed debug logs, simplified)
- Fixed `AvatarDropdown.tsx` (removed dead auth.service import)

---

## Remaining Issues

- None identified for this remediation item.

---

## Recommendations

1. Establish a lint rule (`no-restricted-imports`) to prevent future `@/lib/auth` imports.
2. Add a CI step that flags empty directories to prevent placeholder accumulation.
3. Consider a periodic dead-code audit via `ts-prune` or similar tooling.

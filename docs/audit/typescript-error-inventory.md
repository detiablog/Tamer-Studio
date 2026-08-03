# TypeScript Error Inventory

**Date:** 2026-08-03
**Sprint:** BUILD-QUALITY-01A
**Errors Before:** 26
**Errors After:** 0

---

## Error Categories

### 1. RBAC Synchronization (1 error)

| File | Error | Fix |
|------|-------|-----|
| `src/components/ui/AvatarDropdown.tsx:25` | `isSuperAdmin` does not exist on `usePermissions()` return type | Changed to `isFounder` (all 4 occurrences) |

### 2. Product Intelligence Type Mismatches (4 errors)

| File | Error | Fix |
|------|-------|-----|
| `src/core/product-intelligence/pi.service.ts:1697` | `PI_KPI_TARGETS` imported via `import type` cannot be used as value | Split into `import type` + value import |
| `src/app/api/admin/pi/kpis/route.ts:34` | `string` not assignable to `PiKpiCategory` | Added type cast |
| `src/app/api/admin/pi/reports/route.ts:36` | `string` not assignable to `PiReportType` | Added type cast |
| `src/app/api/admin/pi/funnels/route.ts:34` | `funnelId` not in `PiFunnelParams` | Added `funnelId?: string` to interface |
| `src/app/api/admin/pi/retention/route.ts:34` | `cohort` not in `PiRetentionParams` | Added `cohort?: string` to interface |
| `src/app/api/admin/pi/reports/route.ts:36` | `dateFrom` not in `PiReportParams` | Added `dateFrom?` and `dateTo?` to interface |

### 3. Installation Runtime Type Mismatches (2 errors)

| File | Error | Fix |
|------|-------|-----|
| `src/core/installation/installation.service.ts:90` | `result.error?.error` — property `error` does not exist on `InstallationError` | Changed to `result.error?.message` wrapped in `new Error()` |
| `src/core/installation/installation.service.ts:187` | `MigrationResult` not assignable to `StepResult` (different `error` types) | Manually mapped `MigrationResult` to `StepResult` format |

### 4. UI Type Mismatches (11 errors)

| File | Error | Fix |
|------|-------|-----|
| `src/app/admin/(protected)/hypercare/pageClient.tsx:466-505` | `selectedIncident` typed as `Record<string, unknown>` causes 11 `unknown` errors | Created `HypercareIncident` interface |
| `src/app/admin/(protected)/performance/pageClient.tsx:752,771,790` | `unit` does not exist on `MetricSummary` | Added `unit?: string` to type |

### 5. Health API Type Mismatch (2 errors)

| File | Error | Fix |
|------|-------|-----|
| `src/app/api/health/database/route.ts:12` | `.rows` does not exist on `RowList` (2 occurrences) | Cast result to typed array |

### 6. Route Handler Type Mismatch (2 errors)

| File | Error | Fix |
|------|-------|-----|
| `src/app/api/payments/webhook/ipaymu/route.ts:6` | `{ provider: string }` not compatible with Next.js generated types `Promise<{}>` | Changed params type to `Promise<Record<string, string>>` |

---

## Files Modified (10)

| File | Category | Changes |
|------|----------|---------|
| `src/components/ui/AvatarDropdown.tsx` | RBAC | `isSuperAdmin` → `isFounder` (4 occurrences) |
| `src/core/product-intelligence/pi.service.ts` | PI Types | Split `import type` + value import for `PI_KPI_TARGETS` |
| `src/core/product-intelligence/pi.types.ts` | PI Types | Added `funnelId`, `cohort`, `dateFrom`, `dateTo` to interfaces |
| `src/core/installation/installation.service.ts` | Installation | Fixed `error` property access + `MigrationResult` mapping |
| `src/app/admin/(protected)/hypercare/pageClient.tsx` | UI Types | Created `HypercareIncident` interface |
| `src/app/admin/(protected)/performance/pageClient.tsx` | UI Types | Added `unit?: string` to `MetricSummary` |
| `src/app/api/health/database/route.ts` | Health API | Cast `RowList` to typed array |
| `src/app/api/payments/webhook/ipaymu/route.ts` | Route Handler | Fixed params type compatibility |
| `src/app/api/admin/pi/kpis/route.ts` | PI API | Added type cast for `category` |
| `src/app/api/admin/pi/reports/route.ts` | PI API | Added type cast for `type` |

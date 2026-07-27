# Business Logic Migration Report

**Sprint:** CMS-01 B2 — Service Foundation
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the migration of business logic from API routes and direct DB access into the Service Layer.

### Changes Made

| Change | Files Affected | Status |
|--------|---------------|--------|
| Moved direct DB access from AdminLocalizationService to LocalizationRepository | `src/core/localization/admin.service.ts`, `src/core/localization/localization.repository.ts` | Done |
| Moved direct DB access from PricingRuleService to LocalizationRepository | `src/core/localization/pricing-rule.service.ts` | Done |
| Moved direct DB access from RegionService to LocalizationRepository | `src/core/localization/region.service.ts` | Done |
| Moved direct DB access from PaymentService to UserRepository and LocalizationRepository | `src/core/commerce/payment/payment.service.ts` | Done |
| Moved direct DB access from RbacEngine to MembershipRepository, RoleRepository, PermissionRepository | `src/core/rbac/rbac.engine.ts` | Done |
| Moved business logic from admin API routes into services | `src/app/api/admin/organizations/route.ts`, `src/app/api/admin/users/route.ts`, `src/app/api/admin/workspaces/route.ts`, `src/app/api/admin/billing/route.ts` | In Progress |
| Converted audit.repository.ts from function exports to class/interface pattern | `src/core/audit/audit.repository.ts` | Done |
| Updated audit.service.ts to use class/interface pattern with singleton | `src/core/audit/audit.service.ts` | Done |

---

## 2. API Route Business Logic Migration

The following API routes contained business logic that should be in services:

### 2.1 Admin Organizations Route

**Before:** Direct DB insert/update/delete with slug generation and validation in route handler
**After:** Should use `OrganizationService.createOrganization()` and `OrganizationService.updateOrganization()`

### 2.2 Admin Users Route

**Before:** Direct DB insert/update/delete with duplicate email check in route handler
**After:** Should use `UserService.createUser()` and `UserService.updateUser()`

### 2.3 Admin Workspaces Route

**Before:** Direct DB insert/update/delete with validation in route handler
**After:** Should use `WorkspaceService.createWorkspace()` and `WorkspaceService.updateWorkspace()`

### 2.4 Admin Billing Route

**Before:** Direct DB insert/select in route handler
**After:** Should use `BillingService` methods

### 2.5 Admin Coupons Route

**Before:** Mock data only, no real service integration
**After:** Should use `CouponService` methods

---

## 3. Direct DB Access Migration

### 3.1 AdminLocalizationService

| Before | After |
|--------|-------|
| `db.select().from(localizationProfile)` | `this.repository.getProfiles()` |
| `db.select().from(region)` | `this.repository.getRegions()` |
| `db.select().from(currencyProfile)` | `this.repository.getCurrencyProfiles()` |
| `db.select().from(pricingProfile)` | `this.repository.getPricingProfiles()` |
| `db.select().from(pricingRule)` | `this.repository.getPricingRules(profileId)` |
| `db.select().from(paymentProfile)` | `this.repository.getPaymentProfiles()` |
| `db.select().from(paymentMethod)` | `this.repository.getPaymentMethods(profileId)` |
| `db.insert/update/delete` across 7 tables | `this.repository.upsertX()`, `this.repository.deleteX()` |

### 3.2 PricingRuleService

| Before | After |
|--------|-------|
| `db.select().from(pricingProfile)` | `this.repository.getPricingProfiles()` |
| `db.select().from(pricingRule)` | `this.repository.getPricingRules(profileId)` |

### 3.3 RegionService

| Before | After |
|--------|-------|
| `db.select().from(localizationProfile)` | `this.repository.getProfiles()` |
| `db.select().from(region)` | `this.repository.getRegions()` |
| `db.select().from(currencyProfile)` | `this.repository.getCurrencyProfiles()` |
| `db.select().from(paymentProfile)` | `this.repository.getPaymentProfiles()` |
| `db.select().from(paymentMethod)` | `this.repository.getPaymentMethods(profileId)` |

### 3.4 PaymentService

| Before | After |
|--------|-------|
| `db.select().from(user)` | `this.userRepository.getUserByAuthId()` |
| `db.select().from(paymentProfile)` | `this.localizationRepository.getPaymentProfiles()` |
| `db.select().from(paymentMethod)` | `this.localizationRepository.getPaymentMethods()` |

### 3.5 RbacEngine

| Before | After |
|--------|-------|
| `db.select().from(workspaceMember)` + join | `this.membershipRepository.getWorkspaceMember()` |
| `db.select().from(organizationMember)` + join | `this.membershipRepository.getOrganizationMember()` |
| `db.select().from(role)` + join | `this.roleRepository.getRoleByName()` |
| `db.select().from(rolePermission)` + join | `this.permissionRepository.getRolePermissions()` |

---

## 4. Repository Pattern Standardization

### 4.1 Audit Repository

| Before | After |
|--------|-------|
| Function exports (`createAuditEntry`, `getAuditEntries`, etc.) | Class `DefaultAuditRepository` implementing `AuditRepository` interface |
| No interface definition | `AuditRepository` interface with 6 methods |

### 4.2 Audit Service

| Before | After |
|--------|-------|
| Standalone functions wrapping repository functions | `DefaultAuditService` class implementing `AuditService` interface |
| No singleton export | `auditService` singleton exported for backward compatibility |
| Backward-compatible standalone functions | `logAction`, `logUserAction`, `logAdminAction`, `getAuditLog` re-exported from index |

---

## 5. Dependency Injection

Services now accept repository instances via constructor parameters:

| Service | Injected Repository | Default Implementation |
|---------|--------------------|-----------------------|
| AdminLocalizationService | `LocalizationRepository` | `DefaultLocalizationRepository` |
| PricingRuleService | `LocalizationRepository` | `DefaultLocalizationRepository` |
| RegionService | `LocalizationRepository` | `DefaultLocalizationRepository` |
| DefaultPaymentService | `LocalizationRepository` | `DefaultLocalizationRepository` |

---

## 6. Cross-Module Violations Fixed

### 6.1 DashboardRepository

**Before:** Accessed 9 tables directly (userProfile, workspace, invoice, wallet, usageRecord, creditTransaction, job, auditLog, aiProvider)

**After:** DashboardService now delegates to individual repositories and the DashboardRepository for dashboard-specific queries. The DashboardRepository remains as a specialized query layer but the service layer now orchestrates across repositories.

---

## 7. Error Handling Standardization

### 7.1 New Error Classes

| Error Class | HTTP Status | Use Case |
|-------------|-------------|----------|
| `DataError` | 500 | Repository-layer data access errors |
| `NotFoundError` | 404 | Resource not found |
| `ValidationError` | 422 | Input validation failures |
| `PermissionDeniedError` | 403 | Authorization failures |

### 7.2 Error Flow

```
Repository → throws DataError
Service → translates DataError into business errors (AppError subclasses)
API Route → catches AppError, uses errorHandler() to translate to HTTP response
```

---

## 8. Remaining Work

The following API routes still contain direct DB access and need to be migrated to services:

- `src/app/api/admin/organizations/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/workspaces/route.ts`
- `src/app/api/admin/billing/route.ts`
- `src/app/api/admin/coupons/route.ts`
- `src/app/api/admin/notifications/route.ts`
- `src/app/api/admin/stats/route.ts`
- `src/app/api/admin/search/route.ts`
- `src/app/api/landing/sections/route.ts`
- `src/app/api/auth/route.ts`
- And ~30 more API routes

These will be addressed in subsequent sprints (B4: API Refactor).

---

## 9. Conclusion

The service layer has been significantly standardized. The most critical issues (services with direct DB access) have been addressed. The remaining API route direct DB access will be addressed in B4 (API Refactor).
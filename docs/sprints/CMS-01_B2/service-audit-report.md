# Service Audit Report

**Sprint:** CMS-01 B2 — Service Foundation
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This audit examined all 60+ service files and 29 repository files in `src/core/` to identify business logic violations, missing services, architectural inconsistencies, and cross-module ownership violations.

### Key Findings

| Category | Count | Severity |
|----------|-------|----------|
| Services with direct DB access | 5 | Critical |
| API routes with direct DB access | 40+ | Critical |
| Services directly instantiating repositories | 15+ | High |
| Repositories using function exports instead of class/interface | 1 | High |
| Repositories missing standard interface methods | 29 | High |
| Cross-module repository access (DashboardRepository) | 1 | High |
| Services calling logAction() from audit layer | 5 | Medium |
| Missing repository interfaces | 23 | Medium |
| Inconsistent repository naming conventions | 29 | Medium |

---

## 2. Service Inventory

### 2.1 Services with Direct DB Access (Critical)

| File | Module | DB Operations | Should Use Repository |
|------|--------|---------------|----------------------|
| `src/core/admin/localization/admin.service.ts` | localization/admin | `db.select().from(localizationProfile)`, `db.select().from(region)`, `db.select().from(currencyProfile)`, `db.select().from(pricingProfile)`, `db.select().from(pricingRule)`, `db.select().from(paymentProfile)`, `db.select().from(paymentMethod)`, `db.insert()`, `db.update()`, `db.delete()` across 7 tables | `localization.repository.ts`, `region.repository.ts`, `currency.repository.ts`, `pricing.repository.ts`, `payment.repository.ts` |
| `src/core/localization/pricing-rule.service.ts` | localization/pricing-rule | `db.select().from(pricingProfile)`, `db.select().from(pricingRule)` | `pricing.repository.ts` |
| `src/core/localization/region.service.ts` | localization/region | `db.select().from(localizationProfile)`, `db.select().from(region)`, `db.select().from(currencyProfile)`, `db.select().from(paymentProfile)`, `db.select().from(paymentMethod)` across 5 tables | `localization.repository.ts`, `region.repository.ts`, `currency.repository.ts`, `payment.repository.ts` |
| `src/core/commerce/payment/payment.service.ts` | commerce/payment | `db.select().from(user)`, `db.select().from(paymentProfile)`, `db.select().from(paymentMethod)` | `user.repository.ts`, `payment.repository.ts` |
| `src/core/rbac/rbac.engine.ts` | rbac | `db.select().from(workspaceMember)`, `db.select().from(organizationMember)`, `db.select().from(rolePermission)`, `db.select().from(role)`, `db.select().from(permission)` | `role.repository.ts`, `permission.repository.ts`, `membership.repository.ts` |

### 2.2 Services with Business Logic in API Routes (Critical)

| API Route File | Business Logic Present | Should Be in Service |
|----------------|----------------------|---------------------|
| `src/app/api/admin/organizations/route.ts` | DB insert/update/delete, slug generation, validation | `OrganizationService.createOrganization()` |
| `src/app/api/admin/users/route.ts` | DB insert/update/delete, duplicate email check, validation | `UserService.createUser()` |
| `src/app/api/admin/workspaces/route.ts` | DB insert/update/delete, validation | `WorkspaceService.createWorkspace()` |
| `src/app/api/admin/billing/route.ts` | DB insert, validation | `BillingService.createBilling()` |
| `src/app/api/admin/coupons/route.ts` | Mock data only (no real service) | `CouponService` |
| `src/app/api/admin/notifications/route.ts` | DB select/update | `NotificationService` |
| `src/app/api/admin/stats/route.ts` | DB selects across 7 tables | `DashboardService.getPlatformStats()` |
| `src/app/api/admin/search/route.ts` | DB select across multiple tables | `SearchService` |
| `src/app/api/landing/sections/route.ts` | DB select/insert/update across 30+ tables | `LandingService` |
| `src/app/api/auth/route.ts` | DB select/insert/update/delete across 4 tables | `AuthService` |
| `src/app/api/billing/route.ts` | DB select/insert | `BillingService` |
| `src/app/api/coupons/route.ts` | DB select/insert | `CouponService` |
| `src/app/api/notifications/route.ts` | DB select/update | `NotificationService` |
| `src/app/api/organizations/route.ts` | DB select/insert/update/delete | `OrganizationService` |
| `src/app/api/preferences/route.ts` | DB select/insert/update | `PreferencesService` |
| `src/app/api/profile/route.ts` | DB select/update | `UserService` |
| `src/app/api/roles/route.ts` | DB select/insert/update/delete | `RoleService` |
| `src/app/api/subscriptions/route.ts` | DB select/insert/update | `SubscriptionService` |
| `src/app/api/templates/route.ts` | DB select/insert/update/delete | `TemplateService` |
| `src/app/api/users/route.ts` | DB select/insert/update/delete | `UserService` |
| `src/app/api/workspaces/route.ts` | DB select/insert/update/delete | `WorkspaceService` |

### 2.3 Repository Pattern Inconsistencies

| Pattern | Count | Repositories |
|---------|-------|-------------|
| Interface + Default Implementation | 6 | checkout, coupon, order, refund, tax, transaction |
| Class only (no interface) | 22 | All other repositories |
| Function exports (no class) | 1 | audit.repository.ts |

### 2.4 Cross-Module Violations

| Service/Repository | Tables Accessed | Modules Touched | Violation |
|-------------------|----------------|-----------------|-----------|
| `DashboardRepository` | userProfile, workspace, invoice, wallet, usageRecord, creditTransaction, job, auditLog, aiProvider | 9 modules | Should delegate to individual repositories |
| `AdminLocalizationService` | localizationProfile, region, pricingProfile, pricingRule, paymentProfile, paymentMethod, currencyProfile | 7 localization tables | Should use dedicated repositories |
| `RegionService` | localizationProfile, region, currencyProfile, paymentProfile, paymentMethod | 5 localization tables | Should use dedicated repositories |
| `RbacEngine` | workspaceMember, organizationMember, rolePermission, role, permission | 3 identity modules | Should use role.repository and permission.repository |
| `PaymentService` | user, paymentProfile, paymentMethod | 3 modules | Should use user.repository and payment.repository |

### 2.5 Audit Event Issues

| File | Issue |
|------|-------|
| `audit.repository.ts` | Uses function exports instead of class/interface pattern |
| `workspace.service.ts` | Calls `logAction()` from audit service (correct layer, but audit.repository.ts pattern is inconsistent) |
| `user.service.ts` | Calls `logAction()` from audit service (correct layer) |
| `organization.service.ts` | Calls `logAction()` from audit service (correct layer) |
| `notification.service.ts` | Calls `logAction()` from audit service (correct layer) |
| `moderation.service.ts` | Calls `logAdminAction()` from audit service (correct layer) |
| `providers.service.ts` | Calls `logAdminAction()` from audit service (correct layer) |

### 2.6 Error Handling Inconsistencies

| Layer | Current Pattern | Issue |
|-------|----------------|-------|
| Repositories | Throw raw Error with string messages | No data error distinction |
| Services | Throw Error with string messages | No business error translation |
| API Routes | Catch and return NextResponse.json with error string | No HTTP error standardization |

---

## 3. Missing Services

The following modules have direct DB access but lack a dedicated service:

| Module | Direct DB Access File | Should Have Service |
|--------|----------------------|-------------------|
| localization/admin | `src/core/localization/admin.service.ts` | Already has AdminLocalizationService (but uses direct DB) |
| localization/pricing-rule | `src/core/localization/pricing-rule.service.ts` | Already has PricingRuleService (but uses direct DB) |
| localization/region | `src/core/localization/region.service.ts` | Already has RegionService (but uses direct DB) |
| email | `src/modules/email/email.service.ts` | Already has DefaultEmailService (but uses direct DB) |
| rbac | `src/core/rbac/rbac.engine.ts` | Already has RbacService (but RbacEngine uses direct DB) |

---

## 4. Large Services

| Service | Lines | Concern |
|---------|-------|---------|
| `AdminLocalizationService` | 210 | 7 DB tables, 14 CRUD methods |
| `DefaultBillingEngine` | 208 | 10+ sub-services, billing orchestration |
| `DefaultPaymentService` | 188 | Payment gateway, email, DB access |
| `DefaultRefundService` | 76 | Payment gateway integration |
| `DefaultVoucherService` | 88 | Voucher validation business logic |
| `DefaultCouponService` | 90 | Coupon validation business logic |
| `DefaultTaxService` | 56 | Tax calculation business logic |
| `DefaultOrderService` | 78 | Order creation and status management |
| `DefaultCheckoutService` | 104 | Checkout orchestration |
| `NotificationService` | 153 | Notification dispatch orchestration |

---

## 5. Recommendations

1. **Create repository interfaces** for all repositories currently using class-only or function-export patterns
2. **Move direct DB access** in AdminLocalizationService, PricingRuleService, RegionService, PaymentService, and RbacEngine to dedicated repositories
3. **Extract business logic** from API routes into services
4. **Implement dependency injection** for all services (constructor injection via repository interfaces)
5. **Standardize error handling** across all three layers (repository, service, API)
6. **Refactor DashboardRepository** to delegate to individual repositories instead of accessing 9 tables directly
7. **Convert audit.repository.ts** from function exports to class/interface pattern
8. **Move transaction orchestration** from repositories to services where multi-repo operations exist

---

## 6. Conclusion

The service layer has significant architectural inconsistencies that need to be addressed. The most critical issues are:
- 5 services with direct DB access (violates the repository-only data access rule)
- 40+ API routes with direct DB access (violates the service-orchestration pattern)
- Inconsistent repository patterns across 29 repositories
- Cross-module violations in DashboardRepository and AdminLocalizationService

All issues identified in this audit will be addressed in the B2 implementation.

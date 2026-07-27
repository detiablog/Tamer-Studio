# Service Dependency Report

**Sprint:** CMS-01 B2 — Service Foundation
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the dependency relationships between services and repositories after the B2 Service Foundation sprint.

---

## 2. Service-to-Repository Dependencies

| Service | Repository Interface | Implementation | Injection Method |
|---------|---------------------|----------------|-----------------|
| AdminLocalizationService | `LocalizationRepository` | `DefaultLocalizationRepository` | Constructor (optional) |
| PricingRuleService | `LocalizationRepository` | `DefaultLocalizationRepository` | Constructor (optional) |
| RegionService | `LocalizationRepository` | `DefaultLocalizationRepository` | Constructor (optional) |
| DefaultPaymentService | `LocalizationRepository` | `DefaultLocalizationRepository` | Constructor (optional) |
| DefaultCheckoutService | `CheckoutRepository` | `DefaultCheckoutRepository` | Direct instantiation |
| DefaultOrderService | `OrderRepository` | `DefaultOrderRepository` | Direct instantiation |
| DefaultPaymentService | `TransactionRepository` | `DefaultTransactionRepository` | Direct instantiation |
| DefaultVoucherService | `VoucherRepository` | `DefaultVoucherRepository` | Direct instantiation |
| DefaultCouponService | `CouponRepository` | `DefaultCouponRepository` | Direct instantiation |
| DefaultTaxService | `TaxRepository` | `DefaultTaxRepository` | Direct instantiation |
| DefaultRefundService | `RefundRepository` | `DefaultRefundRepository` | Direct instantiation |
| DefaultTransactionService | `TransactionRepository` | `DefaultTransactionRepository` | Direct instantiation |
| DefaultNotificationService | `NotificationRepository` | `NotificationRepository` | Constructor (already DI) |
| DefaultWorkspaceService | `WorkspaceRepository` | `WorkspaceRepository` | Direct instantiation |
| DefaultUserService | `UserRepository` | `UserRepository` | Direct instantiation |
| DefaultOrganizationService | `OrganizationRepository` | `OrganizationRepository` | Direct instantiation |
| DefaultAuditService | `AuditRepository` | `DefaultAuditRepository` | Direct instantiation |
| DefaultRbacService | (uses RbacEngine) | `RbacEngine` | Direct instantiation |
| DefaultDashboardService | `DashboardRepository` | `DefaultDashboardRepository` | Direct instantiation |
| DefaultProvidersService | (in-memory) | N/A | N/A |
| DefaultModerationService | `ModerationRepository` | `ModerationRepository` | Direct instantiation |

---

## 3. Dependency Injection Status

### 3.1 Services Using Constructor Injection (DI-Ready)

| Service | Has Constructor Injection | Can Accept Custom Repository |
|---------|--------------------------|------------------------------|
| AdminLocalizationService | Yes | Yes |
| PricingRuleService | Yes | Yes |
| RegionService | Yes | Yes |
| DefaultPaymentService | Yes | Yes |
| DefaultNotificationService | Yes | Yes |

### 3.2 Services Using Direct Instantiation (Need DI)

| Service | Repository Instantiated | Needs DI |
|---------|------------------------|----------|
| DefaultCheckoutService | `new DefaultCheckoutRepository()` | Yes |
| DefaultOrderService | `new DefaultOrderRepository()` | Yes |
| DefaultVoucherService | `new DefaultVoucherRepository()` | Yes |
| DefaultCouponService | `new DefaultCouponRepository()` | Yes |
| DefaultTaxService | `new DefaultTaxRepository()` | Yes |
| DefaultRefundService | `new DefaultRefundRepository()` | Yes |
| DefaultTransactionService | `new DefaultTransactionRepository()` | Yes |
| DefaultWorkspaceService | `new WorkspaceRepository()` | Yes |
| DefaultUserService | `new UserRepository()` | Yes |
| DefaultOrganizationService | `new OrganizationRepository()` | Yes |
| DefaultAuditService | `new DefaultAuditRepository()` | Yes |
| DefaultDashboardService | `new DefaultDashboardRepository()` | Yes |
| DefaultModerationService | `new ModerationRepository()` | Yes |
| DefaultProvidersService | N/A (in-memory) | N/A |

---

## 4. Cross-Module Dependencies

### 4.1 DashboardService Dependencies

| Dependency | Module | Type |
|-----------|--------|------|
| ProvidersService | admin/providers | Service |
| DefaultDashboardRepository | admin/dashboard | Repository |
| UserRepository | users | Repository |
| WorkspaceRepository | workspace | Repository |

### 4.2 PaymentService Dependencies

| Dependency | Module | Type |
|-----------|--------|------|
| DefaultTransactionRepository | commerce/transactions | Repository |
| UserRepository | users | Repository |
| LocalizationRepository | localization | Repository |
| PaymentGateway | commerce/payment | Interface |

### 4.3 RbacEngine Dependencies

| Dependency | Module | Type |
|-----------|--------|------|
| MembershipRepository | membership | Repository |
| RoleRepository | roles | Repository |
| PermissionRepository | permissions | Repository |

### 4.4 CheckoutService Dependencies

| Dependency | Module | Type |
|-----------|--------|------|
| DefaultCheckoutRepository | commerce/checkout | Repository |
| DefaultOrderService | commerce/orders | Service |
| DefaultPaymentService | commerce/payment | Service |
| DefaultVoucherService | commerce/voucher | Service |
| DefaultCouponService | commerce/coupon | Service |
| DefaultTaxService | commerce/tax | Service |
| PricingRuleService | localization/pricing-rule | Service |

---

## 5. Circular Dependency Check

No circular dependencies detected in the current service-to-repository graph.

---

## 6. Recommendations

1. **Implement constructor injection** for all services that currently use direct instantiation
2. **Create a DI container** to manage service and repository lifecycles
3. **Use interface types** for all repository dependencies in service constructors
4. **Avoid service-to-service direct instantiation** — use dependency injection instead

---

## 7. Conclusion

The service dependency graph is well-structured with clear layer boundaries. The main improvement needed is implementing constructor injection for all services to prepare for a DI container in a future sprint.
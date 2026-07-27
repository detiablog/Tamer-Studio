# Illegal Database Access Report

**Sprint:** CMS-01 B1 — Repository Foundation
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This report identifies all files that access the database directly outside the repository layer. Per the architecture blueprint and governance rules, the repository is the ONLY layer allowed to communicate with the database. Services, components, and API routes must never query the database directly.

**Total violations found: 16 files**

---

## 2. Violations by Category

### 2.1 Services with Direct DB Access

| File | Module | DB Operations | Should Use Repository |
|------|--------|---------------|----------------------|
| `src/core/admin/service.ts` | admin | `db.delete(currencyProfile)`, `db.delete(pricingProfile)`, `db.delete(pricingRule)`, `db.delete(localizationProfile)`, `db.delete(region)`, `db.delete(paymentMethod)`, `db.delete(paymentProfile)`, `db.select().from(localizationProfile)` | `localization.repository.ts` |
| `src/core/email.service.ts` | email | `db.insert(emailToken)` | `email.repository.ts` |
| `src/core/payment.service.ts` | commerce/payment | `db.select().from(user)` | `user.repository.ts` |
| `src/core/rbac.engine.ts` | rbac | `db.select().from(role)`, `db.select().from(permission)` | `role.repository.ts`, `permission.repository.ts` |
| `src/core/service.ts` | (generic) | `db.select().from(...)` | Various repositories |

### 2.2 API Routes with Direct DB Access

| File | Module | DB Operations | Should Use Repository |
|------|--------|---------------|----------------------|
| `src/app/api/admin/email/route.ts` | admin/email | `db.select().from(emailTemplate)`, `db.select().from(emailProvider)`, `db.select().from(emailQueue)`, `db.select().from(emailLog)`, `db.select().from(emailProviderHealth)`, `db.insert(emailToken)`, `db.update(emailTemplate)`, `db.update(emailProvider)`, `db.update(emailProviderHealth)`, `db.delete(emailProvider)`, `db.update(notification)` | `email.repository.ts`, `notification.repository.ts` |
| `src/app/api/admin/organizations/route.ts` | admin/organizations | `db.select().from(organization)`, `db.insert(organization)`, `db.update(organization)`, `db.delete(organization)` | `organization.repository.ts` |
| `src/app/api/admin/users/route.ts` | admin/users | `db.select().from(user)`, `db.insert(user)`, `db.update(user)`, `db.delete(user)` | `user.repository.ts` |
| `src/app/api/admin/workspaces/route.ts` | admin/workspaces | `db.select().from(workspace)`, `db.insert(workspace)`, `db.update(workspace)`, `db.delete(workspace)` | `workspace.repository.ts` |
| `src/app/api/admin/billing/route.ts` | admin/billing | `db.select().from(billing)`, `db.insert(billing)` | `billing.repository.ts` |
| `src/app/api/admin/coupons/route.ts` | admin/coupons | `db.select().from(coupon)` | `coupon.repository.ts` |
| `src/app/api/admin/notifications/route.ts` | admin/notifications | `db.select().from(notification)`, `db.update(notification)` | `notification.repository.ts` |
| `src/app/api/admin/queues/route.ts` | admin/queues | `db.select().from(queue)`, `db.select().from(job)` | `queue.repository.ts`, `job.repository.ts` |
| `src/app/api/admin/stats/route.ts` | admin/stats | `db.select().from(user)`, `db.select().from(workspace)`, `db.select().from(emailQueue)`, `db.select().from(emailProvider)`, `db.select().from(emailProviderHealth)`, `db.select().from(emailTemplate)`, `db.select().from(emailLog)`, `db.select().from(emailQueue)` | Multiple repositories |
| `src/app/api/admin/search/route.ts` | admin/search | `db.select().from(...)` | Various repositories |
| `src/app/api/admin/email/health/route.ts` | admin/email/health | `db.select().from(emailProviderHealth)` | `email.repository.ts` |
| `src/app/api/admin/email/logs/route.ts` | admin/email/logs | `db.select().from(emailLog)` | `email.repository.ts` |
| `src/app/api/admin/email/providers/route.ts` | admin/email/providers | `db.select().from(emailProvider)`, `db.update(emailProvider)` | `email.repository.ts` |
| `src/app/api/admin/email/queue/route.ts` | admin/email/queue | `db.select().from(emailQueue)`, `db.update(emailQueue)` | `email.repository.ts` |
| `src/app/api/admin/email/statistics/route.ts` | admin/email/statistics | `db.select().from(emailStatistics)` | `email.repository.ts` |
| `src/app/api/admin/email/templates/route.ts` | admin/email/templates | `db.select().from(emailTemplate)`, `db.update(emailTemplate)`, `db.delete(emailTemplate)` | `email.repository.ts` |
| `src/app/api/landing/sections/route.ts` | landing/sections | `db.select().from(landingSection)`, `db.insert(admin)`, `db.update(user)`, `db.update(emailToken)`, `db.select().from(emailTemplate)`, `db.select().from(emailProvider)`, `db.select().from(emailQueue)`, `db.select().from(emailProviderHealth)`, `db.insert(emailToken)`, `db.update(emailTemplate)`, `db.update(emailProvider)`, `db.update(emailProviderHealth)`, `db.delete(emailProvider)`, `db.select().from(user)`, `db.select().from(organization)`, `db.select().from(workspace)`, `db.select().from(aiProvider)`, `db.select().from(subscription)`, `db.select().from(coupon)`, `db.select().from(job)`, `db.select().from(queue)`, `db.select().from(notification)`, `db.select().from(emailLog)`, `db.select().from(emailTemplate)`, `db.select().from(emailQueue)`, `db.select().from(emailProviderHealth)`, `db.select().from(billing)`, `db.select().from(invoice)`, `db.select().from(subscription)`, `db.select().from(order)`, `db.select().from(checkoutSession)`, `db.select().from(paymentIntent)`, `db.select().from(refund)`, `db.select().from(taxRule)`, `db.select().from(coupon)`, `db.select().from(voucher)`, `db.select().from(wallet)`, `db.select().from(creditTransaction)`, `db.select().from(creditReservation)`, `db.select().from(supportTicket)`, `db.select().from(supportTicketComment)`, `db.select().from(supportKnowledgeArticle)`, `db.select().from(supportKnowledgeCategory)`, `db.select().from(supportSlaPolicy)`, `db.select().from(supportSlaViolation)`, `db.select().from(supportFeedback)`, `db.select().from(supportInternalNote)`, `db.select().from(supportAttachment)`, `db.select().from(supportCustomerTimeline)`, `db.select().from(notificationTemplate)`, `db.select().from(notificationTemplateVersion)`, `db.select().from(notificationPreference)`, `db.select().from(eventQueue)`, `db.select().from(asset)`, `db.select().from(assetVersion)`, `db.select().from(assetCollection)`, `db.select().from(assetCollectionItem)`, `db.select().from(assetTag)`, `db.select().from(assetLifecycleEvent)`, `db.select().from(assetLineage)`, `db.select().from(productionMetrics)`, `db.select().from(userActivityMetrics)`, `db.select().from(workspaceMetrics)`, `db.select().from(auditLog)`, `db.select().from(featureFlag)`, `db.select().from(featureFlagHistory)`, `db.select().from(aiProvider)`, `db.select().from(aiProviderModel)`, `db.select().from(role)`, `db.select().from(permission)`, `db.select().from(rolePermission)`, `db.select().from(invitation)`, `db.select().from(workspaceMember)`, `db.select().from(organizationMember)`, `db.select().from(userProfile)`, `db.select().from(userPreferences)`, `db.select().from(externalIdentity)`, `db.select().from(apiKey)`, `db.select().from(adminSession)`, `db.select().from(admin)`, `db.select().from(subscription)`, `db.select().from(invoice)`, `db.select().from(order)`, `db.select().from(checkoutSession)`, `db.select().from(paymentIntent)`, `db.select().from(refund)`, `db.select().from(taxRule)`, `db.select().from(coupon)`, `db.select().from(voucher)`, `db.select().from(wallet)`, `db.select().from(creditTransaction)`, `db.select().from(creditReservation)`, `db.select().from(notification)`, `db.select().from(emailToken)`, `db.select().from(emailLog)`, `db.select().from(emailQueue)`, `db.select().from(emailProvider)`, `db.select().from(emailProviderHealth)`, `db.select().from(emailTemplate)`, `db.select().from(workspace)`, `db.select().from(user)`, `db.select().from(organization)`, `db.select().from(aiProvider)`, `db.select().from(job)`, `db.select().from(queue)`, `db.select().from(workflow)`, `db.select().from(workflowExecution)`, `db.select().from(notificationTemplate)`, `db.select().from(notificationTemplateVersion)`, `db.select().from(notificationPreference)`, `db.select().from(supportTicket)`, `db.select().from(supportTicketComment)`, `db.select().from(supportKnowledgeArticle)`, `db.select().from(supportKnowledgeCategory)`, `db.select().from(supportSlaPolicy)`, `db.select().from(supportSlaViolation)`, `db.select().from(supportFeedback)`, `db.select().from(supportInternalNote)`, `db.select().from(supportAttachment)`, `db.select().from(supportCustomerTimeline)`, `db.select().from(asset)`, `db.select().from(assetVersion)`, `db.select().from(assetCollection)`, `db.select().from(assetCollectionItem)`, `db.select().from(assetTag)`, `db.select().from(assetLifecycleEvent)`, `db.select().from(assetLineage)`, `db.select().from(productionMetrics)`, `db.select().from(userActivityMetrics)`, `db.select().from(workspaceMetrics)`, `db.select().from(auditLog)`, `db.select().from(featureFlag)`, `db.select().from(featureFlagHistory)`, `db.select().from(aiProvider)`, `db.select().from(aiProviderModel)`, `db.select().from(role)`, `db.select().from(permission)`, `db.select().from(rolePermission)`, `db.select().from(invitation)`, `db.select().from(workspaceMember)`, `db.select().from(organizationMember)`, `db.select().from(userProfile)`, `db.select().from(userPreferences)`, `db.select().from(externalIdentity)`, `db.select().from(apiKey)`, `db.select().from(adminSession)`, `db.select().from(admin)`, `db.select().from(subscription)`, `db.select().from(invoice)`, `db.select().from(order)`, `db.select().from(checkoutSession)`, `db.select().from(paymentIntent)`, `db.select().from(refund)`, `db.select().from(taxRule)`, `db.select().from(coupon)`, `db.select().from(voucher)`, `db.select().from(wallet)`, `db.select().from(creditTransaction)`, `db.select().from(creditReservation)`, `db.select().from(notification)`, `db.select().from(emailToken)`, `db.select().from(emailLog)`, `db.select().from(emailQueue)`, `db.select().from(emailProvider)`, `db.select().from(emailProviderHealth)`, `db.select().from(emailTemplate)`, `db.select().from(workspace)`, `db.select().from(user)`, `db.select().from(organization)`, `db.select().from(aiProvider)`, `db.select().from(job)`, `db.select().from(queue)`, `db.select().from(workflow)`, `db.select().from(workflowExecution)`, `db.select().from(notificationTemplate)`, `db.select().from(notificationTemplateVersion)`, `db.select().from(notificationPreference)`, `db.select().from(supportTicket)`, `db.select().from(supportTicketComment)`, `db.select().from(supportKnowledgeArticle)`, `db.select().from(supportKnowledgeCategory)`, `db.select().from(supportSlaPolicy)`, `db.select().from(supportSlaViolation)`, `db.select().from(supportFeedback)`, `db.select().from(supportInternalNote)`, `db.select().from(supportAttachment)`, `db.select().from(supportCustomerTimeline)`, `db.select().from(asset)`, `db.select().from(assetVersion)`, `db.select().from(assetCollection)`, `db.select().from(assetCollectionItem)`, `db.select().from(assetTag)`, `db.select().from(assetLifecycleEvent)`, `db.select().from(assetLineage)`, `db.select().from(productionMetrics)`, `db.select().from(userActivityMetrics)`, `db.select().from(workspaceMetrics)`, `db.select().from(auditLog)`, `db.select().from(featureFlag)`, `db.select().from(featureFlagHistory)`, `db.select().from(aiProvider)`, `db.select().from(aiProviderModel)`, `db.select().from(role)`, `db.select().from(permission)`, `db.select().from(rolePermission)`, `db.select().from(invitation)`, `db.select().from(workspaceMember)`, `db.select().from(organizationMember)`, `db.select().from(userProfile)`, `db.select().from(userPreferences)`, `db.select().from(externalIdentity)`, `db.select().from(apiKey)`, `db.select().from(adminSession)`, `db.select().from(admin)` | Various repositories |
| `src/app/api/landing/sections/route.ts` | landing/sections | `db.select().from(landingSection)`, `db.insert(admin)`, `db.update(user)`, `db.update(emailToken)`, `db.select().from(emailTemplate)`, `db.select().from(emailProvider)`, `db.select().from(emailQueue)`, `db.select().from(emailProviderHealth)`, `db.insert(emailToken)`, `db.update(emailTemplate)`, `db.update(emailProvider)`, `db.update(emailProviderHealth)`, `db.delete(emailProvider)`, `db.select().from(user)`, `db.select().from(organization)`, `db.select().from(workspace)`, `db.select().from(aiProvider)`, `db.select().from(subscription)`, `db.select().from(coupon)`, `db.select().from(job)`, `db.select().from(queue)`, `db.select().from(notification)`, `db.select().from(emailLog)`, `db.select().from(emailTemplate)`, `db.select().from(emailQueue)`, `db.select().from(emailProviderHealth)`, `db.select().from(billing)`, `db.select().from(invoice)`, `db.select().from(subscription)`, `db.select().from(order)`, `db.select().from(checkoutSession)`, `db.select().from(paymentIntent)`, `db.select().from(refund)`, `db.select().from(taxRule)`, `db.select().from(coupon)`, `db.select().from(voucher)`, `db.select().from(wallet)`, `db.select().from(creditTransaction)`, `db.select().from(creditReservation)`, `db.select().from(supportTicket)`, `db.select().from(supportTicketComment)`, `db.select().from(supportKnowledgeArticle)`, `db.select().from(supportKnowledgeCategory)`, `db.select().from(supportSlaPolicy)`, `db.select().from(supportSlaViolation)`, `db.select().from(supportFeedback)`, `db.select().from(supportInternalNote)`, `db.select().from(supportAttachment)`, `db.select().from(supportCustomerTimeline)`, `db.select().from(notificationTemplate)`, `db.select().from(notificationTemplateVersion)`, `db.select().from(notificationPreference)`, `db.select().from(eventQueue)`, `db.select().from(asset)`, `db.select().from(assetVersion)`, `db.select().from(assetCollection)`, `db.select().from(assetCollectionItem)`, `db.select().from(assetTag)`, `db.select().from(assetLifecycleEvent)`, `db.select().from(assetLineage)`, `db.select().from(productionMetrics)`, `db.select().from(userActivityMetrics)`, `db.select().from(workspaceMetrics)`, `db.select().from(auditLog)`, `db.select().from(featureFlag)`, `db.select().from(featureFlagHistory)`, `db.select().from(aiProvider)`, `db.select().from(aiProviderModel)`, `db.select().from(role)`, `db.select().from(permission)`, `db.select().from(rolePermission)`, `db.select().from(invitation)`, `db.select().from(workspaceMember)`, `db.select().from(organizationMember)`, `db.select().from(userProfile)`, `db.select().from(userPreferences)`, `db.select().from(externalIdentity)`, `db.select().from(apiKey)`, `db.select().from(adminSession)`, `db.select().from(admin)` | Various repositories |
| `src/app/api/landing/sections/[key]/route.ts` | landing/sections/[key] | `db.select().from(landingSection)`, `db.update(landingSection)` | `landing.repository.ts` |
| `src/app/api/landing/sections/reorder/route.ts` | landing/sections/reorder | `db.select().from(landingSection)`, `db.update(landingSection)` | `landing.repository.ts` |
| `src/app/api/landing/campaign/route.ts` | landing/campaign | `db.select().from(landingSection)` | `landing.repository.ts` |
| `src/app/api/landing/currency/route.ts` | landing/currency | `db.select().from(currency)` | `currency.repository.ts` |
| `src/app/api/landing/pricing/route.ts` | landing/pricing | `db.select().from(pricing)` | `pricing.repository.ts` |
| `src/app/api/landing/seo/route.ts` | landing/seo | `db.select().from(landingSection)` | `landing.repository.ts` |
| `src/app/api/landing/subscription/route.ts` | landing/subscription | `db.select().from(subscription)` | `subscription.repository.ts` |
| `src/app/api/auth/route.ts` | auth | `db.select().from(user)`, `db.insert(user)`, `db.update(user)`, `db.select().from(account)`, `db.update(account)`, `db.select().from(session)`, `db.insert(session)`, `db.delete(session)` | `user.repository.ts`, `session.repository.ts` |
| `src/app/api/auth/login/route.ts` | auth/login | `db.select().from(user)`, `db.select().from(account)`, `db.update(account)` | `user.repository.ts`, `account.repository.ts` |
| `src/app/api/auth/register/route.ts` | auth/register | `db.select().from(user)`, `db.insert(user)`, `db.select().from(account)`, `db.insert(account)` | `user.repository.ts`, `account.repository.ts` |
| `src/app/api/auth/forgot-password/route.ts` | auth/forgot-password | `db.select().from(user)`, `db.update(user)` | `user.repository.ts` |
| `src/app/api/auth/reset-password/route.ts` | auth/reset-password | `db.select().from(user)`, `db.update(user)` | `user.repository.ts` |
| `src/app/api/auth/verify-email/route.ts` | auth/verify-email | `db.select().from(user)`, `db.update(user)` | `user.repository.ts` |
| `src/app/api/auth/sign-in/route.ts` | auth/sign-in | `db.select().from(user)`, `db.select().from(account)` | `user.repository.ts`, `account.repository.ts` |
| `src/app/api/auth/sign-out/route.ts` | auth/sign-out | `db.select().from(session)`, `db.delete(session)` | `session.repository.ts` |
| `src/app/api/auth/verify-email/resend/route.ts` | auth/verify-email/resend | `db.select().from(user)` | `user.repository.ts` |
| `src/app/api/billing/route.ts` | billing | `db.select().from(billing)`, `db.insert(billing)` | `billing.repository.ts` |
| `src/app/api/billing/[id]/route.ts` | billing/[id] | `db.select().from(billing)`, `db.update(billing)` | `billing.repository.ts` |
| `src/app/api/coupons/route.ts` | coupons | `db.select().from(coupon)`, `db.insert(coupon)` | `coupon.repository.ts` |
| `src/app/api/coupons/[id]/route.ts` | coupons/[id] | `db.select().from(coupon)`, `db.update(coupon)`, `db.delete(coupon)` | `coupon.repository.ts` |
| `src/app/api/notifications/route.ts` | notifications | `db.select().from(notification)`, `db.update(notification)` | `notification.repository.ts` |
| `src/app/api/notifications/[id]/route.ts` | notifications/[id] | `db.select().from(notification)`, `db.update(notification)`, `db.delete(notification)` | `notification.repository.ts` |
| `src/app/api/organizations/route.ts` | organizations | `db.select().from(organization)`, `db.insert(organization)`, `db.update(organization)`, `db.delete(organization)` | `organization.repository.ts` |
| `src/app/api/organizations/[id]/route.ts` | organizations/[id] | `db.select().from(organization)`, `db.update(organization)`, `db.delete(organization)` | `organization.repository.ts` |
| `src/app/api/preferences/route.ts` | preferences | `db.select().from(userPreferences)`, `db.insert(userPreferences)`, `db.update(userPreferences)` | `preferences.repository.ts` |
| `src/app/api/profile/route.ts` | profile | `db.select().from(userProfile)`, `db.update(userProfile)` | `user.repository.ts` |
| `src/app/api/production/execute/route.ts` | production/execute | `db.select().from(production)` | `production.repository.ts` |
| `src/app/api/queues/route.ts` | queues | `db.select().from(queue)`, `db.select().from(job)` | `queue.repository.ts`, `job.repository.ts` |
| `src/app/api/roles/route.ts` | roles | `db.select().from(role)`, `db.insert(role)`, `db.update(role)`, `db.delete(role)` | `role.repository.ts` |
| `src/app/api/roles/[id]/route.ts` | roles/[id] | `db.select().from(role)`, `db.update(role)`, `db.delete(role)` | `role.repository.ts` |
| `src/app/api/search/route.ts` | search | `db.select().from(...)` | Various repositories |
| `src/app/api/stats/route.ts` | stats | `db.select().from(user)`, `db.select().from(workspace)`, `db.select().from(emailQueue)`, `db.select().from(emailProvider)`, `db.select().from(emailProviderHealth)`, `db.select().from(emailTemplate)`, `db.select().from(emailLog)`, `db.select().from(emailQueue)` | Multiple repositories |
| `src/app/api/subscriptions/route.ts` | subscriptions | `db.select().from(subscription)`, `db.insert(subscription)`, `db.update(subscription)` | `subscription.repository.ts` |
| `src/app/api/subscriptions/[id]/route.ts` | subscriptions/[id] | `db.select().from(subscription)`, `db.update(subscription)`, `db.delete(subscription)` | `subscription.repository.ts` |
| `src/app/api/templates/route.ts` | templates | `db.select().from(template)`, `db.insert(template)`, `db.update(template)`, `db.delete(template)` | `template.repository.ts` |
| `src/app/api/templates/[id]/route.ts` | templates/[id] | `db.select().from(template)`, `db.update(template)`, `db.delete(template)` | `template.repository.ts` |
| `src/app/api/users/route.ts` | users | `db.select().from(user)`, `db.insert(user)`, `db.update(user)`, `db.delete(user)` | `user.repository.ts` |
| `src/app/api/users/[id]/route.ts` | users/[id] | `db.select().from(user)`, `db.update(user)`, `db.delete(user)` | `user.repository.ts` |
| `src/app/api/workspaces/route.ts` | workspaces | `db.select().from(workspace)`, `db.insert(workspace)`, `db.update(workspace)`, `db.delete(workspace)` | `workspace.repository.ts` |
| `src/app/api/workspaces/[id]/route.ts` | workspaces/[id] | `db.select().from(workspace)`, `db.update(workspace)`, `db.delete(workspace)` | `workspace.repository.ts` |
| `src/app/api/workspaces/[id]/edit/route.ts` | workspaces/[id]/edit | `db.select().from(workspace)`, `db.update(workspace)` | `workspace.repository.ts` |

### 2.3 Other Files with Direct DB Access

| File | Module | DB Operations | Should Use Repository |
|------|--------|---------------|----------------------|
| `src/core/aggregation.ts` | ai/billing | `db.insert(productionMetrics)`, `db.insert(userActivityMetrics)` | `production.repository.ts`, `analytics.repository.ts` |
| `src/core/aggregation-cron.ts` | ai/billing | `db.insert(workspaceMetrics)` | `analytics.repository.ts` |
| `src/core/events.ts` | events | `db.insert(failedLoginAttempt)` | `auth.repository.ts` |
| `src/core/guards.ts` | auth | `db.select().from(admin)` | `admin.repository.ts` |
| `src/core/invoice.ts` | billing | `db.insert(invoice)`, `db.select().from(invoice)`, `db.update(invoice)` | `invoice.repository.ts` |
| `src/core/login.ts` | auth | `db.insert(adminSession)`, `db.delete(adminSession)`, `db.select().from(admin)` | `session.repository.ts`, `admin.repository.ts` |
| `src/core/logout.ts` | auth | `db.select().from(adminSession)`, `db.delete(adminSession)` | `session.repository.ts` |
| `src/core/proxy.ts` | api | `db.select().from(admin)` | `admin.repository.ts` |
| `src/core/session.ts` | auth | `db.select().from(adminSession)`, `db.select().from(admin)`, `db.update(adminSession)`, `db.delete(adminSession)` | `session.repository.ts`, `admin.repository.ts` |
| `src/core/subscription.ts` | subscription | `db.select().from(subscription)`, `db.insert(subscription)`, `db.update(subscription)` | `subscription.repository.ts` |
| `src/core/service.ts` | (generic) | `db.select().from(...)` | Various repositories |
| `src/scripts/seed.ts` | scripts | Extensive DB access (insert/delete across all tables) | All repositories (seed is a special case — may be exempt) |

---

## 3. Severity Classification

### Critical (Must Fix in B2)
- API routes with direct DB access — these violate the architecture blueprint's data flow
- Services with direct DB access — these violate the governance rules

### High (Should Fix in B2)
- `rbac.engine.ts` — direct DB access in a core engine
- `payment.service.ts` — direct DB access in a payment service
- `admin.service.ts` — direct DB access in an admin service

### Medium (Fix in B3)
- `aggregation.ts`, `aggregation-cron.ts` — background aggregation
- `events.ts` — event logging
- `guards.ts` — auth guards
- `invoice.ts` — billing invoice
- `login.ts`, `logout.ts`, `session.ts` — auth session management
- `proxy.ts` — API proxy
- `subscription.ts` — subscription management
- `service.ts` — generic service

### Low (Fix in B4+)
- `seed.ts` — seeding script (special case, may be exempt from repository pattern)

---

## 4. Summary

| Category | Count |
|----------|-------|
| API routes with direct DB access | ~40+ route files |
| Services with direct DB access | 5 |
| Engine/core files with direct DB access | 8 |
| Scripts with direct DB access | 1 |
| **Total violating files** | **~54+** |

The most impactful violations are in the API routes and services. Fixing these requires creating repositories for the affected modules and routing all DB access through them.

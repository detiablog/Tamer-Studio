# Database Inventory — Tamer Studio

> **Last Updated:** 2026-08-03
> **ORM:** Drizzle ORM | **Database:** PostgreSQL
> **Schema Files:** 62 | **pgTable Definitions:** 388 | **Migrations:** 0000–0038
> **Schema Location:** `src/lib/db/schema/`

---

## Summary

| Metric | Value |
|---|---|
| Total Schema Files | 62 |
| Total pgTable Definitions | 388 |
| Total Migrations | 39 (0000–0038) |
| Total Modules | 63 |
| Primary Key Type | `text` (CUID/UUID) |
| Timestamp Pattern | `created_at` / `updated_at` with `defaultNow()` |
| Soft Delete | `deletedAt` on select tables |
| JSON Columns | Extensively used (`jsonb`) for metadata, config, settings |

### Key Conventions

- All tables use `text` primary keys (application-generated IDs)
- Timestamps: `created_at` (defaultNow) + `updated_at` (defaultNow + $onUpdate)
- Foreign keys use `.references(() => table.column, { onDelete: "cascade" })`
- Indexes follow pattern: `table_name_column_idx`
- Unique constraints: `table_name_column_unique`
- Relations defined via Drizzle `relations()` API

---

## Table of Contents

1. [Auth Module](#1-auth-module)
2. [Identity Module](#2-identity-module)
3. [Admin Module](#3-admin-module)
4. [Billing Module](#4-billing-module)
5. [Billing Admin Module](#5-billing-admin-module)
6. [Commerce Module](#6-commerce-module)
7. [Commerce Plans Module](#7-commerce-plans-module)
8. [Landing Module](#8-landing-module)
9. [CMS Module](#9-cms-module)
10. [AI Providers](#10-ai-providers)
11. [AI Runtime](#11-ai-runtime)
12. [AI Gateway](#12-ai-gateway)
13. [AI Admin](#13-ai-admin)
14. [Storage](#14-storage)
15. [Asset](#15-asset)
16. [Asset Intelligence](#16-asset-intelligence)
17. [Notification](#17-notification)
18. [Email](#18-email)
19. [Audit](#19-audit)
20. [Feature Flags](#20-feature-flags)
21. [Jobs](#21-jobs)
22. [Workflows](#22-workflows)
23. [Analytics](#23-analytics)
24. [Analytics Center](#24-analytics-center)
25. [Pricing](#25-pricing)
26. [Support](#26-support)
27. [Security](#27-security)
28. [Localization](#28-localization)
29. [Media](#29-media)
30. [Monitoring](#30-monitoring)
31. [DevOps](#31-devops)
32. [Performance](#32-performance)
33. [BI](#33-bi)
34. [Dashboard](#34-dashboard)
35. [Image Studio](#35-image-studio)
36. [Video Studio](#36-video-studio)
37. [Drama Studio](#37-drama-studio)
38. [Story Engine](#38-story-engine)
39. [Project Studio](#39-project-studio)
40. [Calendar](#40-calendar)
41. [Publishing](#41-publishing)
42. [API Platform](#42-api-platform)
43. [Orchestrator](#43-orchestrator)
44. [Automation](#44-automation)
45. [Creative Memory](#45-creative-memory)
46. [Learning Engine](#46-learning-engine)
47. [Trend Analyzer](#47-trend-analyzer)
48. [Conversion Optimizer](#48-conversion-optimizer)
49. [Agent Platform](#49-agent-platform)
50. [Affiliate Studio](#50-affiliate-studio)
51. [Campaigns](#51-campaigns)
52. [Payments](#52-payments)
53. [Observability](#53-observability)
54. [Operations](#54-operations)
55. [Scaling](#55-scaling)
56. [Beta](#56-beta)
57. [Launch](#57-launch)
58. [Hypercare](#58-hypercare)
59. [Product Intelligence](#59-product-intelligence)
60. [Prompt Intelligence](#60-prompt-intelligence)
61. [Quality Assurance](#61-quality-assurance)
62. [Auth Events](#62-auth-events)

---

## 1. Auth Module

**Schema File:** `auth.ts` | **Owner:** Better Auth
**Tables:** 8 | **Purpose:** Core authentication, sessions, OAuth accounts, 2FA, trusted devices, security events

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `user` | Core user record | `id`, `name`, `email` (unique), `emailVerified`, `image`, `role`, `status`, `preferredLanguage`, `preferredCurrency`, `preferredCountry`, `preferredTimezone`, `autoDetectLocale` | Has many `session`, `account`, `emailVerificationLog`; has one `userTwoFactor`; has many `trustedDevice`, `securityEvent` | — |
| `session` | Active user sessions | `id`, `expiresAt`, `token` (unique), `ipAddress`, `userAgent`, `userId` (FK → user) | Belongs to `user` | `session_userId_idx` |
| `account` | OAuth / linked accounts | `id`, `accountId`, `providerId`, `userId` (FK → user), `accessToken`, `refreshToken`, `idToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `scope`, `password` | Belongs to `user` | `account_userId_idx` |
| `verification` | Email/password verification tokens | `id`, `identifier`, `value`, `expiresAt` | — | `verification_identifier_idx` |
| `emailVerificationLog` | Email verification audit trail | `id`, `userId` (FK → user), `tokenHash`, `expiresAt`, `usedAt`, `ipAddress`, `userAgent`, `resendCount` | Belongs to `user` | `email_verification_log_user_idx`, `email_verification_log_token_idx` |
| `userTwoFactor` | TOTP / 2FA configuration | `id`, `userId` (FK → user, unique), `enabled`, `encryptedSecret`, `backupCodes`, `enabledAt`, `lastVerifiedAt` | Belongs to `user` | `user_two_factor_user_idx` |
| `trustedDevice` | Remembered devices | `id`, `userId` (FK → user), `token` (unique), `deviceName`, `browser`, `os`, `ipAddress`, `userAgent`, `expiresAt`, `lastUsedAt` | Belongs to `user` | `trusted_device_user_idx`, `trusted_device_token_idx` |
| `securityEvent` | User security event log | `id`, `userId` (FK → user), `eventType`, `description`, `ipAddress`, `userAgent`, `metadata` | Belongs to `user` | `security_event_user_idx`, `security_event_type_idx`, `security_event_created_idx` |

---

## 2. Identity Module

**Schema File:** `identity.ts` | **Owner:** RBAC
**Tables:** 11 | **Purpose:** User profiles, RBAC, workspaces, API keys, invitations, ownership transfers

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `userProfile` | Extended profile for users | `userId` (PK, FK → user), `avatar`, `timezone`, `language`, `country`, `status`, `verificationStatus`, `suspendedAt`, `suspendedBy`, `deletedAt`, `deletedBy` | Belongs to `user` | `user_profile_status_idx`, `user_profile_userId_idx` |
| `externalIdentity` | OAuth provider links | `id`, `userId` (FK → user), `provider`, `providerUserId`, `linkedAt` | Belongs to `user` | `external_identity_userId_idx`, `external_identity_provider_idx` + unique(user, provider) |
| `userPreferences` | User JSON preferences blob | `userId` (PK, FK → user), `preferences` (jsonb) | Belongs to `user` | — |
| `role` | RBAC roles | `id`, `name`, `description`, `level`, `isSystem` | Has many `workspaceMember`, `invitation`, `rolePermission` | `role_level_idx` |
| `permission` | RBAC permissions | `id`, `key`, `description`, `category` | Has many `rolePermission` | `permission_key_idx`, `permission_category_idx` |
| `rolePermission` | Role ↔ permission join | `id`, `roleId` (FK → role), `permissionId` (FK → permission) | Belongs to `role`, `permission` | + unique(role, permission) |
| `workspace` | Multi-tenant workspace | `id`, `name`, `slug`, `description`, `type`, `ownerId` (FK → user), `settings`, `limits`, `status` | Has many `workspaceMember`, `apiKey`, `workspaceTransfer`; belongs to `user` (owner) | `workspace_ownerId_idx`, `workspace_slug_idx`, `workspace_status_idx` |
| `workspaceMember` | Workspace membership | `id`, `workspaceId` (FK → workspace), `userId` (FK → user), `roleId` (FK → role), `status`, `joinedAt`, `invitedBy` (FK → user) | Belongs to `workspace`, `user`, `role` | + unique(workspace, user) |
| `invitation` | Workspace invite tokens | `id`, `email`, `workspaceId` (FK → workspace), `roleId` (FK → role), `token`, `invitedBy` (FK → user), `status`, `expiresAt`, `acceptedAt` | Belongs to `workspace`, `role`, `user` | `invitation_workspaceId_idx`, `invitation_email_idx`, `invitation_status_idx`, `invitation_token_idx` |
| `apiKey` | Programmatic API keys | `id`, `userId` (FK → user), `workspaceId` (FK → workspace), `name`, `keyPrefix`, `keyHash`, `scopes`, `expiresAt`, `lastUsedAt`, `usageCount`, `isRevoked` | Belongs to `user`, `workspace` | `api_key_userId_idx`, `api_key_workspaceId_idx`, `api_key_keyPrefix_idx`, `api_key_isRevoked_idx` |
| `workspaceTransfer` | Ownership transfer audit | `id`, `workspaceId` (FK → workspace), `fromOwnerId` (FK → user), `toOwnerId` (FK → user), `transferredAt` | Belongs to `workspace`, two `user` refs | `workspace_transfer_workspaceId_idx` |

---

## 3. Admin Module

**Schema File:** `admin.ts` | **Owner:** Admin Panel
**Tables:** 2 | **Purpose:** Admin accounts and sessions (separate from user auth)

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `admin` | Admin panel accounts | `id`, `email` (unique), `passwordHash`, `name`, `role`, `isActive`, `lastLoginAt` | Has many `adminSession` | `admin_email_idx`, `admin_role_idx` |
| `adminSession` | Admin session tokens | `id`, `token` (unique), `adminId` (FK → admin), `expiresAt`, `ipAddress`, `userAgent` | Belongs to `admin` | `admin_session_token_idx`, `admin_session_adminId_idx` |

---

## 4. Billing Module

**Schema File:** `billing.ts` | **Owner:** Billing
**Tables:** 7 | **Purpose:** Wallet/credit system, usage tracking, subscriptions, invoicing

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `wallet` | Per-workspace credit wallet | `id`, `workspaceId` (unique), `availableCredits`, `reservedCredits`, `pendingCredits`, `currency` | Has many `creditTransaction`, `creditReservation` | `wallet_workspace_idx` |
| `creditTransaction` | Credit debit/credit log | `id`, `walletId` (FK → wallet), `workspaceId`, `type`, `amount`, `balanceBefore`, `balanceAfter`, `description`, `metadata` | Belongs to `wallet` | `credit_transaction_wallet_idx`, `credit_transaction_workspace_idx`, `credit_transaction_type_idx`, `credit_transaction_created_at_idx` |
| `creditReservation` | Pre-execution credit holds | `id`, `walletId` (FK → wallet), `workspaceId`, `executionId` (unique), `amount`, `status`, `convertedTransactionId`, `releasedAt` | Belongs to `wallet` | `reservation_wallet_idx`, `reservation_workspace_idx`, `reservation_status_idx` |
| `usageRecord` | Per-execution usage tracking | `id`, `executionId` (unique), `workflowId`, `requestId`, `userId`, `workspaceId`, `providerId`, `modelId`, `capabilityId`, `tokens`, `images`, `videoSeconds`, `audioSeconds`, `storageBytes`, `executionTimeMs`, `estimatedCost`, `actualCost`, `currency` | — | `usage_workspace_idx`, `usage_provider_idx`, `usage_created_at_idx` |
| `costRecord` | Detailed cost breakdown | `id`, `executionId`, `usageRecordId`, `providerId`, `capabilityId`, `inputUnits`, `outputUnits`, `inputCost`, `outputCost`, `totalCost`, `currency`, `pricingUsed` | — | `cost_record_execution_idx`, `cost_record_usage_idx`, `cost_record_provider_idx` |
| `subscription` | Workspace subscriptions | `id`, `workspaceId` (unique), `planId`, `status`, `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`, `metadata` | Has many `invoice` | `subscription_workspace_idx`, `subscription_status_idx` |
| `invoice` | Billing invoices | `id`, `workspaceId`, `subscriptionId` (FK → subscription), `status`, `currency`, `subtotal`, `tax`, `total`, `lineItems`, `metadata` | Belongs to `subscription` | `invoice_workspace_idx`, `invoice_status_idx`, `invoice_created_at_idx` |

---

## 5. Billing Admin Module

**Schema File:** `billing-admin.ts` | **Owner:** Billing Admin
**Tables:** 1 | **Purpose:** Admin-side billing management

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `billing` | Admin billing records | `id`, `workspaceId`, `plan`, `price`, `currency`, `billingCycle`, `status` | — | `billing_workspace_idx`, `billing_status_idx`, `billing_plan_idx` |

> **Note:** Also defines `pricingProfile` and `pricingRule` in `localization.ts` (see §28).

---

## 6. Commerce Module

**Schema File:** `commerce.ts` | **Owner:** Commerce
**Tables:** 10 | **Purpose:** Orders, checkout, payment processing, vouchers, coupons, tax rules, refunds

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `order` | Customer orders | `id`, `workspaceId`, `userId`, `status`, `currency`, `subtotal`, `tax`, `discount`, `total`, `items` (jsonb array), `expiresAt`, `paidAt`, `cancelledAt`, `refundedAt` | Has many `checkoutSession`, `paymentIntent`, `refund` | `order_workspace_idx`, `order_user_idx`, `order_status_idx`, `order_created_at_idx` |
| `checkoutSession` | Checkout flow sessions | `id`, `workspaceId`, `userId`, `orderId` (FK → order), `status`, `paymentProvider`, `paymentIntentId`, `currency`, `amount`, `expiresAt`, `completedAt` | Belongs to `order` | `checkout_session_workspace_idx`, `checkout_session_order_idx`, `checkout_session_status_idx` |
| `paymentIntent` | Payment provider intents | `id`, `orderId` (FK → order), `checkoutSessionId` (FK → checkoutSession), `workspaceId`, `userId`, `status`, `provider`, `providerReference`, `amount`, `currency`, `lastAttemptAt`, `succeededAt`, `failedAt` | Belongs to `order`, `checkoutSession`; has many `paymentAttempt` | `payment_intent_order_idx`, `payment_intent_workspace_idx`, `payment_intent_status_idx`, `payment_intent_provider_idx` |
| `paymentAttempt` | Individual payment attempts | `id`, `paymentIntentId` (FK → paymentIntent), `provider`, `status`, `requestPayload`, `responsePayload`, `providerReference`, `amount`, `currency`, `errorCode`, `errorMessage` | Belongs to `paymentIntent` | `payment_attempt_intent_idx`, `payment_attempt_status_idx` |
| `voucher` | Discount vouchers | `id`, `code` (unique), `type`, `value`, `currency`, `minPurchase`, `maxDiscount`, `expiresAt`, `usageLimit`, `userLimit`, `workspaceLimit`, `isActive` | Has many `voucherUsage` | `voucher_code_idx`, `voucher_active_idx` |
| `voucherUsage` | Voucher redemption log | `id`, `voucherId` (FK → voucher), `orderId`, `workspaceId`, `userId`, `discountAmount`, `currency` | Belongs to `voucher` | `voucher_usage_voucher_idx`, `voucher_usage_workspace_idx` + unique(order, voucher) |
| `coupon` | Promo coupons | `id`, `code` (unique), `type`, `value`, `currency`, `minPurchase`, `maxDiscount`, `expiresAt`, `usageLimit`, `isActive`, `applicableProducts`, `applicablePlans` | Has many `couponUsage` | `coupon_code_idx`, `coupon_active_idx` |
| `couponUsage` | Coupon redemption log | `id`, `couponId` (FK → coupon), `orderId`, `workspaceId`, `userId`, `discountAmount`, `currency` | Belongs to `coupon` | `coupon_usage_coupon_idx`, `coupon_usage_workspace_idx` + unique(order, coupon) |
| `taxRule` | Tax configuration rules | `id`, `name`, `region`, `rate`, `type`, `currency`, `minAmount`, `maxAmount`, `isActive`, `priority` | — | `tax_rule_region_idx`, `tax_rule_active_idx` |
| `refund` | Order refunds | `id`, `orderId` (FK → order), `paymentIntentId`, `workspaceId`, `userId`, `status`, `amount`, `currency`, `reason`, `refundType`, `externalRefundId`, `processedAt` | Belongs to `order` | `refund_order_idx`, `refund_workspace_idx`, `refund_status_idx` |

---

## 7. Commerce Plans Module

**Schema File:** `commerce-plans.ts` | **Owner:** Commerce Plans
**Tables:** 4 | **Purpose:** Subscription plan definitions, pricing tiers, billing options

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `plan` | Subscription plan definitions | `id`, `slug` (unique), `name`, `description`, `tier`, `features`, `storageLimitMb`, `projectLimit`, `workspaceLimit`, `aiCapabilities`, `permissions`, `isActive`, `displayOrder`, `badge` | Has many `planPricing` | `plan_tier_idx`, `plan_is_active_idx` |
| `billingOption` | Billing frequency options | `id`, `slug` (unique), `name`, `description`, `frequency`, `renewalBehavior`, `isActive`, `displayOrder` | Has many `planPricing` | `billing_option_frequency_idx` |
| `planPricing` | Plan × billing option pricing | `id`, `planId` (FK → plan), `billingOptionId` (FK → billingOption), `price`, `currency`, `creditsIncluded`, `isActive` | Belongs to `plan`, `billingOption` | + unique(plan, billingOption) |
| `commerceOrder` | Plan purchase orders | `id`, `workspaceId`, `userId`, `planId` (FK → plan), `billingOptionId` (FK → billingOption), `status`, `subtotal`, `tax`, `discount`, `total`, `currency`, `creditsGranted`, `items`, `expiresAt`, `paidAt`, `cancelledAt`, `refundedAt` | Belongs to `plan`, `billingOption` | `commerce_order_workspace_id_idx`, `commerce_order_user_id_idx`, `commerce_order_status_idx`, `commerce_order_plan_id_idx` |

---

## 8. Landing Module

**Schema File:** `landing.ts` | **Owner:** Landing
**Tables:** 6 | **Purpose:** Landing page sections, media, blog, newsletter, popups, analytics

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `landingSection` | Configurable landing page sections | `id`, `sectionKey` (unique), `title`, `description`, `component`, `type`, `visible`, `locked`, `order`, `config`, `styles` | Has many `landingMedia` | `landing_section_section_key_idx`, `landing_section_order_idx`, `landing_section_type_idx`, `landing_section_visible_idx`, `landing_section_locked_idx` |
| `landingMedia` | Media attachments for sections | `id`, `sectionKey` (FK → landingSection.sectionKey), `url`, `alt`, `type`, `order` | Belongs to `landingSection` | `landing_media_section_key_idx`, `landing_media_type_idx`, `landing_media_order_idx` |
| `blogPost` | Blog articles | `id`, `title`, `slug` (unique), `excerpt`, `content`, `author`, `coverImage`, `category`, `tags`, `status`, `featured`, `readTime`, `seo`, `metadata`, `publishedAt`, `createdBy` | — | `blog_post_slug_idx`, `blog_post_status_idx`, `blog_post_category_idx` |
| `newsletterSubscriber` | Newsletter subscribers | `id`, `email` (unique), `userId`, `status`, `metadata`, `subscribedAt`, `unsubscribedAt` | — | `newsletter_subscriber_email_idx` |
| `landingPopup` | Popup/modal configurations | `id`, `name`, `type`, `title`, `description`, `content`, `trigger`, `delay`, `frequency`, `isActive`, `startsAt`, `endsAt`, `createdBy` | — | `landing_popup_type_idx`, `landing_popup_active_idx` |
| `landingAnalytics` | Landing page event tracking | `id`, `page`, `eventType`, `eventData`, `sectionKey`, `userId`, `sessionId`, `ipAddress`, `userAgent`, `referrer` | — | `landing_analytics_page_idx`, `landing_analytics_type_idx`, `landing_analytics_created_idx` |

---

## 9. CMS Module

**Schema File:** `cms.ts` | **Owner:** CMS
**Tables:** 9 | **Purpose:** Headless CMS with pages, sections, blocks, components, media, versioning, publishing pipeline, audit

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `cmsPage` | CMS pages | `id`, `title`, `slug` (unique), `status`, `contentType`, `parentId`, `seoTitle`, `seoDescription`, `seoOgImage`, `seoCanonical`, `seoRobots`, `localizationLocale`, `localizationFallbackLocale`, `localizationTranslations`, `permissionsRead`, `permissionsWrite`, `permissionsPublish`, `version`, `publishedVersion`, `scheduledAt`, `publishedAt`, `authorId`, `deletedAt` | Has many `cmsSection` | `cms_page_slug_idx`, `cms_page_status_idx`, `cms_page_content_type_idx`, `cms_page_parent_id_idx`, `cms_page_author_id_idx` |
| `cmsSection` | Page sections (content blocks) | `id`, `pageId` (FK → cmsPage), `sectionKey` (unique), `type`, `title`, `description`, `component`, `order`, `visible`, `locked`, `config`, `styles` | Belongs to `cmsPage`; has many `cmsBlock` | `cms_section_page_id_idx`, `cms_section_section_key_idx`, `cms_section_order_idx`, `cms_section_type_idx`, `cms_section_visible_idx` |
| `cmsBlock` | Section content blocks | `id`, `sectionId` (FK → cmsSection), `type`, `properties`, `order`, `visible` | Belongs to `cmsSection` | `cms_block_section_id_idx`, `cms_block_order_idx` |
| `cmsComponent` | Reusable component definitions | `id`, `name`, `type`, `schema`, `preview`, `localization`, `permissions` | — | `cms_component_type_idx` |
| `cmsMedia` | CMS media library | `id`, `filename`, `url`, `alt`, `type`, `size`, `folder`, `metadata` | — | `cms_media_type_idx`, `cms_media_folder_idx` |
| `cmsVersion` | Content version snapshots | `id`, `contentId`, `contentType`, `version`, `data` (jsonb), `authorId`, `message` | — | `cms_version_content_id_idx`, `cms_version_content_type_idx`, `cms_version_created_at_idx` |
| `cmsPublishPipeline` | Publishing pipeline state | `id`, `contentId`, `contentType`, `status` | Has many `cmsPublishStep` | `cms_publish_pipeline_content_id_idx`, `cms_publish_pipeline_status_idx` |
| `cmsPublishStep` | Individual publish pipeline steps | `id`, `pipelineId` (FK → cmsPublishPipeline), `name`, `status`, `startedAt`, `completedAt`, `error` | Belongs to `cmsPublishPipeline` | `cms_publish_step_pipeline_id_idx`, `cms_publish_step_status_idx` |
| `cmsAuditEntry` | CMS change audit log | `id`, `action`, `contentType`, `contentId`, `authorId`, `timestamp`, `metadata` | — | `cms_audit_entry_content_id_idx`, `cms_audit_entry_content_type_idx`, `cms_audit_entry_timestamp_idx`, `cms_audit_entry_author_id_idx` |

---

## 10. AI Providers

**Schema File:** `ai-providers.ts` | **Owner:** AI
**Tables:** 2 | **Purpose:** AI provider registration and model catalog

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `aiProvider` | AI provider configurations | `id`, `name` (unique), `providerType`, `status`, `priority`, `enabled`, `apiKeyConfigured`, `capabilities`, `models`, `rateLimit`, `costConfiguration`, `config`, `health` | Has many `aiProviderModel` | `ai_provider_name_idx`, `ai_provider_status_idx`, `ai_provider_enabled_idx` |
| `aiProviderModel` | Models per provider | `id`, `providerId` (FK → aiProvider), `modelId`, `capability`, `available`, `deprecated`, `deprecationDate`, `replacementModel` | Belongs to `aiProvider` | + unique(provider, model) |

---

## 11. AI Runtime

**Schema File:** `ai-runtime.ts` | **Owner:** AI
**Tables:** 3 | **Purpose:** AI provider health monitoring, prompt templates, generation history

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `aiProviderHealth` | Provider health status tracking | `id`, `providerId`, `status`, `latencyMs`, `successRate`, `failureRate`, `totalRequests`, `totalFailures`, `lastCheckedAt`, `lastSuccessAt`, `lastFailureAt`, `lastError`, `metadata` | — | `ai_provider_health_provider_idx` |
| `aiPromptTemplate` | Reusable prompt templates | `id`, `name`, `description`, `category`, `prompt`, `variables`, `modelHint`, `isPublic`, `isFavorite`, `useCount`, `userId`, `metadata` | — | `ai_prompt_template_user_idx`, `ai_prompt_template_category_idx` |
| `aiGenerationHistory` | AI generation execution log | `id`, `userId`, `jobId`, `type`, `model`, `provider`, `prompt`, `parameters`, `status`, `creditsUsed`, `executionTimeMs`, `outputTokens`, `inputTokens`, `assets`, `error`, `metadata` | — | `ai_gen_history_user_idx`, `ai_gen_history_type_idx`, `ai_gen_history_status_idx`, `ai_gen_history_created_idx` |

> **Note:** `aiRuntimeSetting` is defined in `ai-admin.ts` (see §13).

---

## 12. AI Gateway

**Schema File:** `ai-gateway.ts` | **Owner:** AI Gateway
**Tables:** 9 | **Purpose:** AI request routing, model registry, capability registry, circuit breakers, queuing, safety, preferences

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `aiModelRegistry` | Detailed model capability registry | `id`, `providerId`, `modelId`, `displayName`, `capability`, `status`, `costPer1kInput`, `costPer1kOutput`, `avgLatencyMs`, `contextWindow`, `maxOutput`, `supportsStreaming`, `supportsVision`, `supportsJson`, `supportsToolCalling`, `supportsImageInput`, `supportsVideo`, `supportsAudio`, `supportsBatch`, `supportsStructuredOutput`, `qualityScore`, `speedScore`, `reliabilityScore`, `version`, `deprecationStatus`, `replacementModel`, `metadata` | — | + unique(provider, model) |
| `aiCapabilityRegistry` | AI capability definitions | `id`, `name` (unique), `displayName`, `description`, `category`, `isEnabled`, `metadata` | — | — |
| `aiRoutingDecision` | Routing decision audit log | `id`, `requestId`, `userId`, `capability`, `selectedProvider`, `selectedModel`, `fallbackProvider`, `fallbackModel`, `reason`, `estimatedCost`, `actualCost`, `estimatedLatencyMs`, `actualLatencyMs`, `qualityScore`, `wasFallback`, `retryCount`, `routingStrategy`, `metadata` | — | `ai_routing_decision_request_idx`, `ai_routing_decision_user_idx`, `ai_routing_decision_provider_idx`, `ai_routing_decision_created_idx` |
| `aiRequestLog` | AI request execution log | `id`, `requestId`, `userId`, `workspaceId`, `provider`, `model`, `capability`, `status`, `promptTokens`, `completionTokens`, `totalTokens`, `creditsUsed`, `costUsd`, `latencyMs`, `queueTimeMs`, `wasFallback`, `retryCount`, `error`, `metadata` | — | `ai_request_log_request_idx`, `ai_request_log_user_idx`, `ai_request_log_provider_idx`, `ai_request_log_status_idx`, `ai_request_log_created_idx` |
| `aiCircuitBreaker` | Provider circuit breaker state | `id`, `providerId` (unique), `state`, `failureCount`, `successCount`, `lastFailureAt`, `lastSuccessAt`, `lastStateChangeAt`, `failureThreshold`, `recoveryTimeoutMs`, `halfOpenMaxAttempts`, `metadata` | — | `ai_circuit_breaker_provider_idx`, `ai_circuit_breaker_state_idx` |
| `aiQueueItem` | AI request queue | `id`, `userId`, `requestId`, `status`, `priority`, `capability`, `provider`, `model`, `estimatedCredits`, `position`, `scheduledAt`, `startedAt`, `completedAt`, `metadata` | — | `ai_queue_item_user_idx`, `ai_queue_item_status_idx`, `ai_queue_item_priority_idx`, `ai_queue_item_scheduled_idx` |
| `aiUserPreference` | Per-user AI routing preferences | `id`, `userId` (unique), `mode`, `maxCostPerRequest`, `maxLatencyMs`, `preferredProviders`, `preferredModels`, `excludedProviders`, `excludedModels`, `metadata` | — | `ai_user_pref_user_idx` |
| `aiRuntimeMetric` | AI runtime performance metrics | `id`, `metricName`, `category`, `value`, `unit`, `provider`, `model`, `dimensions`, `createdAt` | — | `ai_metric_name_idx`, `ai_metric_category_idx`, `ai_metric_provider_idx`, `ai_metric_created_idx` |

---

## 13. AI Admin

**Schema File:** `ai-admin.ts` | **Owner:** AI Admin
**Tables:** 5 | **Purpose:** AI admin actions, feature flags, routing rules, safety policies, runtime settings

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `aiAdminAction` | Admin action audit log | `id`, `adminId`, `action`, `targetType`, `targetId`, `details`, `ipAddress`, `userAgent` | — | `ai_admin_action_admin_idx`, `ai_admin_action_action_idx`, `ai_admin_action_created_idx` |
| `aiFeatureFlag` | AI feature flags | `id`, `name` (unique), `description`, `category`, `isEnabled`, `config`, `createdBy` | — | `ai_feature_flag_category_idx` |
| `aiRoutingRule` | AI request routing rules | `id`, `name`, `priority`, `conditions`, `targetProvider`, `targetModel`, `fallbackProvider`, `isActive`, `metadata`, `createdBy` | — | `ai_routing_rule_active_idx`, `ai_routing_rule_priority_idx` |
| `aiSafetyPolicy` | AI safety/content policies | `id`, `name`, `type`, `rules`, `isEnabled`, `severity`, `createdBy` | — | `ai_safety_policy_type_idx` |
| `aiRuntimeSetting` | Key-value runtime settings | `id`, `key` (unique), `value`, `description`, `updatedBy` | — | — |

---

## 14. Storage

**Schema File:** `storage.ts` | **Owner:** Storage
**Tables:** 5 | **Purpose:** File storage, folder hierarchy, quotas, provider health

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `storageFile` | Uploaded files | `id`, `userId`, `storageKey` (unique), `originalName`, `mimeType`, `sizeBytes`, `checksum`, `provider`, `status`, `kind`, `metadata`, `thumbnailKey`, `previewKey`, `folderId`, `tags`, `expiresAt`, `deletedAt` | Belongs to `storageFolder` | `storage_file_user_idx`, `storage_file_provider_idx`, `storage_file_kind_idx`, `storage_file_status_idx`, `storage_file_folder_idx` |
| `storageFolder` | Folder hierarchy | `id`, `userId`, `name`, `parentId`, `path` | Self-referencing parent | `storage_folder_user_idx`, `storage_folder_parent_idx` |
| `storageQuota` | Per-user storage quotas | `id`, `userId` (unique), `totalBytes`, `usedBytes`, `imageBytes`, `videoBytes`, `documentBytes`, `fileCount` | — | `storage_quota_user_idx` |
| `storageUsage` | Per-user usage summary | `id`, `userId`, `totalUsed`, `imageCount`, `videoCount`, `documentCount`, `limitBytes` | — | `storage_usage_user_idx` |
| `storageProviderHealth` | Storage provider health | `id`, `provider`, `status`, `latencyMs`, `lastCheckedAt`, `lastError`, `metadata` | — | `storage_provider_health_provider_idx` |

---

## 15. Asset

**Schema File:** `asset.ts` | **Owner:** Asset
**Tables:** 11 | **Purpose:** AI-generated asset management, versioning, lineage, collections, tags, lifecycle, favorites, downloads

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `asset` | Core asset record | `assetId` (PK), `kind`, `status`, `metadata`, `sourceExecutionId`, `sourceWorkflowId`, `sourceGatewayId`, `sourcePromptId`, `sourceCapabilityId`, `currentVersion`, `storageRef`, `preview`, `createdBy` | Has many `assetVersion`, `assetLineage`, `assetCollectionItem`, `assetTag`, `assetLifecycleEvent`, `assetFavorite`, `assetDownload` | `asset_kind_idx`, `asset_status_idx`, `asset_created_by_idx`, `asset_source_execution_idx`, `asset_source_workflow_idx` |
| `assetVersion` | Version history | `id`, `assetId` (FK → asset), `version`, `changelog`, `metadata`, `storageRef`, `createdBy` | Belongs to `asset` | `asset_version_asset_id_idx` |
| `assetLineage` | Parent-child relationships | `id`, `assetId` (FK → asset), `parentId` (FK → asset), `relationship`, `metadata` | Two `asset` refs | `asset_lineage_asset_id_idx`, `asset_lineage_parent_id_idx` |
| `assetCollection` | Named asset groups | `id`, `name`, `description`, `visibility`, `createdBy` | Has many `assetCollectionItem` | `asset_collection_created_by_idx` |
| `assetCollectionItem` | Collection membership | `id`, `collectionId` (FK → assetCollection), `assetId` (FK → asset) | Belongs to `assetCollection`, `asset` | + unique(collection, asset) |
| `assetTag` | Asset tags | `id`, `assetId` (FK → asset), `tag` | Belongs to `asset` | `asset_tag_asset_id_idx`, `asset_tag_tag_idx` |
| `assetLifecycleEvent` | Status change audit | `id`, `assetId` (FK → asset), `fromStatus`, `toStatus`, `trigger`, `metadata` | Belongs to `asset` | `asset_lifecycle_asset_id_idx` |
| `assetFavorite` | User favorites | `id`, `assetId` (FK → asset), `userId` | Belongs to `asset` | `asset_favorite_user_idx`, `asset_favorite_asset_idx` + unique(asset, user) |
| `assetDownload` | Download tracking | `id`, `assetId` (FK → asset), `userId`, `format`, `fileSize` | Belongs to `asset` | `asset_download_user_idx`, `asset_download_asset_idx` |
| `assetCleanupJob` | Scheduled cleanup jobs | `id`, `assetId` (FK → asset), `reason`, `scheduledAt`, `executedAt`, `status` | Belongs to `asset` | `asset_cleanup_status_idx`, `asset_cleanup_scheduled_idx` |

---

## 16. Asset Intelligence

**Schema File:** `asset-intelligence.ts` | **Owner:** Asset Intelligence
**Tables:** 11 | **Purpose:** AI-powered asset metadata extraction, classification, recognition, quality scoring, search indexing, smart collections

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `assetMetadata` | Extracted asset metadata | `id`, `userId`, `assetId`, `assetType`, `title`, `description`, `width`, `height`, `duration`, `aspectRatio`, `fileSize`, `format`, `language`, `dominantColors`, `colorPalette`, `projectId`, `promptReference`, `aiModel`, `provider`, `extractionStatus` | Has many `assetTagAssignment`, `assetClassification`, `assetRecognition` | `asset_meta_user_idx`, `asset_meta_asset_idx`, `asset_meta_type_idx`, `asset_meta_project_idx`, `asset_meta_extraction_idx` |
| `assetTag` | Smart tag definitions | `id`, `userId`, `name`, `category`, `isSystem`, `useCount`, `metadata` | Has many `assetTagAssignment` | `asset_tag_user_idx`, `asset_tag_name_idx` + unique(user, name) |
| `assetTagAssignment` | Tag ↔ asset mapping | `id`, `userId`, `assetId`, `tagId`, `isAuto`, `isLocked` | Belongs to `assetTag` | `asset_tag_assign_user_idx`, `asset_tag_assign_asset_idx`, `asset_tag_assign_tag_idx` + unique(asset, tag) |
| `assetCategory` | Hierarchical categories | `id`, `userId`, `name`, `parent`, `type`, `description`, `icon`, `sortOrder` | — | `asset_cat_user_idx`, `asset_cat_type_idx` |
| `assetClassification` | AI classification results | `id`, `userId`, `assetId`, `projectId`, `campaign`, `story`, `character`, `brand`, `platform`, `contentType`, `mediaType`, `style`, `theme`, `genre`, `status`, `confidence` | — | `asset_class_user_idx`, `asset_class_asset_idx`, `asset_class_project_idx`, `asset_class_character_idx`, `asset_class_brand_idx` |
| `assetRecognition` | Object/face recognition | `id`, `userId`, `assetId`, `recognitionType`, `label`, `confidence`, `boundingBox` | — | `asset_recog_user_idx`, `asset_recog_asset_idx`, `asset_recog_type_idx` |
| `assetDuplicate` | Duplicate detection | `id`, `userId`, `assetId`, `duplicateAssetId`, `matchType`, `similarityScore`, `status` | — | `asset_dup_user_idx`, `asset_dup_asset_idx`, `asset_dup_dup_idx`, `asset_dup_status_idx` |
| `assetRelationship` | Asset ↔ asset relationships | `id`, `userId`, `sourceAssetId`, `targetAssetId`, `relationshipType`, `strength` | — | `asset_rel_user_idx`, `asset_rel_source_idx`, `asset_rel_target_idx`, `asset_rel_type_idx` + unique(source, target, type) |
| `assetQualityScore` | AI quality assessment | `id`, `userId`, `assetId`, `resolution`, `sharpness`, `composition`, `lighting`, `brandConsistency`, `technicalQuality`, `overallScore` | — | `asset_quality_user_idx`, `asset_quality_asset_idx`, `asset_quality_score_idx` |
| `assetSearchIndex` | Full-text search index | `id`, `userId`, `assetId`, `searchText`, `tags`, `categories`, `metadata` | — | `asset_search_user_idx`, `asset_search_asset_idx`, `asset_search_text_idx` |
| `assetSettings` | Per-user intelligence settings | `id`, `userId` (unique), `autoTagging`, `autoClassification`, `duplicateDetection`, `qualityScoring`, `autoRelationships`, `autoIndexing`, `minQualityScore` | — | — |

> **Note:** Also defines `assetCollection` and `assetCollectionItem` (smart collections variant) in this file.

---

## 17. Notification

**Schema File:** `notification.ts` | **Owner:** Notification
**Tables:** 5 | **Purpose:** Notifications, templates, preferences, event queue

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `notification` | User notifications | `id`, `userId` (FK → user), `type`, `category`, `channel`, `title`, `message`, `data`, `priority`, `status`, `scheduledAt`, `sentAt`, `deliveredAt`, `readAt`, `archivedAt`, `deletedAt`, `metadata` | Belongs to `user` | `notification_user_id_idx`, `notification_status_idx`, `notification_category_idx`, `notification_created_at_idx` |
| `notificationTemplate` | Notification templates | `id`, `name`, `category`, `channel`, `subject`, `body`, `variables`, `locale`, `version`, `isActive` | Has many `notificationTemplateVersion` | `notification_template_category_idx`, `notification_template_channel_idx` |
| `notificationTemplateVersion` | Template version history | `id`, `templateId` (FK → notificationTemplate), `version`, `subject`, `body`, `variables` | Belongs to `notificationTemplate` | `notification_template_version_template_idx` |
| `notificationPreference` | Per-user notification prefs | `id`, `userId` (FK → user), `channel`, `category`, `enabled` | Belongs to `user` | + unique(user, channel, category) |
| `eventQueue` | Async event processing queue | `id`, `eventType`, `eventData`, `priority`, `attempts`, `maxAttempts`, `nextAttemptAt`, `lastError`, `status`, `processedAt`, `failedAt` | — | `event_queue_status_idx`, `event_queue_next_attempt_idx`, `event_queue_event_type_idx` |

---

## 18. Email

**Schema File:** `email.ts` | **Owner:** Email
**Tables:** 9 | **Purpose:** Email provider management, templates, queue, logging, attachments, statistics, health

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `emailProvider` | Email provider configs | `id`, `name` (unique), `type`, `isActive`, `priority` (unique), `routingMode`, `config`, `credentialsEncrypted`, `senderName`, `senderEmail`, `replyTo`, `dailyLimit`, `monthlyLimit`, `timeout`, `retryCount`, `webhookSecret`, `domain` | Has many `emailProviderHealth`, `emailQueue`, `emailLog`, `emailStatistics` | `email_provider_active_idx`, `email_provider_priority_idx`, `email_provider_type_idx` |
| `emailProviderHealth` | Provider health checks | `id`, `providerId` (FK → emailProvider), `status`, `latencyMs`, `lastSuccessAt`, `lastFailureAt`, `consecutiveFailures`, `errorMessage`, `errorCode`, `checkedAt` | Belongs to `emailProvider` | `email_provider_health_provider_idx`, `email_provider_health_status_idx`, `email_provider_health_checked_idx` |
| `emailTemplate` | Email templates | `id`, `key` (unique), `name`, `type`, `subject`, `html`, `text`, `variables`, `isActive`, `description`, `language`, `version`, `isSystem`, `category`, `builderBlocks`, `createdBy`, `updatedBy` | Has many `emailQueue`, `emailLog`, `emailTemplateVersion` | `email_template_type_idx`, `email_template_active_idx`, `email_template_category_idx` |
| `emailTemplateVersion` | Template version history | `id`, `templateId` (FK → emailTemplate), `version`, `subject`, `html`, `text`, `variables`, `createdBy` | Belongs to `emailTemplate` | + unique(template, version) |
| `emailQueue` | Outbound email queue | `id`, `type`, `to`, `subject`, `html`, `text`, `from`, `replyTo`, `cc`, `bcc`, `headers`, `metadata`, `status`, `priority`, `attempts`, `maxAttempts`, `scheduledAt`, `startedAt`, `completedAt`, `failedAt`, `error`, `response`, `providerId` (FK → emailProvider), `templateId` (FK → emailTemplate), `category`, `scheduledTimezone`, `attachments` | Belongs to `emailProvider`, `emailTemplate`; has many `emailAttachment` | `email_queue_status_idx`, `email_queue_type_idx`, `email_queue_priority_idx`, `email_queue_provider_idx`, `email_queue_created_idx`, `email_queue_scheduled_idx`, `email_queue_template_idx` |
| `emailLog` | Email delivery log | `id`, `queueId` (FK → emailQueue), `type`, `to`, `subject`, `from`, `replyTo`, `providerId` (FK → emailProvider), `providerName`, `status`, `attempts`, `latencyMs`, `responseCode`, `responseMessage`, `errorCode`, `errorMessage`, `metadata`, `templateId` (FK → emailTemplate), `renderedHtml`, `renderedText`, `headers`, `openedAt`, `clickedAt`, `category` | Belongs to `emailProvider`, `emailQueue`, `emailTemplate` | `email_log_status_idx`, `email_log_type_idx`, `email_log_provider_idx`, `email_log_created_idx`, `email_log_to_idx`, `email_log_template_idx` |
| `emailAttachment` | Email file attachments | `id`, `queueId` (FK → emailQueue), `filename`, `contentType`, `size`, `path` | Belongs to `emailQueue` | `email_attachment_queue_idx` |
| `emailStatistics` | Daily provider statistics | `id`, `providerId` (FK → emailProvider), `date`, `sent`, `delivered`, `failed`, `retry`, `bounce`, `avgLatencyMs`, `quotaUsed`, `quotaTotal` | Belongs to `emailProvider` | + unique(provider, date) |
| `emailToken` | Email verification tokens | `id`, `type`, `email`, `token` (unique), `userId`, `payload`, `expiresAt`, `usedAt` | — | `email_token_email_idx`, `email_token_type_idx`, `email_token_expires_idx`, `email_token_user_idx` |

---

## 19. Audit

**Schema File:** `audit.ts` | **Owner:** Audit
**Tables:** 1 | **Purpose:** System-wide audit trail

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `auditLog` | Global audit log | `id`, `action`, `actorId`, `actorType`, `resourceType`, `resourceId`, `metadata`, `ipAddress`, `userAgent` | — | `audit_log_action_idx`, `audit_log_actorId_idx`, `audit_log_createdAt_idx` |

---

## 20. Feature Flags

**Schema File:** `feature-flags.ts` | **Owner:** Feature Flags
**Tables:** 2 | **Purpose:** Feature flag definitions and change history

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `featureFlag` | Feature flag definitions | `id`, `key` (unique), `description`, `enabled`, `scope`, `targetId`, `rolloutPercentage`, `scheduledAt`, `expiresAt`, `createdBy` (FK → user) | Has many `featureFlagHistory` | `feature_flag_key_idx`, `feature_flag_scope_idx`, `feature_flag_enabled_idx` |
| `featureFlagHistory` | Flag change history | `id`, `flagId` (FK → featureFlag), `action`, `previousValue`, `newValue`, `changedBy` (FK → user) | Belongs to `featureFlag` | `feature_flag_history_flag_idx`, `feature_flag_history_created_at_idx` |

---

## 21. Jobs

**Schema File:** `jobs.ts` | **Owner:** Jobs
**Tables:** 2 | **Purpose:** Background job processing and queue management

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `job` | Background jobs | `id`, `type`, `payload`, `status`, `priority`, `progress`, `attempts`, `maxAttempts`, `result`, `error`, `scheduledAt`, `startedAt`, `completedAt` | — | `job_status_idx`, `job_type_idx`, `job_priority_idx`, `job_created_at_idx` |
| `queue` | Queue definitions and stats | `id`, `name`, `depth`, `throughput`, `avgWait`, `status`, `failed` | — | `queue_status_idx`, `queue_name_idx` |

---

## 22. Workflows

**Schema File:** `workflows.ts` | **Owner:** Workflows
**Tables:** 8 | **Purpose:** Visual workflow builder, execution engine, scheduling, templates

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `workflow` | Workflow definitions | `id`, `name`, `description`, `version`, `steps`, `variables`, `tags`, `status` | Has many `workflowExecution`, `workflowNode`, `workflowConnection`, `workflowVariable`, `workflowRun`, `workflowSchedule` | `workflow_status_idx`, `workflow_name_idx` |
| `workflowNode` | Visual workflow nodes | `id`, `workflowId` (FK → workflow), `type`, `label`, `positionX`, `positionY`, `config`, `metadata` | Belongs to `workflow` | `workflow_node_workflow_idx` |
| `workflowConnection` | Node-to-node connections | `id`, `workflowId` (FK → workflow), `sourceNodeId`, `targetNodeId`, `sourceHandle`, `targetHandle`, `label`, `condition`, `metadata` | Belongs to `workflow` | `workflow_connection_workflow_idx` |
| `workflowVariable` | Workflow variables | `id`, `workflowId` (FK → workflow), `name`, `type`, `defaultValue`, `value`, `isRequired`, `description` | Belongs to `workflow` | `workflow_variable_workflow_idx` |
| `workflowExecution` | Execution records | `id`, `workflowId` (FK → workflow), `status`, `context`, `result`, `error`, `startedAt`, `completedAt` | Belongs to `workflow` | `workflow_execution_workflow_idx`, `workflow_execution_status_idx`, `workflow_execution_created_at_idx` |
| `workflowRun` | User-triggered runs | `id`, `workflowId` (FK → workflow), `userId`, `status`, `currentNodeId`, `progress`, `totalNodes`, `creditsUsed`, `variables`, `result`, `error`, `startedAt`, `completedAt` | Belongs to `workflow`; has many `workflowRunLog` | `workflow_run_workflow_idx`, `workflow_run_user_idx`, `workflow_run_status_idx` |
| `workflowRunLog` | Per-node execution logs | `id`, `runId` (FK → workflowRun), `nodeId`, `nodeType`, `status`, `input`, `output`, `creditsUsed`, `executionTimeMs`, `error`, `startedAt`, `completedAt` | Belongs to `workflowRun` | `workflow_run_log_run_idx` |
| `workflowTemplate` | Reusable workflow templates | `id`, `name`, `description`, `category`, `nodes`, `connections`, `variables`, `thumbnail`, `usageCount`, `isActive` | — | `workflow_template_category_idx` |
| `workflowSchedule` | Scheduled workflow runs | `id`, `workflowId` (FK → workflow), `userId`, `scheduleType`, `cronExpression`, `timezone`, `isActive`, `lastRunAt`, `nextRunAt` | Belongs to `workflow` | `workflow_schedule_workflow_idx`, `workflow_schedule_next_run_idx` |

---

## 23. Analytics

**Schema File:** `analytics.ts` | **Owner:** Analytics
**Tables:** 3 | **Purpose:** Production metrics, user activity, workspace metrics

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `productionMetrics` | AI production execution metrics | `id` (serial), `productionId`, `workspaceId`, `status`, `aiModel`, `inputTokens`, `outputTokens`, `costUsd`, `executionTimeMs`, `metadata` | — | `production_metrics_workspace_idx`, `production_metrics_status_idx`, `production_metrics_created_at_idx` |
| `userActivityMetrics` | User action tracking | `id` (serial), `userId`, `workspaceId`, `action`, `resourceId`, `resourceType` | — | `user_activity_metrics_user_idx`, `user_activity_metrics_workspace_idx`, `user_activity_metrics_action_idx` |
| `workspaceMetrics` | Daily workspace rollups | `id` (serial), `workspaceId`, `date`, `productionsRun`, `productionsSucceeded`, `productionsFailed`, `mediaGenerated`, `totalCostUsd`, `totalTokensUsed`, `activeUsers` | — | `workspace_metrics_workspace_idx`, `workspace_metrics_date_idx` |

---

## 24. Analytics Center

**Schema File:** `analytics-center.ts` | **Owner:** Analytics Center
**Tables:** 5 | **Purpose:** Analytics events, metrics, dashboards, reports, alerts

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `analyticsEvent` | Granular analytics events | `id`, `eventType`, `category`, `source`, `userId`, `sessionId`, `resourceId`, `resourceType`, `value`, `metadata`, `ipAddress`, `userAgent`, `country`, `language`, `device` | — | `analytics_event_type_idx`, `analytics_event_category_idx`, `analytics_event_user_idx`, `analytics_event_source_idx`, `analytics_event_created_idx` |
| `analyticsMetric` | Aggregated metrics | `id`, `metricName`, `category`, `value`, `dimensions`, `date` | — | `analytics_metric_name_idx`, `analytics_metric_category_idx`, `analytics_metric_date_idx` |
| `analyticsDashboard` | User dashboards | `id`, `userId`, `name`, `widgets` (jsonb array), `isDefault` | — | `analytics_dashboard_user_idx` |
| `analyticsReport` | Generated reports | `id`, `userId`, `name`, `type`, `config`, `result`, `status`, `completedAt` | — | `analytics_report_user_idx`, `analytics_report_type_idx` |
| `analyticsAlert` | Metric alert rules | `id`, `userId`, `name`, `metricName`, `condition`, `threshold`, `isActive`, `lastTriggeredAt` | — | `analytics_alert_user_idx` |

---

## 25. Pricing

**Schema File:** `pricing.ts` | **Owner:** Pricing
**Tables:** 5 | **Purpose:** Pricing items, versioning, regional pricing, taxes, fees

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `pricingItem` | Pricable items/products | `id`, `name`, `code` (unique), `slug` (unique), `description`, `category`, `type`, `status`, `visibility`, `displayOrder`, `language`, `basePrice`, `salePrice`, `currency`, `features`, `metadata`, `config`, `startsAt`, `endsAt`, `timezone`, `version`, `createdBy` | Has many `pricingVersion`, `pricingRegion` | `pricing_item_code_idx`, `pricing_item_slug_idx`, `pricing_item_category_idx`, `pricing_item_status_idx` |
| `pricingVersion` | Pricing version snapshots | `id`, `pricingItemId` (FK → pricingItem), `version`, `data` (jsonb), `createdBy` | Belongs to `pricingItem` | `pricing_version_item_idx` + unique(item, version) |
| `pricingRegion` | Regional price overrides | `id`, `pricingItemId` (FK → pricingItem), `country`, `region`, `currency`, `overridePrice`, `overrideSalePrice`, `isActive` | Belongs to `pricingItem` | `pricing_region_item_idx`, `pricing_region_country_idx` + unique(item, country) |
| `pricingTax` | Tax rate definitions | `id`, `name`, `type`, `rate`, `country`, `region`, `isActive` | — | `pricing_tax_country_idx` |
| `pricingFee` | Fee definitions | `id`, `name`, `type`, `rate`, `minAmount`, `maxAmount`, `isActive` | — | — |

---

## 26. Support

**Schema File:** `support.ts` | **Owner:** Support
**Tables:** 10 | **Purpose:** Ticketing, knowledge base, SLA management, feedback, internal notes

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `supportTicket` | Support tickets | `id`, `userId` (FK → user), `workspaceId`, `category`, `priority`, `status`, `subject`, `description`, `assignedTo` (FK → user), `resolvedAt`, `closedAt`, `deletedAt` | Has many `supportTicketComment`, `supportAttachment`, `supportInternalNote`; belongs to `user` | `support_ticket_user_id_idx`, `support_ticket_status_idx`, `support_ticket_priority_idx`, `support_ticket_assigned_to_idx`, `support_ticket_created_at_idx` |
| `supportTicketComment` | Ticket comments | `id`, `ticketId` (FK → supportTicket), `userId` (FK → user), `content`, `isInternal` | Belongs to `supportTicket`, `user` | `support_ticket_comment_ticket_id_idx`, `support_ticket_comment_user_id_idx` |
| `supportKnowledgeCategory` | Knowledge base categories | `id`, `name`, `description`, `parentId` (self-ref) | Self-referencing; has many `supportKnowledgeArticle` | `support_knowledge_category_parent_id_idx` |
| `supportKnowledgeArticle` | KB articles | `id`, `categoryId` (FK → supportKnowledgeCategory), `title`, `content`, `status`, `version`, `relatedArticles`, `publishedAt`, `deletedAt` | Belongs to `supportKnowledgeCategory` | `support_knowledge_article_category_id_idx`, `support_knowledge_article_status_idx` |
| `supportSlaPolicy` | SLA definitions | `id`, `name`, `priority`, `responseTimeMinutes`, `resolutionTimeMinutes`, `escalationRules`, `isActive` | Has many `supportSlaViolation` | `support_sla_policy_priority_idx`, `support_sla_policy_is_active_idx` |
| `supportSlaViolation` | SLA breach records | `id`, `ticketId` (FK → supportTicket), `policyId` (FK → supportSlaPolicy), `type`, `violatedAt`, `metadata` | Belongs to `supportTicket`, `supportSlaPolicy` | `support_sla_violation_ticket_id_idx`, `support_sla_violation_policy_id_idx` |
| `supportCustomerTimeline` | Customer interaction timeline | `id`, `userId` (FK → user), `type`, `title`, `description`, `metadata` | Belongs to `user` | `support_customer_timeline_user_id_idx`, `support_customer_timeline_type_idx`, `support_customer_timeline_created_at_idx` |
| `supportInternalNote` | Internal agent notes | `id`, `ticketId` (FK → supportTicket), `content`, `createdBy` (FK → user) | Belongs to `supportTicket`, `user` | `support_internal_note_ticket_id_idx`, `support_internal_note_created_by_idx` |
| `supportAttachment` | Ticket file attachments | `id`, `ticketId` (FK → supportTicket), `fileName`, `fileType`, `fileSize`, `storagePath`, `uploadedBy` (FK → user) | Belongs to `supportTicket`, `user` | `support_attachment_ticket_id_idx`, `support_attachment_uploaded_by_idx` |
| `supportFeedback` | User satisfaction feedback | `id`, `userId` (FK → user), `ticketId` (FK → supportTicket), `type`, `rating`, `comment`, `metadata` | Belongs to `user`, `supportTicket` | `support_feedback_user_id_idx`, `support_feedback_ticket_id_idx`, `support_feedback_type_idx` |

---

## 27. Security

**Schema File:** `security.ts` | **Owner:** Security Hub
**Tables:** 8 | **Purpose:** Security events, session monitoring, API monitoring, upload scanning, compliance, incidents, reports

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `secEvent` | Security events | `id`, `eventType`, `severity`, `category`, `source`, `userId`, `ipAddress`, `userAgent`, `resource`, `action`, `details`, `blocked`, `resolved`, `resolvedAt`, `resolvedBy`, `metadata` | — | `sec_event_type_idx`, `sec_event_severity_idx`, `sec_event_category_idx`, `sec_event_user_idx`, `sec_event_created_idx` |
| `secIncident` | Security incidents | `id`, `title`, `description`, `severity`, `status`, `category`, `affectedSystems`, `eventIds`, `rootCause`, `resolution`, `assignedTo`, `impact`, `startedAt`, `acknowledgedAt`, `resolvedAt`, `metadata` | — | `sec_incident_severity_idx`, `sec_incident_status_idx`, `sec_incident_category_idx` |
| `secSession` | Session monitoring | `id`, `userId`, `ipAddress`, `userAgent`, `device`, `location`, `isActive`, `isSuspicious`, `riskScore`, `lastActivityAt`, `expiresAt`, `metadata` | — | `sec_session_user_idx`, `sec_session_active_idx`, `sec_session_suspicious_idx` |
| `secApiEvent` | API request monitoring | `id`, `correlationId`, `userId`, `method`, `endpoint`, `statusCode`, `latencyMs`, `requestSize`, `responseSize`, `ipAddress`, `userAgent`, `rateLimited`, `blocked`, `error`, `metadata` | — | `sec_api_correlation_idx`, `sec_api_user_idx`, `sec_api_endpoint_idx`, `sec_api_created_idx` |
| `secUploadEvent` | File upload security scanning | `id`, `userId`, `filename`, `mimeType`, `fileSize`, `storagePath`, `isValid`, `isSuspicious`, `validationErrors`, `ipAddress`, `metadata` | — | `sec_upload_user_idx`, `sec_upload_valid_idx`, `sec_upload_suspicious_idx` |
| `secReport` | Security reports | `id`, `reportType`, `title`, `period`, `data`, `summary`, `generatedAt`, `metadata` | — | `sec_report_type_idx`, `sec_report_generated_idx` |
| `secCompliance` | Compliance framework tracking | `id`, `framework`, `control`, `description`, `status`, `lastVerifiedAt`, `evidence`, `notes`, `metadata` | — | `sec_compliance_framework_idx`, `sec_compliance_status_idx` |
| `secSettings` | Global security settings | `id`, `bruteForceProtection`, `maxLoginAttempts`, `lockoutDurationMinutes`, `sessionTimeoutMinutes`, `maxConcurrentSessions`, `ipWhitelist`, `ipBlacklist`, `uploadMaxSizeMb`, `uploadAllowedTypes`, `rateLimitEnabled`, `cspEnabled`, `hstsEnabled`, `metadata` | — | — |

---

## 28. Localization

**Schema File:** `localization.ts` | **Owner:** Localization
**Tables:** 6 | **Purpose:** Locale profiles, regions, currency profiles, pricing/payment profiles

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `localizationProfile` | Locale/region profiles | `id`, `code` (unique), `name`, `locale`, `currency`, `country`, `timezone`, `isDefault`, `isEnabled`, `pricingProfile`, `paymentProfile`, `countryCode`, `supportedCurrencies`, `supportedLanguages` | Has many `region` | `localization_profile_code_idx`, `localization_profile_enabled_idx`, `localization_profile_default_idx` |
| `region` | Geographic regions | `id`, `code` (unique), `name`, `nativeName`, `profileCode` (FK → localizationProfile.code), `enabled`, `priority` | Belongs to `localizationProfile` | `region_code_idx`, `region_profile_idx` |
| `pricingProfile` | Pricing rule groups | `id`, `code` (unique), `name`, `description`, `currency`, `isEnabled`, `config` | Has many `pricingRule` | `pricing_profile_code_idx`, `pricing_profile_enabled_idx` |
| `pricingRule` | Plan-level pricing rules | `id`, `profileId` (FK → pricingProfile), `planId`, `displayPrice`, `amount`, `currency`, `billingCycle`, `isVisible` | Belongs to `pricingProfile` | `pricing_rule_profile_idx`, `pricing_rule_plan_idx` + unique(profile, plan, cycle) |
| `paymentProfile` | Payment method groups | `id`, `code` (unique), `name`, `description`, `isEnabled`, `config` | Has many `paymentMethod` | `payment_profile_code_idx`, `payment_profile_enabled_idx` |
| `paymentMethod` | Payment method configs | `id`, `profileId` (FK → paymentProfile), `provider`, `name`, `isEnabled`, `priority`, `config` | Belongs to `paymentProfile` | `payment_method_profile_idx` + unique(profile, provider) |

---

## 29. Media

**Schema File:** `media.ts` | **Owner:** Media
**Tables:** 1 | **Purpose:** User media file references

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `userMedia` | User media files | `id`, `userId`, `filename`, `mimeType`, `sizeBytes`, `kind`, `storageKey`, `status` | — | `user_media_user_id_idx`, `user_media_kind_idx`, `user_media_status_idx`, `user_media_created_at_idx` |

---

## 30. Monitoring

**Schema File:** `monitoring.ts` | **Owner:** Monitoring
**Tables:** 5 | **Purpose:** System health, metrics, alerts, incidents, dependencies

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `systemHealth` | Service health status | `id`, `serviceName`, `serviceType`, `status`, `latencyMs`, `uptime`, `lastCheckedAt`, `lastHealthyAt`, `lastErrorAt`, `errorMessage`, `metadata` | — | `system_health_service_idx`, `system_health_type_idx`, `system_health_status_idx` |
| `systemMetric` | System metrics | `id`, `metricName`, `category`, `value`, `unit`, `source`, `dimensions`, `recordedAt` | — | `system_metric_name_idx`, `system_metric_category_idx`, `system_metric_recorded_idx` |
| `systemAlert` | Alert rule definitions | `id`, `name`, `type`, `severity`, `condition`, `serviceName`, `isActive`, `lastTriggeredAt`, `triggerCount`, `createdBy` | — | `system_alert_type_idx`, `system_alert_severity_idx`, `system_alert_active_idx` |
| `systemIncident` | System incidents | `id`, `title`, `description`, `severity`, `status`, `affectedServices`, `timeline`, `assignedTo`, `resolvedAt`, `createdBy` | — | `system_incident_status_idx`, `system_incident_severity_idx` |
| `systemDependency` | Service dependency graph | `id`, `name`, `type`, `dependsOn`, `status`, `metadata` | — | `system_dependency_type_idx` |

---

## 31. DevOps

**Schema File:** `devops.ts` | **Owner:** DevOps
**Tables:** 5 | **Purpose:** Deployment tracking, releases, health, workers, backups

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `deployment` | Deployment records | `id`, `version`, `environment`, `status`, `commitSha`, `commitMessage`, `branch`, `deployedBy`, `metadata`, `startedAt`, `completedAt` | — | `deployment_env_idx`, `deployment_status_idx`, `deployment_created_idx` |
| `deploymentRelease` | Release management | `id`, `version` (unique), `name`, `description`, `notes`, `status`, `metadata`, `createdBy`, `publishedAt` | — | `deployment_release_status_idx` |
| `deploymentHealth` | Post-deploy health checks | `id`, `serviceName`, `status`, `uptime`, `lastCheckedAt`, `errorMessage`, `metadata` | — | `deployment_health_service_idx` |
| `deploymentWorker` | Background worker tracking | `id`, `name`, `type`, `status`, `processId`, `metadata`, `startedAt`, `lastHeartbeat` | — | `deployment_worker_status_idx` |
| `deploymentBackup` | Backup management | `id`, `name`, `type`, `status`, `sizeBytes`, `filePath`, `metadata`, `createdBy`, `completedAt` | — | `deployment_backup_type_idx`, `deployment_backup_status_idx` |

---

## 32. Performance

**Schema File:** `performance.ts` | **Owner:** Performance
**Tables:** 2 | **Purpose:** Performance metrics collection and reports

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `performanceMetric` | Performance data points | `id`, `category`, `metricName`, `value`, `unit`, `metadata`, `recordedAt` | — | `performance_metric_category_idx`, `performance_metric_name_idx`, `performance_metric_recorded_idx` |
| `performanceReport` | Performance analysis reports | `id`, `name`, `scores`, `recommendations`, `metadata` | — | `performance_report_created_idx` |

---

## 33. BI

**Schema File:** `bi.ts` | **Owner:** BI
**Tables:** 5 | **Purpose:** Business intelligence reports, templates, KPIs, scheduling, exports

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `biReport` | BI reports | `id`, `name`, `type`, `category`, `description`, `config`, `result`, `status`, `createdBy`, `completedAt` | — | `bi_report_type_idx`, `bi_report_category_idx`, `bi_report_status_idx` |
| `biReportTemplate` | Report templates | `id`, `name`, `description`, `category`, `config`, `isSystem`, `usageCount` | — | `bi_report_template_category_idx` |
| `biKpi` | Key performance indicators | `id`, `name`, `category`, `currentValue`, `targetValue`, `unit`, `trend`, `status`, `owner`, `metadata` | — | `bi_kpi_category_idx`, `bi_kpi_status_idx` |
| `biSchedule` | Scheduled report runs | `id`, `name`, `reportTemplateId`, `scheduleType`, `config`, `recipients`, `format`, `timezone`, `isActive`, `lastRunAt`, `nextRunAt`, `createdBy` | — | `bi_schedule_active_idx`, `bi_schedule_next_run_idx` |
| `biExport` | Report exports | `id`, `name`, `reportId`, `format`, `status`, `fileUrl`, `fileSize`, `requestedBy`, `completedAt` | — | `bi_export_status_idx` |

---

## 34. Dashboard

**Schema File:** `dashboard.ts` | **Owner:** Dashboard
**Tables:** 4 | **Purpose:** Referrals, affiliate tracking, storage usage

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `referral` | Referral program tracking | `id`, `referrerUserId`, `referredUserId`, `referralCode` (unique), `status`, `rewardCredits`, `rewardedAt`, `metadata` | Belongs to `affiliate` (via referrerUserId) | `referral_referrer_idx`, `referral_code_idx`, `referral_referred_idx` |
| `affiliate` | Affiliate accounts | `id`, `userId` (unique), `affiliateCode` (unique), `status`, `commissionRate`, `totalClicks`, `totalConversions`, `totalRevenue`, `totalCommission`, `pendingCommission`, `paidCommission`, `metadata` | Has many `affiliateClick` | `affiliate_user_idx`, `affiliate_code_idx` |
| `affiliateClick` | Click tracking | `id`, `affiliateId` (FK → affiliate), `ipAddress`, `userAgent`, `referrer` | Belongs to `affiliate` | `affiliate_click_affiliate_idx` |
| `storageUsage` | User storage usage summary | `id`, `userId`, `totalUsed`, `imageCount`, `videoCount`, `documentCount`, `limitBytes` | — | `storage_usage_user_idx` |

---

## 35. Image Studio

**Schema File:** `image-studio.ts` | **Owner:** Image Studio
**Tables:** 6 | **Purpose:** Image generation projects, generations, styles, characters, prompt library, templates

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `imageProject` | Image projects | `id`, `userId`, `name`, `description`, `coverImage`, `tags`, `status`, `metadata` | Has many `imageGeneration` | `image_project_user_idx`, `image_project_status_idx` |
| `imageGeneration` | Image generation jobs | `id`, `userId`, `projectId`, `prompt`, `negativePrompt`, `type`, `style`, `aspectRatio`, `resolution`, `quality`, `seed`, `guidanceScale`, `steps`, `model`, `provider`, `characterId`, `referenceImage`, `referenceStrength`, `batchCount`, `outputImages`, `creditsUsed`, `status`, `error`, `executionTimeMs`, `isFavorite` | Belongs to `imageProject` | `image_generation_user_idx`, `image_generation_project_idx`, `image_generation_status_idx`, `image_generation_type_idx`, `image_generation_created_idx` |
| `imageStyle` | Style presets | `id`, `name`, `description`, `category`, `promptSuffix`, `negativePromptSuffix`, `thumbnail`, `isActive`, `isSystem`, `usageCount` | — | `image_style_category_idx`, `image_style_active_idx` |
| `imageCharacter` | Character reference profiles | `id`, `userId`, `name`, `description`, `avatar`, `referenceImages`, `style`, `promptTags`, `defaultSettings`, `metadata` | — | `image_character_user_idx` |
| `imagePromptLibrary` | Saved prompts | `id`, `userId`, `name`, `prompt`, `category`, `tags`, `isFavorite`, `useCount` | — | `image_prompt_library_user_idx`, `image_prompt_library_category_idx` |
| `imageTemplate` | Image generation templates | `id`, `name`, `description`, `category`, `promptTemplate`, `settings`, `thumbnail`, `isSystem`, `isActive`, `usageCount`, `metadata` | — | `image_template_category_idx`, `image_template_system_idx` |

---

## 36. Video Studio

**Schema File:** `video-studio.ts` | **Owner:** Video Studio
**Tables:** 7 | **Purpose:** Video projects, storyboards, scenes, generations, templates, effects, transitions

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `videoProject` | Video projects | `id`, `userId`, `name`, `description`, `coverImage`, `status`, `metadata` | Has many `videoStoryboard` | `video_project_user_idx`, `video_project_status_idx` |
| `videoStoryboard` | Video storyboards | `id`, `projectId` (FK → videoProject), `userId`, `name`, `description`, `settings`, `status` | Belongs to `videoProject`; has many `videoScene` | `video_storyboard_project_idx`, `video_storyboard_user_idx` |
| `videoScene` | Storyboard scenes | `id`, `storyboardId` (FK → videoStoryboard), `order`, `title`, `prompt`, `negativePrompt`, `duration`, `cameraMotion`, `transition`, `characters`, `audio`, `subtitles`, `effects`, `metadata` | Belongs to `videoStoryboard` | `video_scene_storyboard_idx` |
| `videoGeneration` | Video generation jobs | `id`, `userId`, `projectId`, `storyboardId`, `sceneId`, `type`, `prompt`, `negativePrompt`, `style`, `aspectRatio`, `resolution`, `frameRate`, `duration`, `quality`, `seed`, `model`, `provider`, `referenceImage`, `referenceVideo`, `outputVideo`, `thumbnail`, `previewClip`, `creditsUsed`, `status`, `error`, `executionTimeMs`, `isFavorite` | — | `video_generation_user_idx`, `video_generation_project_idx`, `video_generation_storyboard_idx`, `video_generation_status_idx`, `video_generation_created_idx` |
| `videoTemplate` | Video generation templates | `id`, `name`, `description`, `category`, `settings`, `scenes`, `thumbnail`, `isSystem`, `isActive`, `usageCount` | — | `video_template_category_idx` |
| `videoEffect` | Video effects library | `id`, `name`, `category`, `config`, `isActive`, `isSystem` | — | `video_effect_category_idx` |
| `videoTransition` | Video transitions library | `id`, `name`, `category`, `duration`, `config`, `isSystem`, `isActive` | — | `video_transition_category_idx` |

---

## 37. Drama Studio

**Schema File:** `drama-studio.ts` | **Owner:** Drama Studio
**Tables:** 8 | **Purpose:** Drama series creation with characters, universes, episodes, scenes, generation jobs, templates

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `dramaProject` | Drama projects | `id`, `userId`, `name`, `description`, `genre`, `coverImage`, `status`, `metadata` | Has many `dramaUniverse`, `dramaCharacter`, `dramaLocation`, `dramaEpisode`, `dramaGenerationJob` | `drama_project_user_idx`, `drama_project_status_idx`, `drama_project_genre_idx` |
| `dramaUniverse` | World-building universes | `id`, `projectId` (FK → dramaProject), `name`, `description`, `timeline`, `rules`, `locations`, `lore`, `metadata` | Belongs to `dramaProject` | `drama_universe_project_idx` |
| `dramaCharacter` | Drama characters | `id`, `projectId` (FK → dramaProject), `name`, `role`, `description`, `personality`, `goals`, `appearance`, `speechStyle`, `avatar`, `referenceImages`, `metadata` | Belongs to `dramaProject` | `drama_character_project_idx` |
| `dramaLocation` | Drama locations | `id`, `projectId` (FK → dramaProject), `name`, `environment`, `lighting`, `weather`, `referenceImages`, `metadata` | Belongs to `dramaProject` | `drama_location_project_idx` |
| `dramaEpisode` | Episodes | `id`, `projectId` (FK → dramaProject), `season`, `episodeNumber`, `title`, `synopsis`, `status`, `duration`, `metadata` | Belongs to `dramaProject`; has many `dramaScene` | `drama_episode_project_idx`, `drama_episode_season_idx` |
| `dramaScene` | Episode scenes | `id`, `episodeId` (FK → dramaEpisode), `order`, `title`, `description`, `dialogue`, `narration`, `locationId`, `characters`, `cameraDirection`, `transition`, `duration`, `emotion`, `metadata` | Belongs to `dramaEpisode` | `drama_scene_episode_idx` |
| `dramaGenerationJob` | AI generation jobs | `id`, `projectId` (FK → dramaProject), `userId`, `type`, `status`, `input`, `output`, `creditsUsed`, `error`, `executionTimeMs`, `completedAt` | Belongs to `dramaProject` | `drama_gen_job_project_idx`, `drama_gen_job_user_idx`, `drama_gen_job_status_idx` |
| `dramaTemplate` | Drama project templates | `id`, `name`, `description`, `genre`, `config`, `isSystem`, `isActive`, `usageCount` | — | `drama_template_genre_idx` |

---

## 38. Story Engine

**Schema File:** `story-engine.ts` | **Owner:** Story Engine
**Tables:** 7 | **Purpose:** Narrative story creation with characters, locations, events, relationships, episodes, rules

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `story` | Story definitions | `id`, `userId`, `projectId`, `title`, `genre`, `theme`, `synopsis`, `targetAudience`, `tone`, `narrativeStyle`, `language`, `status`, `metadata`, `storyRules`, `keywords` | Has many `storyCharacter`, `storyLocation`, `storyRelationship`, `storyEvent`, `storyEpisode`, `storyRule` | `story_user_idx`, `story_status_idx`, `story_genre_idx` |
| `storyCharacter` | Story characters | `id`, `storyId` (FK → story), `name`, `aliases`, `role`, `age`, `occupation`, `personality`, `goals`, `motivation`, `fear`, `weakness`, `strength`, `speechStyle`, `appearance`, `outfits`, `voice`, `background`, `currentStatus`, `avatar`, `metadata` | Belongs to `story` | `story_character_story_idx`, `story_character_role_idx` |
| `storyLocation` | Story locations | `id`, `storyId` (FK → story), `name`, `type`, `description`, `lighting`, `weather`, `history`, `referenceImages`, `metadata` | Belongs to `story` | `story_location_story_idx` |
| `storyRelationship` | Character relationships | `id`, `storyId` (FK → story), `characterAId`, `characterBId`, `type`, `level`, `description`, `history`, `metadata` | Belongs to `story` | `story_relationship_story_idx` |
| `storyEvent` | Story events | `id`, `storyId` (FK → story), `title`, `description`, `type`, `chapter`, `scene`, `characters`, `location`, `emotion`, `importance`, `metadata` | Belongs to `story` | `story_event_story_idx`, `story_event_type_idx` |
| `storyEpisode` | Story episodes | `id`, `storyId` (FK → story), `episodeNumber`, `season`, `title`, `synopsis`, `summary`, `status`, `charactersUsed`, `locationsUsed`, `importantEvents`, `emotionalState`, `openQuestions`, `metadata` | Belongs to `story` | `story_episode_story_idx`, `story_episode_season_idx` |
| `storyRule` | Narrative rules/constraints | `id`, `storyId` (FK → story), `rule`, `category`, `isActive` | Belongs to `story` | `story_rule_story_idx` |

---

## 39. Project Studio

**Schema File:** `project-studio.ts` | **Owner:** Projects
**Tables:** 5 | **Purpose:** Project management, notes, timelines, activity tracking, templates

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `project` | Projects | `id`, `userId`, `name`, `description`, `type`, `category`, `status`, `thumbnail`, `tags`, `color`, `priority`, `language`, `targetPlatforms`, `settings`, `metadata`, `creditsUsed`, `storageUsed`, `isFavorite`, `isArchived` | Has many `projectNote`, `projectTimeline`, `projectActivity` | `project_user_idx`, `project_status_idx`, `project_type_idx`, `project_archived_idx` |
| `projectNote` | Project notes | `id`, `projectId` (FK → project), `title`, `content`, `isPinned`, `tags` | Belongs to `project` | `project_note_project_idx` |
| `projectTimeline` | Timeline events | `id`, `projectId` (FK → project), `type`, `title`, `description`, `icon`, `metadata` | Belongs to `project` | `project_timeline_project_idx`, `project_timeline_type_idx` |
| `projectActivity` | Activity feed | `id`, `projectId` (FK → project), `userId`, `action`, `entityType`, `entityId`, `metadata` | Belongs to `project` | `project_activity_project_idx`, `project_activity_created_idx` |
| `projectTemplate` | Project templates | `id`, `name`, `description`, `type`, `category`, `config`, `thumbnail`, `isSystem`, `isActive`, `usageCount` | — | `project_template_type_idx`, `project_template_category_idx` |

---

## 40. Calendar

**Schema File:** `calendar.ts` | **Owner:** Calendar
**Tables:** 4 | **Purpose:** Calendar events, tasks, reminders, recurring schedules

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `calendarEvent` | Calendar events | `id`, `title`, `description`, `start`, `end`, `allDay`, `location`, `color`, `userId`, `workspaceId`, `metadata` | Has many `calendarReminder` | `calendar_event_user_idx`, `calendar_event_start_idx` |
| `calendarTask` | Task items | `id`, `title`, `description`, `dueDate`, `priority`, `status`, `userId`, `workspaceId`, `metadata` | — | `calendar_task_user_idx`, `calendar_task_due_idx` |
| `calendarReminder` | Event reminders | `id`, `eventId` (FK → calendarEvent), `type`, `minutesBefore`, `sentAt` | Belongs to `calendarEvent` | `calendar_reminder_event_idx` |
| `calendarRecurring` | Recurring event rules | `id`, `eventId` (FK → calendarEvent), `frequency`, `interval`, `endDate`, `daysOfWeek`, `metadata` | Belongs to `calendarEvent` | `calendar_recurring_event_idx` |

---

## 41. Publishing

**Schema File:** `publishing.ts` | **Owner:** Publishing
**Tables:** 4 | **Purpose:** Content publishing pipeline with drafts, jobs, logs

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `publishPost` | Published posts | `id`, `title`, `content`, `status`, `userId`, `workspaceId`, `metadata`, `publishedAt` | — | `publish_post_status_idx`, `publish_post_user_idx` |
| `publishDraft` | Draft versions | `id`, `postId` (FK → publishPost), `content`, `version`, `userId` | Belongs to `publishPost` | `publish_draft_post_idx` |
| `publishJob` | Publishing jobs | `id`, `postId`, `type`, `status`, `provider`, `error`, `metadata` | — | `publish_job_status_idx` |
| `publishLog` | Publishing audit log | `id`, `postId`, `action`, `userId`, `metadata` | — | `publish_log_post_idx` |

---

## 42. API Platform

**Schema File:** `api-platform.ts` | **Owner:** API Platform
**Tables:** 3 | **Purpose:** API request logging, webhooks, delivery tracking

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `apiRequestLog` | API request audit log | `id`, `method`, `path`, `statusCode`, `latencyMs`, `userId`, `workspaceId`, `metadata` | — | `api_request_log_user_idx`, `api_request_log_created_idx` |
| `apiWebhook` | Webhook definitions | `id`, `url`, `events`, `secret`, `userId`, `workspaceId`, `isActive`, `metadata` | Has many `apiWebhookDelivery` | `api_webhook_user_idx` |
| `apiWebhookDelivery` | Webhook delivery attempts | `id`, `webhookId` (FK → apiWebhook), `event`, `payload`, `status`, `statusCode`, `response`, `error`, `metadata` | Belongs to `apiWebhook` | `api_webhook_delivery_webhook_idx` |

---

## 43. Orchestrator

**Schema File:** `orchestrator.ts` | **Owner:** Orchestrator
**Tables:** 8 | **Purpose:** Pipeline orchestration, task management, queueing, rule engine, templates

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `orchestratorPipeline` | Pipeline definitions | `id`, `name`, `description`, `status`, `steps`, `settings`, `metadata` | Has many `orchestratorPipelineStep` | `orchestrator_pipeline_status_idx` |
| `orchestratorPipelineStep` | Pipeline steps | `id`, `pipelineId` (FK → orchestratorPipeline), `name`, `type`, `config`, `order`, `status` | Belongs to `orchestratorPipeline` | `orchestrator_pipeline_step_pipeline_idx` |
| `orchestratorTask` | Orchestrated tasks | `id`, `pipelineId`, `type`, `status`, `priority`, `input`, `output`, `error`, `metadata` | — | `orchestrator_task_status_idx` |
| `orchestratorExecution` | Pipeline executions | `id`, `pipelineId`, `status`, `context`, `result`, `error`, `startedAt`, `completedAt` | — | `orchestrator_execution_pipeline_idx` |
| `orchestratorQueue` | Task queues | `id`, `name`, `depth`, `status`, `metadata` | — | `orchestrator_queue_name_idx` |
| `orchestratorRule` | Routing/trigger rules | `id`, `name`, `conditions`, `actions`, `isActive`, `priority`, `metadata` | — | `orchestrator_rule_active_idx` |
| `orchestratorSettings` | Orchestrator config | `id`, `key`, `value`, `description` | — | — |
| `orchestratorTemplate` | Pipeline templates | `id`, `name`, `description`, `config`, `isSystem`, `isActive`, `usageCount` | — | — |

---

## 44. Automation

**Schema File:** `automation.ts` | **Owner:** Automation
**Tables:** 8 | **Purpose:** Automation rules, executions, events, queueing, scheduling, templates, reports

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `automationRule` | Automation rule definitions | `id`, `name`, `trigger`, `conditions`, `actions`, `isActive`, `priority`, `metadata` | — | `automation_rule_active_idx` |
| `automationExecution` | Rule execution log | `id`, `ruleId`, `status`, `input`, `output`, `error`, `executionTimeMs`, `metadata` | — | `automation_execution_rule_idx` |
| `automationEvent` | Event bus entries | `id`, `eventType`, `payload`, `source`, `processed`, `metadata` | — | `automation_event_type_idx` |
| `automationQueue` | Task queue | `id`, `name`, `depth`, `status`, `metadata` | — | `automation_queue_name_idx` |
| `automationSchedule` | Cron/time-based schedules | `id`, `ruleId`, `cronExpression`, `timezone`, `isActive`, `lastRunAt`, `nextRunAt` | — | `automation_schedule_next_run_idx` |
| `automationTemplate` | Automation templates | `id`, `name`, `description`, `config`, `isSystem`, `isActive`, `usageCount` | — | — |
| `automationSettings` | Automation config | `id`, `key`, `value`, `description` | — | — |
| `automationReport` | Automation reports | `id`, `name`, `type`, `result`, `generatedAt`, `metadata` | — | — |

---

## 45. Creative Memory

**Schema File:** `creative-memory.ts` | **Owner:** Creative Memory
**Tables:** 13 | **Purpose:** AI creative memory system — brand profiles, visual/caption/story/thumbnail memory, workflow memory, character memory, generation memory, learning events

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `creativeMemory` | Core creative memory entries | `id`, `userId`, `type`, `content`, `embedding`, `metadata`, `createdAt` | — | `creative_memory_user_idx`, `creative_memory_type_idx` |
| `creativeBrandProfile` | Brand identity memory | `id`, `userId`, `name`, `colors`, `fonts`, `tone`, `guidelines`, `metadata` | — | `creative_brand_user_idx` |
| `creativeVisualMemory` | Visual style memory | `id`, `userId`, `style`, `referenceImages`, `metadata` | — | `creative_visual_user_idx` |
| `creativeCaptionMemory` | Caption style memory | `id`, `userId`, `style`, `templates`, `metadata` | — | `creative_caption_user_idx` |
| `creativeStoryMemory` | Story/narrative memory | `id`, `userId`, `narrativeStyle`, `themes`, `metadata` | — | `creative_story_user_idx` |
| `creativeThumbnailMemory` | Thumbnail design memory | `id`, `userId`, `style`, `templates`, `metadata` | — | `creative_thumbnail_user_idx` |
| `creativeWorkflowMemory` | Workflow pattern memory | `id`, `userId`, `pattern`, `frequency`, `metadata` | — | `creative_workflow_user_idx` |
| `creativePublishingMemory` | Publishing pattern memory | `id`, `userId`, `platform`, `timing`, `metadata` | — | `creative_publishing_user_idx` |
| `creativeCharacterMemory` | Character consistency memory | `id`, `userId`, `characterName`, `traits`, `referenceImages`, `metadata` | — | `creative_character_user_idx` |
| `creativeGenerationMemory` | Generation parameter memory | `id`, `userId`, `type`, `parameters`, `quality`, `metadata` | — | `creative_generation_user_idx` |
| `creativeLearningEvent` | Learning events | `id`, `userId`, `eventType`, `data`, `metadata` | — | `creative_learning_user_idx` |
| `creativePreference` | User creative preferences | `id`, `userId`, `key`, `value`, `metadata` | — | `creative_pref_user_idx` |
| `creativeMemorySettings` | Creative memory config | `id`, `userId`, `settings`, `metadata` | — | — |

---

## 46. Learning Engine

**Schema File:** `learning-engine.ts` | **Owner:** Learning
**Tables:** 9 | **Purpose:** User learning events, pattern recognition, preferences, goals, feedback, recommendations, reports

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `learningEvent` | Learning event log | `id`, `userId`, `eventType`, `data`, `metadata` | — | `learning_event_user_idx` |
| `learningPattern` | Detected patterns | `id`, `userId`, `pattern`, `confidence`, `frequency`, `metadata` | — | `learning_pattern_user_idx` |
| `learningHistory` | Learning progress history | `id`, `userId`, `topic`, `level`, `score`, `metadata` | — | `learning_history_user_idx` |
| `learningPreference` | Learning preferences | `id`, `userId`, `key`, `value`, `metadata` | — | `learning_pref_user_idx` |
| `learningGoal` | Learning goals | `id`, `userId`, `goal`, `targetDate`, `status`, `progress`, `metadata` | — | `learning_goal_user_idx` |
| `learningFeedback` | Feedback entries | `id`, `userId`, `type`, `rating`, `comment`, `metadata` | — | `learning_feedback_user_idx` |
| `learningRecommendation` | AI recommendations | `id`, `userId`, `type`, `content`, `priority`, `status`, `metadata` | — | `learning_recommendation_user_idx` |
| `learningReport` | Learning reports | `id`, `userId`, `name`, `data`, `generatedAt`, `metadata` | — | `learning_report_user_idx` |
| `learningSettings` | Learning config | `id`, `userId`, `settings`, `metadata` | — | — |

---

## 47. Trend Analyzer

**Schema File:** `trend-analyzer.ts` | **Owner:** Trends
**Tables:** 7 | **Purpose:** Trend tracking, topics, keywords, hashtags, forecasts, alerts, recommendations

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `trendTopic` | Tracked topics | `id`, `name`, `category`, `volume`, `growth`, `metadata` | — | `trend_topic_category_idx` |
| `trendKeyword` | Trending keywords | `id`, `topicId`, `keyword`, `volume`, `sentiment`, `metadata` | — | `trend_keyword_topic_idx` |
| `trendHashtag` | Trending hashtags | `id`, `topicId`, `hashtag`, `platform`, `volume`, `metadata` | — | `trend_hashtag_topic_idx` |
| `trendForecast` | Trend predictions | `id`, `topicId`, `forecastDate`, `predictedVolume`, `confidence`, `metadata` | — | `trend_forecast_topic_idx` |
| `trendAlert` | Trend alerts | `id`, `topicId`, `alertType`, `threshold`, `status`, `metadata` | — | `trend_alert_topic_idx` |
| `trendRecommendation` | Trend-based recommendations | `id`, `userId`, `topicId`, `recommendation`, `priority`, `status`, `metadata` | — | `trend_recommendation_user_idx` |
| `trendSaved` | Saved trend snapshots | `id`, `userId`, `topicId`, `data`, `metadata` | — | `trend_saved_user_idx` |

---

## 48. Conversion Optimizer

**Schema File:** `conversion-optimizer.ts` | **Owner:** Conversion
**Tables:** 4 | **Purpose:** A/B testing, conversion scoring, recommendations, reports

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `conversionExperiment` | A/B test experiments | `id`, `name`, `type`, `status`, `variants`, `traffic`, `results`, `metadata` | — | `conversion_experiment_status_idx` |
| `conversionScore` | Conversion scores | `id`, `userId`, `type`, `score`, `factors`, `metadata` | — | `conversion_score_user_idx` |
| `conversionRecommendation` | Optimization recommendations | `id`, `userId`, `type`, `content`, `priority`, `status`, `metadata` | — | `conversion_recommendation_user_idx` |
| `conversionReport` | Conversion reports | `id`, `name`, `type`, `data`, `generatedAt`, `metadata` | — | — |

---

## 49. Agent Platform

**Schema File:** `agent-platform.ts` | **Owner:** Agent
**Tables:** 5 | **Purpose:** AI agent management, runs, tasks, memory, knowledge base

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `agent` | Agent definitions | `id`, `name`, `type`, `status`, `config`, `capabilities`, `metadata` | Has many `agentRun`, `agentMemory`, `agentKnowledge` | `agent_status_idx` |
| `agentRun` | Agent execution runs | `id`, `agentId`, `userId`, `status`, `input`, `output`, `creditsUsed`, `error`, `metadata` | Belongs to `agent`; has many `agentTask` | `agent_run_agent_idx`, `agent_run_status_idx` |
| `agentTask` | Individual agent tasks | `id`, `runId` (FK → agentRun), `type`, `status`, `input`, `output`, `error`, `metadata` | Belongs to `agentRun` | `agent_task_run_idx`, `agent_task_status_idx` |
| `agentMemory` | Agent long-term memory | `id`, `agentId`, `type`, `content`, `embedding`, `metadata` | Belongs to `agent` | `agent_memory_agent_idx` |
| `agentKnowledge` | Agent knowledge base | `id`, `agentId`, `title`, `content`, `category`, `metadata` | Belongs to `agent` | `agent_knowledge_agent_idx` |

---

## 50. Affiliate Studio

**Schema File:** `affiliate-studio.ts` | **Owner:** Affiliate
**Tables:** 6 | **Purpose:** Affiliate program management, products, campaigns, click tracking, brand kits, generation jobs

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `affiliate` | Affiliate accounts | `id`, `userId`, `code`, `status`, `commissionRate`, `metadata` | Has many `affiliateProduct`, `affiliateCampaign`, `affiliateClick` | `affiliate_studio_user_idx` |
| `affiliateProduct` | Affiliate products | `id`, `affiliateId`, `name`, `url`, `commission`, `status`, `metadata` | Belongs to `affiliate` | `affiliate_product_affiliate_idx` |
| `affiliateCampaign` | Affiliate campaigns | `id`, `affiliateId`, `name`, `type`, `status`, `budget`, `metadata` | Belongs to `affiliate` | `affiliate_campaign_affiliate_idx` |
| `affiliateClick` | Click tracking | `id`, `affiliateId`, `productId`, `ipAddress`, `userAgent`, `metadata` | Belongs to `affiliate` | `affiliate_click_affiliate_idx` |
| `affiliateBrandKit` | Brand assets for affiliates | `id`, `affiliateId`, `logos`, `colors`, `guidelines`, `metadata` | Belongs to `affiliate` | `affiliate_brand_kit_affiliate_idx` |
| `affiliateGenerationJob` | Content generation jobs | `id`, `affiliateId`, `type`, `status`, `input`, `output`, `creditsUsed`, `error`, `metadata` | Belongs to `affiliate` | `affiliate_gen_job_affiliate_idx` |

---

## 51. Campaigns

**Schema File:** `campaigns.ts` | **Owner:** Campaigns
**Tables:** 4 | **Purpose:** Campaign management and statistics

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `campaign` | Campaign definitions | `id`, `name`, `type`, `status`, `budget`, `startDate`, `endDate`, `targeting`, `metadata` | Has many `campaignStat`, `couponRedemption`, `voucherClaim` | `campaign_status_idx` |
| `campaignStat` | Campaign performance stats | `id`, `campaignId`, `metric`, `value`, `dimensions`, `date` | Belongs to `campaign` | `campaign_stat_campaign_idx` |
| `couponRedemption` | Coupon redemption log | `id`, `campaignId`, `couponCode`, `userId`, `amount`, `metadata` | Belongs to `campaign` | `coupon_redemption_campaign_idx` |
| `voucherClaim` | Voucher claim log | `id`, `campaignId`, `voucherCode`, `userId`, `amount`, `metadata` | Belongs to `campaign` | `voucher_claim_campaign_idx` |

---

## 52. Payments

**Schema File:** `payments.ts` | **Owner:** Payments
**Tables:** 9 | **Purpose:** Payment processing, invoices, refunds, webhooks, payment methods, profiles

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `payment` | Payment records | `id`, `userId`, `workspaceId`, `amount`, `currency`, `status`, `provider`, `method`, `metadata` | Has many `paymentItem`, `paymentRefund`, `paymentLog` | `payment_user_idx`, `payment_status_idx` |
| `paymentItem` | Line items per payment | `id`, `paymentId` (FK → payment), `description`, `amount`, `quantity`, `metadata` | Belongs to `payment` | `payment_item_payment_idx` |
| `paymentInvoice` | Payment invoices | `id`, `paymentId`, `userId`, `amount`, `currency`, `status`, `dueDate`, `metadata` | — | `payment_invoice_user_idx` |
| `paymentRefund` | Refund records | `id`, `paymentId` (FK → payment), `amount`, `reason`, `status`, `metadata` | Belongs to `payment` | `payment_refund_payment_idx` |
| `paymentWebhook` | Webhook event log | `id`, `provider`, `eventType`, `payload`, `status`, `metadata` | — | `payment_webhook_provider_idx` |
| `paymentLog` | Payment processing log | `id`, `paymentId` (FK → payment), `action`, `status`, `metadata` | Belongs to `payment` | `payment_log_payment_idx` |
| `paymentMethod` | Stored payment methods | `id`, `userId`, `type`, `provider`, `last4`, `isDefault`, `metadata` | — | `payment_method_user_idx` |
| `paymentProfile` | Payment configurations | `id`, `code`, `name`, `isEnabled`, `config`, `metadata` | — | — |
| `paymentProfileInfo` | Profile details | `id`, `profileId`, `key`, `value`, `metadata` | — | — |

---

## 53. Observability

**Schema File:** `observability.ts` | **Owner:** Observability
**Tables:** 9 | **Purpose:** Logs, metrics, traces, errors, alerts, dashboards, reports, retention, settings

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `obsLog` | Application logs | `id`, `level`, `message`, `source`, `metadata`, `createdAt` | — | `obs_log_level_idx`, `obs_log_source_idx`, `obs_log_created_idx` |
| `obsMetric` | Observability metrics | `id`, `name`, `value`, `unit`, `tags`, `createdAt` | — | `obs_metric_name_idx`, `obs_metric_created_idx` |
| `obsTrace` | Distributed traces | `id`, `traceId`, `spanId`, `parentSpanId`, `name`, `durationMs`, `status`, `metadata`, `createdAt` | — | `obs_trace_trace_idx`, `obs_trace_created_idx` |
| `obsError` | Error tracking | `id`, `type`, `message`, `stack`, `source`, `userId`, `metadata`, `createdAt` | — | `obs_error_type_idx`, `obs_error_source_idx`, `obs_error_created_idx` |
| `obsAlert` | Alert definitions | `id`, `name`, `condition`, `threshold`, `isActive`, `lastTriggeredAt`, `metadata` | — | `obs_alert_active_idx` |
| `obsDashboard` | Observability dashboards | `id`, `name`, `widgets`, `userId`, `metadata` | — | — |
| `obsReport` | Observability reports | `id`, `name`, `type`, `data`, `generatedAt`, `metadata` | — | — |
| `obsRetentionPolicy` | Data retention rules | `id`, `type`, `retentionDays`, `isActive`, `metadata` | — | — |
| `obsSettings` | Observability config | `id`, `key`, `value`, `description` | — | — |

---

## 54. Operations

**Schema File:** `operations.ts` | **Owner:** Operations
**Tables:** 10 | **Purpose:** Ops metrics, incidents, deployments, health snapshots, maintenance, alerts, reports, worker logs, audit

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `opsMetric` | Operations metrics | `id`, `name`, `value`, `unit`, `category`, `metadata`, `recordedAt` | — | `ops_metric_name_idx`, `ops_metric_recorded_idx` |
| `opsIncident` | Ops incidents | `id`, `title`, `severity`, `status`, `description`, `assignedTo`, `resolvedAt`, `metadata` | — | `ops_incident_status_idx`, `ops_incident_severity_idx` |
| `opsDeployment` | Deployment tracking | `id`, `version`, `environment`, `status`, `startedAt`, `completedAt`, `metadata` | — | `ops_deployment_status_idx` |
| `opsHealthSnapshot` | Point-in-time health | `id`, `services`, `overallStatus`, `metadata`, `createdAt` | — | `ops_health_created_idx` |
| `opsMaintenance` | Maintenance windows | `id`, `title`, `description`, `startAt`, `endAt`, `status`, `metadata` | — | `ops_maintenance_status_idx` |
| `opsAlert` | Ops alert rules | `id`, `name`, `condition`, `threshold`, `isActive`, `lastTriggeredAt`, `metadata` | — | `ops_alert_active_idx` |
| `opsReport` | Ops reports | `id`, `name`, `type`, `data`, `generatedAt`, `metadata` | — | — |
| `opsSettings` | Ops config | `id`, `key`, `value`, `description` | — | — |
| `opsWorkerLog` | Worker execution logs | `id`, `workerId`, `action`, `status`, `duration`, `metadata` | — | `ops_worker_log_worker_idx` |
| `opsAuditEvent` | Ops audit trail | `id`, `action`, `actorId`, `targetType`, `targetId`, `metadata`, `createdAt` | — | `ops_audit_event_created_idx` |

---

## 55. Scaling

**Schema File:** `scaling.ts` | **Owner:** Scaling
**Tables:** 9 | **Purpose:** Auto-scaling metrics, queue/worker/cost metrics, capacity forecasting, load testing, performance reports

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `scaleMetric` | Scaling metrics | `id`, `name`, `value`, `unit`, `category`, `dimensions`, `recordedAt` | — | `scale_metric_name_idx`, `scale_metric_recorded_idx` |
| `scaleQueueMetric` | Queue depth metrics | `id`, `queueName`, `depth`, `waitTimeMs`, `throughput`, `recordedAt` | — | `scale_queue_metric_name_idx` |
| `scaleWorkerMetric` | Worker utilization metrics | `id`, `workerName`, `cpu`, `memory`, `taskCount`, `recordedAt` | — | `scale_worker_metric_name_idx` |
| `scaleCostMetric` | Cost tracking metrics | `id`, `category`, `amount`, `currency`, `period`, `metadata`, `recordedAt` | — | `scale_cost_metric_category_idx` |
| `scaleCapacityForecast` | Capacity predictions | `id`, `resource`, `forecastDate`, `predictedValue`, `confidence`, `metadata` | — | `scale_capacity_forecast_resource_idx` |
| `scaleResourceLimit` | Resource limits | `id`, `resource`, `limit`, `current`, `unit`, `metadata` | — | `scale_resource_limit_resource_idx` |
| `scaleLoadTest` | Load test results | `id`, `name`, `config`, `results`, `status`, `metadata`, `createdAt` | — | — |
| `scalePerformanceReport` | Performance analysis | `id`, `name`, `scores`, `recommendations`, `metadata`, `createdAt` | — | — |
| `scaleSettings` | Scaling config | `id`, `key`, `value`, `description` | — | — |

---

## 56. Beta

**Schema File:** `beta.ts` | **Owner:** Beta Program
**Tables:** 9 | **Purpose:** Beta program user management, invitations, feedback, bug reports, feature requests, announcements, ratings, readiness, settings

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `betaUser` | Beta program participants | `id`, `userId`, `status`, `enrolledAt`, `metadata` | — | `beta_user_user_idx`, `beta_user_status_idx` |
| `betaInvitation` | Beta invitations | `id`, `email`, `status`, `invitedBy`, `token`, `expiresAt`, `metadata` | — | `beta_invitation_email_idx` |
| `betaFeedback` | Beta user feedback | `id`, `userId`, `type`, `rating`, `comment`, `metadata` | — | `beta_feedback_user_idx` |
| `betaBugReport` | Bug reports | `id`, `userId`, `title`, `description`, `severity`, `status`, `metadata` | — | `beta_bug_report_user_idx`, `beta_bug_report_status_idx` |
| `betaFeatureRequest` | Feature requests | `id`, `userId`, `title`, `description`, `votes`, `status`, `metadata` | — | `beta_feature_request_user_idx` |
| `betaAnnouncement` | Beta announcements | `id`, `title`, `content`, `type`, `metadata`, `createdAt` | — | `beta_announcement_type_idx` |
| `betaRating` | Beta ratings | `id`, `userId`, `category`, `score`, `comment`, `metadata` | — | `beta_rating_user_idx` |
| `betaReadiness` | Launch readiness tracking | `id`, `category`, `item`, `status`, `owner`, `metadata` | — | `beta_readiness_status_idx` |
| `betaSettings` | Beta program config | `id`, `key`, `value`, `description` | — | — |

---

## 57. Launch

**Schema File:** `launch.ts` | **Owner:** Launch
**Tables:** 6 | **Purpose:** Launch event management, checklists, certifications, metrics, reports, settings

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `launchEvent` | Launch events | `id`, `name`, `type`, `status`, `scheduledAt`, `metadata` | Has many `launchChecklist`, `launchMetric` | `launch_event_status_idx` |
| `launchChecklist` | Launch checklists | `id`, `eventId`, `item`, `status`, `owner`, `dueDate`, `metadata` | Belongs to `launchEvent` | `launch_checklist_event_idx` |
| `launchCertification` | Launch certifications | `id`, `eventId`, `name`, `status`, `verifiedAt`, `metadata` | Belongs to `launchEvent` | `launch_certification_event_idx` |
| `launchMetric` | Launch metrics | `id`, `eventId`, `name`, `value`, `target`, `metadata` | Belongs to `launchEvent` | `launch_metric_event_idx` |
| `launchReport` | Launch reports | `id`, `eventId`, `name`, `data`, `generatedAt`, `metadata` | Belongs to `launchEvent` | `launch_report_event_idx` |
| `launchSettings` | Launch config | `id`, `key`, `value`, `description` | — | — |

---

## 58. Hypercare

**Schema File:** `hypercare.ts` | **Owner:** Hypercare
**Tables:** 8 | **Purpose:** Post-launch hypercare — incidents, health checks, feedback, hotfixes, KPIs, reports, root cause analysis

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `hypercareIncident` | Hypercare incidents | `id`, `title`, `severity`, `status`, `description`, `assignedTo`, `resolvedAt`, `metadata` | — | `hypercare_incident_status_idx`, `hypercare_incident_severity_idx` |
| `hypercareHealthCheck` | Health check results | `id`, `serviceName`, `status`, `latencyMs`, `metadata`, `checkedAt` | — | `hypercare_health_check_service_idx` |
| `hypercareFeedback` | User feedback | `id`, `userId`, `type`, `rating`, `comment`, `metadata` | — | `hypercare_feedback_user_idx` |
| `hypercareHotfix` | Hotfix deployments | `id`, `title`, `description`, `status`, `deployedAt`, `metadata` | — | `hypercare_hotfix_status_idx` |
| `hypercareKpi` | KPI tracking | `id`, `name`, `value`, `target`, `unit`, `metadata`, `recordedAt` | — | `hypercare_kpi_name_idx` |
| `hypercareReport` | Hypercare reports | `id`, `name`, `data`, `generatedAt`, `metadata` | — | — |
| `hypercareRootCause` | Root cause analysis | `id`, `incidentId`, `cause`, `resolution`, `prevention`, `metadata` | — | `hypercare_root_cause_incident_idx` |
| `hypercareSettings` | Hypercare config | `id`, `key`, `value`, `description` | — | — |

---

## 59. Product Intelligence

**Schema File:** `product-intelligence.ts` | **Owner:** Product Intelligence
**Tables:** 11 | **Purpose:** Product metrics, KPIs, funnels, cohorts, segments, forecasts, decision tracking, dashboards, reports, exports

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `productMetric` | Product metrics | `id`, `name`, `value`, `unit`, `category`, `dimensions`, `recordedAt` | — | `product_metric_name_idx`, `product_metric_recorded_idx` |
| `productKpi` | Key product indicators | `id`, `name`, `currentValue`, `targetValue`, `trend`, `status`, `metadata` | — | `product_kpi_name_idx`, `product_kpi_status_idx` |
| `productFunnel` | Conversion funnels | `id`, `name`, `steps`, `metadata`, `createdAt` | — | — |
| `productCohort` | Cohort analysis | `id`, `name`, `cohortDate`, `segments`, `metadata` | — | `product_cohort_date_idx` |
| `productSegment` | User segments | `id`, `name`, `rules`, `userCount`, `metadata` | — | — |
| `productForecast` | Product forecasts | `id`, `metric`, `forecastDate`, `predictedValue`, `confidence`, `metadata` | — | `product_forecast_metric_idx` |
| `productDecision` | Product decisions log | `id`, `title`, `description`, `status`, `decision`, `owner`, `metadata` | — | `product_decision_status_idx` |
| `productDashboard` | Product dashboards | `id`, `name`, `widgets`, `userId`, `metadata` | — | — |
| `productReport` | Product reports | `id`, `name`, `type`, `data`, `generatedAt`, `metadata` | — | — |
| `productExport` | Data exports | `id`, `name`, `format`, `status`, `fileUrl`, `requestedBy`, `completedAt` | — | `product_export_status_idx` |
| `productSettings` | Product intelligence config | `id`, `key`, `value`, `description` | — | — |

---

## 60. Prompt Intelligence

**Schema File:** `prompt-intelligence.ts` | **Owner:** Prompt
**Tables:** 9 | **Purpose:** Prompt library, templates, history, analytics, collections, testing, variables, versioning, settings

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `promptLibrary` | Prompt library entries | `id`, `userId`, `name`, `prompt`, `category`, `tags`, `isFavorite`, `useCount`, `metadata` | — | `prompt_library_user_idx`, `prompt_library_category_idx` |
| `promptTemplate` | Prompt templates | `id`, `name`, `description`, `template`, `variables`, `category`, `isSystem`, `metadata` | — | `prompt_template_category_idx` |
| `promptHistory` | Prompt usage history | `id`, `userId`, `promptId`, `input`, `output`, `model`, `tokens`, `duration`, `metadata` | — | `prompt_history_user_idx` |
| `promptAnalytics` | Prompt performance analytics | `id`, `promptId`, `metric`, `value`, `dimensions`, `recordedAt` | — | `prompt_analytics_prompt_idx` |
| `promptCollections` | Prompt collections/groups | `id`, `userId`, `name`, `description`, `prompts`, `metadata` | — | `prompt_collections_user_idx` |
| `promptTests` | Prompt test results | `id`, `promptId`, `input`, `expectedOutput`, `actualOutput`, `score`, `metadata` | — | `prompt_tests_prompt_idx` |
| `promptVariables` | Variable definitions | `id`, `templateId`, `name`, `type`, `defaultValue`, `description`, `metadata` | — | `prompt_variables_template_idx` |
| `promptVersions` | Prompt version history | `id`, `promptId`, `version`, `content`, `changelog`, `metadata` | — | `prompt_versions_prompt_idx` |
| `promptSettings` | Prompt intelligence config | `id`, `key`, `value`, `description` | — | — |

---

## 61. Quality Assurance

**Schema File:** `quality-assurance.ts` | **Owner:** QA
**Tables:** 9 | **Purpose:** Quality rules, validations, scoring, reports, recommendations, audit logs, retries, thresholds, settings

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `qualityRule` | Quality validation rules | `id`, `name`, `type`, `condition`, `severity`, `isActive`, `metadata` | — | `quality_rule_type_idx`, `quality_rule_active_idx` |
| `qualityValidation` | Validation results | `id`, `ruleId`, `targetType`, `targetId`, `status`, `score`, `details`, `metadata` | — | `quality_validation_rule_idx`, `quality_validation_status_idx` |
| `qualityScore` | Quality scores | `id`, `targetType`, `targetId`, `category`, `score`, `maxScore`, `metadata` | — | `quality_score_target_idx` |
| `qualityReport` | QA reports | `id`, `name`, `type`, `data`, `generatedAt`, `metadata` | — | — |
| `qualityRecommendation` | Improvement recommendations | `id`, `targetType`, `targetId`, `recommendation`, `priority`, `status`, `metadata` | — | `quality_recommendation_target_idx` |
| `qualityAuditLog` | QA audit trail | `id`, `action`, `actorId`, `targetType`, `targetId`, `metadata`, `createdAt` | — | `quality_audit_log_created_idx` |
| `qualityRetryHistory` | Retry attempt tracking | `id`, `targetType`, `targetId`, `attemptCount`, `lastAttemptAt`, `status`, `metadata` | — | `quality_retry_target_idx` |
| `qualityThreshold` | Quality thresholds | `id`, `category`, `minScore`, `maxScore`, `metadata` | — | `quality_threshold_category_idx` |
| `qualitySettings` | QA config | `id`, `key`, `value`, `description` | — | — |

---

## 62. Auth Events

**Schema File:** `auth-events.ts` | **Owner:** Auth Events
**Tables:** 1 | **Purpose:** Failed login attempt tracking

| Table | Purpose | Key Columns | Relationships | Indexes |
|---|---|---|---|---|
| `failedLoginAttempt` | Failed login audit | `id`, `email`, `ipAddress`, `userAgent`, `reason`, `createdAt` | — | `failed_login_email_idx`, `failed_login_created_idx` |

---

## Statistics

| Category | Count |
|---|---|
| **Total Schema Files** | 62 |
| **Total pgTable Definitions** | 388 |
| **Total Modules** | 63 |
| **Total Migrations** | 39 (0000–00038) |
| **Total Unique Tables** | ~380 (some tables are defined in multiple schema files with different scopes, e.g., `asset_collection`, `asset_tag`) |

### Tables per Module (Top 20)

| Module | Table Count |
|---|---|
| Billing Module | 7 |
| Asset | 11 |
| Asset Intelligence | 11 |
| Support | 10 |
| Commerce Module | 10 |
| Email | 9 |
| AI Gateway | 9 |
| Creative Memory | 13 |
| Workflows | 8 |
| Security | 8 |
| Drama Studio | 8 |
| Auth Module | 8 |
| CMS Module | 9 |
| Story Engine | 7 |
| Identity Module | 11 |
| Pricing | 5 |
| Monitoring | 5 |
| BI | 5 |
| Notifications | 5 |

### Cross-Module Relationships

```
user (auth) ←── userProfile (identity)
user (auth) ←── workspace.ownerId (identity)
user (auth) ←── workspaceMember.userId (identity)
user (auth) ←── session.userId (auth)
user (auth) ←── account.userId (auth)
user (auth) ←── securityEvent.userId (auth)
user (auth) ←── trustedDevice.userId (auth)
user (auth) ←── userTwoFactor.userId (auth)

workspace (identity) ←── wallet.workspaceId (billing)
workspace (identity) ←── subscription.workspaceId (billing)
workspace (identity) ←── order.workspaceId (commerce)
workspace (identity) ←── apiKey.workspaceId (identity)
workspace (identity) ←── workspaceMember.workspaceId (identity)

aiProvider (ai-providers) ←── aiProviderModel.providerId
aiProvider (ai-providers) ←── aiCircuitBreaker.providerId (ai-gateway)

order (commerce) ←── checkoutSession.orderId
order (commerce) ←── paymentIntent.orderId
order (commerce) ←── refund.orderId

plan (commerce-plans) ←── planPricing.planId
billingOption (commerce-plans) ←── planPricing.billingOptionId

wallet (billing) ←── creditTransaction.walletId
wallet (billing) ←── creditReservation.walletId

cmsPage (cms) ←── cmsSection.pageId
cmsSection (cms) ←── cmsBlock.sectionId
cmsPublishPipeline (cms) ←── cmsPublishStep.pipelineId

workflow (workflows) ←── workflowNode.workflowId
workflow (workflows) ←── workflowConnection.workflowId
workflow (workflows) ←── workflowVariable.workflowId
workflow (workflows) ←── workflowExecution.workflowId
workflow (workflows) ←── workflowRun.workflowId
workflowRun (workflows) ←── workflowRunLog.runId

project (project-studio) ←── projectNote.projectId
project (project-studio) ←── projectTimeline.projectId
project (project-studio) ←── projectActivity.projectId

videoProject (video-studio) ←── videoStoryboard.projectId
videoStoryboard (video-studio) ←── videoScene.storyboardId

dramaProject (drama-studio) ←── dramaEpisode.projectId
dramaEpisode (drama-studio) ←── dramaScene.episodeId

story (story-engine) ←── storyCharacter.storyId
story (story-engine) ←── storyEpisode.storyId
story (story-engine) ←── storyEvent.storyId

supportTicket (support) ←── supportTicketComment.ticketId
supportTicket (support) ←── supportAttachment.ticketId
supportTicket (support) ←── supportInternalNote.ticketId
supportSlaPolicy (support) ←── supportSlaViolation.policyId
```

### Common Column Patterns

| Pattern | Usage |
|---|---|
| `id: text("id").primaryKey()` | Universal — all tables use text PKs |
| `createdAt: timestamp("created_at").defaultNow().notNull()` | Present on nearly all tables |
| `updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull()` | Present on most mutable tables |
| `deletedAt: timestamp("deleted_at")` | Soft delete on select tables (cmsPage, supportTicket, etc.) |
| `metadata: jsonb("metadata").$type<Record<string, unknown>>()` | Extensively used for extensible data |
| `status: varchar/text("status")` | State machine columns on most entities |
| `userId: text("user_id").notNull()` | User ownership column pattern |
| `workspaceId: text("workspace_id")` | Multi-tenancy column pattern |

---

*Document generated from source schema analysis. All table definitions verified against `src/lib/db/schema/*.ts` files.*

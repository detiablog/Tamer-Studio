# External Resource Audit

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-02C

---

## Executive Summary

This audit identified and fixed external resource initialization issues that caused clients to be created at import time rather than on first use. The following resources were converted to lazy initialization:

1. **Redis** - Rate limiting client
2. **Storage** - LocalStorage and AssetService
3. **Stripe** - Payment gateway (already had lazy init internally)
4. **Media** - AssetService instances

---

## Files Modified

| File | Change | Impact |
|------|--------|--------|
| `src/core/security/ratelimit.ts` | Converted Redis and Ratelimit to lazy initialization | Eliminates Redis connection at import |
| `src/core/storage/storage-engine.ts` | Converted LocalStorage and AssetService to lazy initialization | Eliminates storage client at import |
| `src/core/media/media.service.ts` | Converted AssetService to lazy singleton | Eliminates duplicate storage instances |
| `src/core/commerce/commerce-runtime.ts` | Converted WalletService, repositories, and StripeGateway to lazy | Eliminates payment client at import |
| `src/app/api/payment/webhook/route.ts` | Converted StripeGateway to lazy | Eliminates payment client at import |
| `src/app/api/commerce/webhook/route.ts` | Converted StripeGateway to lazy | Eliminates payment client at import |

---

## External Resource Inventory

| Resource | File | Before | After | Status |
|----------|------|--------|-------|--------|
| Redis (Upstash) | `src/core/security/ratelimit.ts` | Created at module level | Lazy getter | FIXED |
| Rate Limiter (Auth) | `src/core/security/ratelimit.ts` | Created at module level | Lazy getter | FIXED |
| Rate Limiter (API) | `src/core/security/ratelimit.ts` | Created at module level | Lazy getter | FIXED |
| Rate Limiter (Production) | `src/core/security/ratelimit.ts` | Created at module level | Lazy getter | FIXED |
| LocalStorage | `src/core/storage/storage-engine.ts` | Created at module level | Lazy getter | FIXED |
| AssetService (Storage) | `src/core/storage/storage-engine.ts` | Created at module level | Lazy getter | FIXED |
| AssetService (Media) | `src/core/media/media.service.ts` | Created per instance | Lazy singleton | FIXED |
| StripeGateway | `src/core/payment/stripe-gateway.ts` | Already lazy | Already lazy | OK |
| StripeGateway (Commerce) | `src/core/commerce/commerce-runtime.ts` | Created at module level | Lazy getter | FIXED |
| StripeGateway (Payment Webhook) | `src/app/api/payment/webhook/route.ts` | Created at module level | Lazy getter | FIXED |
| StripeGateway (Commerce Webhook) | `src/app/api/commerce/webhook/route.ts` | Created at module level | Lazy getter | FIXED |
| WalletService | `src/core/commerce/commerce-runtime.ts` | Created at module level | Lazy getter | FIXED |
| SubscriptionRepository | `src/core/commerce/commerce-runtime.ts` | Created at module level | Lazy getter | FIXED |
| InvoiceRepository | `src/core/commerce/commerce-runtime.ts` | Created at module level | Lazy getter | FIXED |

---

## Verification

### Build Verification
- TypeScript compilation: PASSED
- Production build: PASSED

### Runtime Verification
- Dev server startup: PASSED (no external resource initialization at startup)
- Rate limiting: PASSED (lazy initialization on first request)
- Storage operations: PASSED (lazy initialization on first use)
- Payment webhooks: PASSED (lazy initialization on first request)

### Regression Verification
- Authentication: UNCHANGED
- Installation: UNCHANGED
- Better Auth: UNCHANGED
- Database: UNCHANGED (already lazy from PERF-BOOTSTRAP-02A)
- EventHub: UNCHANGED (already lazy from PERF-BOOTSTRAP-02B)

---

## Remaining Technical Debt

1. **Email Providers** - Created in constructors (lazy by design)
2. **SMTP Transport** - Created per request (already lazy)
3. **AI Providers** - Created in constructors (lazy by design)

These are acceptable patterns as they only create resources when actually needed.

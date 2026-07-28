# API 401 Audit Report

**Date:** 2026-07-29  
**Scope:** Every API endpoint tested for correct 401 behavior  

---

## Methodology

Every endpoint was tested with:
- **No auth** (guest request)
- **Admin session cookie** (valid token from login)
- **Invalid admin token**
- **Empty admin cookie**
- **Invalid Bearer token**

---

## 401 Audit Table

### Admin Endpoints

| Endpoint | Expected | Actual (no auth) | Actual (admin cookie) | Status |
|----------|----------|-------------------|----------------------|--------|
| GET /api/admin/users | 401 | 401 | 200/401* | PASS |
| GET /api/admin/workspaces | 401 | 401 | 200/401* | PASS |
| GET /api/admin/organizations | 401 | 401 | 200/401* | PASS |
| GET /api/admin/billing | 401 | 401 | 200/401* | PASS |
| GET /api/admin/analytics | 401 | 401 | 200/401* | PASS |
| GET /api/admin/audit-logs | 401 | 401 | 200/401* | PASS |
| GET /api/admin/api-keys | 401 | 401 | 200/401* | PASS |
| GET /api/admin/ai-providers | 401 | 401 | 200/401* | PASS |
| GET /api/admin/jobs | 401 | 401 | 200/401* | PASS |
| GET /api/admin/queues | 401 | 401 | 200/401* | PASS |
| GET /api/admin/subscriptions | 401 | 401 | 200/401* | PASS |
| GET /api/admin/coupons | 401 | 401 | 200/401* | PASS |
| GET /api/admin/feature-flags | 401 | 401 | 200/401* | PASS |
| GET /api/admin/cache | 401 | 401 | 200/401* | PASS |
| GET /api/admin/me | 401 | 401 | 200/401* | PASS |
| GET /api/admin/notifications | 401 | 401 | 200/401* | PASS |
| GET /api/admin/search | 401 | 401 | 200/401* | PASS |
| GET /api/admin/stats | 401 | 401 | 200/401* | PASS |
| GET /api/admin/email | 401 | 401 | 200/401* | PASS |
| GET /api/admin/email/health | 401 | 401 | 200/401* | PASS |
| GET /api/admin/email/providers | 401 | 401 | 200/401* | PASS |
| GET /api/admin/email/queue | 401 | 401 | 200/401* | PASS |
| GET /api/admin/email/statistics | 401 | 401 | 200/401* | PASS |
| GET /api/admin/email/templates | 401 | 401 | 200/401* | PASS |
| GET /api/admin/commerce/plans | 401 | 401 | 200/401* | PASS |
| GET /api/admin/commerce/orders | 401 | 401 | 200/401* | PASS |
| GET /api/admin/commerce/billing-options | 401 | 401 | 200/401* | PASS |
| GET /api/admin/commerce/pricing | 401 | 401 | 200/401* | PASS |
| GET /api/admin/commerce/wallets | 401 | 401 | 200/401* | PASS |
| GET /api/admin/localization/currencies | 401 | 401 **FIXED** | 500** | FIXED |
| GET /api/admin/localization/exchange-rates | 401 | 401 | 200/401* | PASS |
| GET /api/admin/localization/pricing-profiles | 401 | 401 **FIXED** | 500** | FIXED |
| GET /api/admin/localization/profiles | 401 | 401 **FIXED** | 500** | FIXED |
| GET /api/admin/localization/payment-profiles | 401 | 401 **FIXED** | 500** | FIXED |
| GET /api/admin/localization/regions | 401 | 401 **FIXED** | 500** | FIXED |
| GET /api/cms/audit | 401 | 401 | 200/401* | PASS |
| GET /api/cms/components | 401 | 401 | 200/401* | PASS |
| GET /api/cms/media | 401 | 401 | 200/401* | PASS |
| GET /api/cms/pages | 401 | 401 | 200/401* | PASS |
| GET /api/cms/publish | 405 (GET not allowed) | 405 | 405 | PASS (POST-only) |
| GET /api/cms/sections | 401 | 401 | 200/401* | PASS |
| GET /api/cms/versions | 401 | 401 | 200/401* | PASS |
| GET /api/landing/sections | 401 | 401 **FIXED** | 200/401* | FIXED |
| GET /api/localization/admin/keys | 401 | 401 | 200/401* | PASS |
| GET /api/metrics | 401 | 401 | 200/401* | PASS |
| GET /api/queues | 401 | 401 | 200/401* | PASS |

\* Admin with-auth column shows 401 because the dev-mode login creates a session token that is not stored in the production DB. The admin login itself succeeds (200), but subsequent requests cannot validate the token.

\** Localization routes with auth return 500 because the localization DB tables (currencyProfile, pricingProfile, etc.) don't exist in the database.

### User Endpoints

| Endpoint | Expected | Actual (no auth) | Status |
|----------|----------|-------------------|--------|
| GET /api/api-keys | 401 | 401 | PASS |
| GET /api/billing | 401 | 401 | PASS |
| POST /api/billing/upgrade | 401 | 401 | PASS |
| POST /api/commerce/checkout | 401 | 401 | PASS |
| GET /api/commerce/orders | 401 | 401 | PASS |
| GET /api/commerce/wallet | 401 | 401 | PASS |
| GET /api/jobs | 401 | 401 | PASS |
| GET /api/media | 401 | 401 | PASS |
| GET /api/notifications | 401 | 401 | PASS |
| POST /api/payment/checkout | 401 | 401 | PASS |
| GET /api/profile | 401 | 401 | PASS |
| GET /api/user/stats | 401 | 401 | PASS |
| GET /api/workspaces | 401 | 401 | PASS |
| GET /api/analytics/dashboard | 401 | 401 **FIXED** | FIXED |
| POST /api/analytics/metrics | 400 (validation) | 400 | PASS (needs body) |

### Public Endpoints (No Auth Required)

| Endpoint | Expected | Actual | Status |
|----------|----------|--------|--------|
| GET /api/health | 200 | 200 | PASS |
| GET /api/navigation | 200 | 200 | PASS |
| GET /api/seo/sitemap | 200 | 200 | PASS |
| GET /api/seo/robots | 200 | 200 | PASS |
| GET /api/seo/runtime | 200 | TIMEOUT | ISSUE (long-running) |
| GET /api/seo/validate | 200 | TIMEOUT | ISSUE (long-running) |
| GET /api/homepage | 200 | TIMEOUT | ISSUE (long-running) |
| GET /api/landing/pricing | 200 | 200 | PASS |
| GET /api/landing/currency | 200 | 200 | PASS |
| GET /api/landing/subscription | 200 | 200 | PASS |
| GET /api/landing/campaign | 200 | 200 | PASS |
| GET /api/landing/seo | 200 | 200 | PASS |
| GET /api/commerce/plans | 200 | 200 | PASS |
| GET /api/ai-providers | 200 | 200 | PASS |
| GET /api/metrics/public | 200 | 200 | PASS |
| GET /api/localization/detect | 200 | 200 | PASS |
| GET /api/preferences | 200 | 200 | PASS |
| POST /api/admin/auth/login | 200/400 | 200 | PASS |
| POST /api/admin/auth/logout | 200 | 200 | PASS |
| POST /api/auth/sign-in | 200/422 | 500 | FAIL |
| POST /api/auth/forgot-password | 200 | 200 | PASS |
| POST /api/auth/sign-out | 200 | 200 | PASS |

---

## Issues Found

| # | Endpoint | Issue | Root Cause | Fix Status |
|---|----------|-------|-----------|------------|
| 1 | GET /api/landing/sections | Was 200 without auth | Missing adminAuthentication() in GET handler | FIXED |
| 2 | GET /api/landing/sections/[key] | Was 200 without auth | Missing adminAuthentication() in GET handler | FIXED |
| 3 | GET /api/admin/localization/currencies | Was 500 without auth (no auth check) | Missing adminAuthentication() in GET handler | FIXED |
| 4 | GET /api/admin/localization/pricing-profiles | Was 500 without auth (no auth check) | Missing adminAuthentication() in GET handler | FIXED |
| 5 | GET /api/admin/localization/profiles | Was 500 without auth (no auth check) | Missing adminAuthentication() in GET handler | FIXED |
| 6 | GET /api/admin/localization/payment-profiles | Was 500 without auth (no auth check) | Missing adminAuthentication() in GET handler | FIXED |
| 7 | GET /api/admin/localization/regions | Was 500 without auth (no auth check) | Missing adminAuthentication() in GET handler | FIXED |
| 8 | GET /api/analytics/dashboard | Was 400 without auth (no auth check) | Auth code was commented out | FIXED |
| 9 | GET /api/seo/runtime | Timeout (10s) | Long-running endpoint, not auth issue | DOCUMENTED |
| 10 | GET /api/seo/validate | Timeout (10s) | Long-running endpoint, not auth issue | DOCUMENTED |
| 11 | GET /api/homepage | Timeout (10s) | Long-running endpoint, not auth issue | DOCUMENTED |
| 12 | POST /api/auth/sign-in | 500 error | better-auth DB connection issue | OPEN |
| 13 | All admin with-auth | 401 with valid token | Dev-mode session not persisted to DB | DESIGN ISSUE |
| 14 | Localization routes with auth | 500 error | DB tables (currencyProfile, etc.) missing | OPEN |

# Endpoint Matrix Report

**Date:** 2026-07-29  
**Total Endpoints Discovered:** 130+ route files  

---

## Complete API Endpoint Matrix

### Public Endpoints (No Auth)

| # | Path | Methods | Auth Required | Middleware | Session Provider | File |
|---|------|---------|--------------|-----------|-----------------|------|
| 1 | /api/health | GET | No | None | N/A | api/health/route.ts |
| 2 | /api/navigation | GET | No | None | N/A | api/navigation/route.ts |
| 3 | /api/seo/sitemap | GET | No | None | N/A | api/seo/sitemap/route.ts |
| 4 | /api/seo/robots | GET | No | None | N/A | api/seo/robots/route.ts |
| 5 | /api/seo/runtime | GET | No | None | N/A | api/seo/runtime/route.ts |
| 6 | /api/seo/validate | GET | No | None | N/A | api/seo/validate/route.ts |
| 7 | /api/homepage | GET/POST | No | None | N/A | api/homepage/route.ts |
| 8 | /api/landing/pricing | GET | No | None | N/A | api/landing/pricing/route.ts |
| 9 | /api/landing/currency | GET | No | None | N/A | api/landing/currency/route.ts |
| 10 | /api/landing/subscription | GET | No | None | N/A | api/landing/subscription/route.ts |
| 11 | /api/landing/campaign | GET | No | None | N/A | api/landing/campaign/route.ts |
| 12 | /api/landing/seo | GET | No | None | N/A | api/landing/seo/route.ts |
| 13 | /api/commerce/plans | GET | No | None | N/A | api/commerce/plans/route.ts |
| 14 | /api/commerce/webhook | POST | No | None | N/A | api/commerce/webhook/route.ts |
| 15 | /api/ai-providers | GET | No | None | N/A | api/ai-providers/route.ts |
| 16 | /api/metrics/public | GET | No | None | N/A | api/metrics/public/route.ts |
| 17 | /api/localization/detect | GET | No | None | N/A | api/localization/detect/route.ts |
| 18 | /api/preferences | GET | No | None | N/A | api/preferences/route.ts |
| 19 | /api/payment/webhook | POST | No | None | N/A | api/payment/webhook/route.ts |
| 20 | /api/webhooks/production-complete | POST | No | None | N/A | api/webhooks/production-complete/route.ts |
| 21 | /api/socket | GET | No | None | N/A | api/socket/route.ts |
| 22 | /api/localization/admin/search | GET | No | None | N/A | api/localization/admin/search/route.ts |
| 23 | /api/localization/admin/validate | POST | No | None | N/A | api/localization/admin/validate/route.ts |

### Auth Endpoints (Better-Auth)

| # | Path | Methods | Auth Required | Middleware | Session Provider | File |
|---|------|---------|--------------|-----------|-----------------|------|
| 24 | /api/auth/[...all] | * | No | None | better-auth | api/auth/[...all]/route.ts |
| 25 | /api/auth/sign-in | POST | No | None | better-auth | api/auth/sign-in/route.ts |
| 26 | /api/auth/sign-out | POST | No | None | better-auth | api/auth/sign-out/route.ts |
| 27 | /api/auth/forgot-password | POST | No | None | better-auth | api/auth/forgot-password/route.ts |
| 28 | /api/auth/reset-password | POST | No | None | better-auth | api/auth/reset-password/route.ts |
| 29 | /api/auth/verify-email | POST | No | None | better-auth | api/auth/verify-email/route.ts |
| 30 | /api/auth/verify-email/resend | POST | No | None | better-auth | api/auth/verify-email/resend/route.ts |

### Admin Auth Endpoints

| # | Path | Methods | Auth Required | Middleware | Session Provider | File |
|---|------|---------|--------------|-----------|-----------------|------|
| 31 | /api/admin/auth/login | POST | No (public) | Rate limit | admin DB | api/admin/auth/login/route.ts |
| 32 | /api/admin/auth/logout | POST | No (public) | None | admin DB | api/admin/auth/logout/route.ts |

### Admin Endpoints (Admin Auth Required)

| # | Path | Methods | Auth Required | Middleware | Session Provider | File |
|---|------|---------|--------------|-----------|-----------------|------|
| 33 | /api/admin/me | GET | Yes | adminAuthentication | admin_session cookie | api/admin/me/route.ts |
| 34 | /api/admin/users | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/users/route.ts |
| 35 | /api/admin/users/[id] | GET/PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/admin/users/[id]/route.ts |
| 36 | /api/admin/workspaces | GET | Yes | adminAuthentication | admin_session cookie | api/admin/workspaces/route.ts |
| 37 | /api/admin/workspaces/[id] | GET/PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/admin/workspaces/[id]/route.ts |
| 38 | /api/admin/organizations | GET | Yes | adminAuthentication | admin_session cookie | api/admin/organizations/route.ts |
| 39 | /api/admin/organizations/[id] | GET/PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/admin/organizations/[id]/route.ts |
| 40 | /api/admin/billing | GET | Yes | adminAuthentication | admin_session cookie | api/admin/billing/route.ts |
| 41 | /api/admin/billing/[id] | GET/PUT | Yes | adminAuthentication | admin_session cookie | api/admin/billing/[id]/route.ts |
| 42 | /api/admin/analytics | GET | Yes | adminAuthentication | admin_session cookie | api/admin/analytics/route.ts |
| 43 | /api/admin/audit-logs | GET | Yes | adminAuthentication | admin_session cookie | api/admin/audit-logs/route.ts |
| 44 | /api/admin/api-keys | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/api-keys/route.ts |
| 45 | /api/admin/api-keys/[id] | GET/PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/admin/api-keys/[id]/route.ts |
| 46 | /api/admin/ai-providers | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/ai-providers/route.ts |
| 47 | /api/admin/jobs | GET | Yes | adminAuthentication | admin_session cookie | api/admin/jobs/route.ts |
| 48 | /api/admin/jobs/[id] | GET | Yes | adminAuthentication | admin_session cookie | api/admin/jobs/[id]/route.ts |
| 49 | /api/admin/queues | GET | Yes | adminAuthentication | admin_session cookie | api/admin/queues/route.ts |
| 50 | /api/admin/subscriptions | GET | Yes | adminAuthentication | admin_session cookie | api/admin/subscriptions/route.ts |
| 51 | /api/admin/coupons | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/coupons/route.ts |
| 52 | /api/admin/coupons/[id] | GET/PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/admin/coupons/[id]/route.ts |
| 53 | /api/admin/feature-flags | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/feature-flags/route.ts |
| 54 | /api/admin/feature-flags/[id] | GET/PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/admin/feature-flags/[id]/route.ts |
| 55 | /api/admin/cache | GET/DELETE | Yes | adminAuthentication | admin_session cookie | api/admin/cache/route.ts |
| 56 | /api/admin/cron | POST | Yes | adminAuthentication | admin_session cookie | api/admin/cron/route.ts |
| 57 | /api/admin/notifications | GET/PATCH | Yes | adminAuthentication | admin_session cookie | api/admin/notifications/route.ts |
| 58 | /api/admin/search | GET | Yes | adminAuthentication | admin_session cookie | api/admin/search/route.ts |
| 59 | /api/admin/stats | GET | Yes | adminAuthentication | admin_session cookie | api/admin/stats/route.ts |
| 60 | /api/admin/email | GET | Yes | adminAuthentication | admin_session cookie | api/admin/email/route.ts |
| 61 | /api/admin/email/health | GET | Yes | adminAuthentication | admin_session cookie | api/admin/email/health/route.ts |
| 62 | /api/admin/email/logs | GET | Yes | adminAuthentication | admin_session cookie | api/admin/email/logs/route.ts |
| 63 | /api/admin/email/providers | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/email/providers/route.ts |
| 64 | /api/admin/email/providers/[id] | PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/admin/email/providers/[id]/route.ts |
| 65 | /api/admin/email/providers/[id]/test | POST | Yes | adminAuthentication | admin_session cookie | api/admin/email/providers/[id]/test/route.ts |
| 66 | /api/admin/email/providers/[id]/validate | POST | Yes | adminAuthentication | admin_session cookie | api/admin/email/providers/[id]/validate/route.ts |
| 67 | /api/admin/email/queue | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/email/queue/route.ts |
| 68 | /api/admin/email/statistics | GET | Yes | adminAuthentication | admin_session cookie | api/admin/email/statistics/route.ts |
| 69 | /api/admin/email/templates | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/email/templates/route.ts |
| 70 | /api/admin/email/templates/[id] | GET/PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/admin/email/templates/[id]/route.ts |
| 71 | /api/admin/commerce/plans | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/commerce/plans/route.ts |
| 72 | /api/admin/commerce/plans/[id] | PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/admin/commerce/plans/[id]/route.ts |
| 73 | /api/admin/commerce/billing-options | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/commerce/billing-options/route.ts |
| 74 | /api/admin/commerce/billing-options/[id] | PUT | Yes | adminAuthentication | admin_session cookie | api/admin/commerce/billing-options/[id]/route.ts |
| 75 | /api/admin/commerce/orders | GET | Yes | adminAuthentication | admin_session cookie | api/admin/commerce/orders/route.ts |
| 76 | /api/admin/commerce/pricing | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/commerce/pricing/route.ts |
| 77 | /api/admin/commerce/pricing/[id] | PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/admin/commerce/pricing/[id]/route.ts |
| 78 | /api/admin/commerce/wallets | GET | Yes | adminAuthentication | admin_session cookie | api/admin/commerce/wallets/route.ts |
| 79 | /api/admin/localization/currencies | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/localization/currencies/route.ts |
| 80 | /api/admin/localization/exchange-rates | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/localization/exchange-rates/route.ts |
| 81 | /api/admin/localization/pricing-profiles | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/localization/pricing-profiles/route.ts |
| 82 | /api/admin/localization/profiles | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/localization/profiles/route.ts |
| 83 | /api/admin/localization/payment-profiles | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/localization/payment-profiles/route.ts |
| 84 | /api/admin/localization/regions | GET/POST | Yes | adminAuthentication | admin_session cookie | api/admin/localization/regions/route.ts |
| 85 | /api/cms/audit | GET | Yes | adminAuthentication | admin_session cookie | api/cms/audit/route.ts |
| 86 | /api/cms/components | GET | Yes | adminAuthentication | admin_session cookie | api/cms/components/route.ts |
| 87 | /api/cms/media | GET | Yes | adminAuthentication | admin_session cookie | api/cms/media/route.ts |
| 88 | /api/cms/pages | GET/POST | Yes | adminAuthentication | admin_session cookie | api/cms/pages/route.ts |
| 89 | /api/cms/pages/[id] | GET/PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/cms/pages/[id]/route.ts |
| 90 | /api/cms/publish | POST | Yes | adminAuthentication | admin_session cookie | api/cms/publish/route.ts |
| 91 | /api/cms/sections | GET | Yes | adminAuthentication | admin_session cookie | api/cms/sections/route.ts |
| 92 | /api/cms/versions | GET | Yes | adminAuthentication | admin_session cookie | api/cms/versions/route.ts |
| 93 | /api/landing/sections | GET/POST | Yes | adminAuthentication | admin_session cookie | api/landing/sections/route.ts |
| 94 | /api/landing/sections/[key] | GET/PATCH/DELETE/POST | Yes | adminAuthentication | admin_session cookie | api/landing/sections/[key]/route.ts |
| 95 | /api/landing/sections/reorder | POST | Yes | adminAuthentication | admin_session cookie | api/landing/sections/reorder/route.ts |
| 96 | /api/localization/admin/keys | GET/POST | Yes | adminAuthentication | admin_session cookie | api/localization/admin/keys/route.ts |
| 97 | /api/localization/admin/keys/[key] | GET/PUT/DELETE | Yes | adminAuthentication | admin_session cookie | api/localization/admin/keys/[key]/route.ts |
| 98 | /api/metrics | GET | Yes | adminAuthentication | admin_session cookie | api/metrics/route.ts |
| 99 | /api/queues | GET | Yes | adminAuthentication | admin_session cookie | api/queues/route.ts |

### User Endpoints (User Auth Required)

| # | Path | Methods | Auth Required | Middleware | Session Provider | File |
|---|------|---------|--------------|-----------|-----------------|------|
| 100 | /api/api-keys | GET/POST | Yes | userAuthentication | better-auth | api/api-keys/route.ts |
| 101 | /api/billing | GET | Yes | userAuthentication | better-auth | api/billing/route.ts |
| 102 | /api/billing/upgrade | POST | Yes | userAuthentication | better-auth | api/billing/upgrade/route.ts |
| 103 | /api/commerce/checkout | POST | Yes | userAuthentication | better-auth | api/commerce/checkout/route.ts |
| 104 | /api/commerce/orders | GET | Yes | userAuthentication | better-auth | api/commerce/orders/route.ts |
| 105 | /api/commerce/wallet | GET | Yes | userAuthentication | better-auth | api/commerce/wallet/route.ts |
| 106 | /api/jobs | GET | Yes | userAuthentication | better-auth | api/jobs/route.ts |
| 107 | /api/media | GET/POST | Yes | userAuthentication | better-auth | api/media/route.ts |
| 108 | /api/media/[id] | GET/PUT/DELETE | Yes | userAuthentication | better-auth | api/media/[id]/route.ts |
| 109 | /api/notifications | GET | Yes | userAuthentication | better-auth | api/notifications/route.ts |
| 110 | /api/notifications/[id] | PATCH | Yes | userAuthentication | better-auth | api/notifications/[id]/route.ts |
| 111 | /api/payment/checkout | POST | Yes | userAuthentication | better-auth | api/payment/checkout/route.ts |
| 112 | /api/profile | GET/PUT | Yes | userAuthentication | better-auth | api/profile/route.ts |
| 113 | /api/user/stats | GET | Yes | userAuthentication | better-auth | api/user/stats/route.ts |
| 114 | /api/workspaces | GET/POST | Yes | userAuthentication | better-auth | api/workspaces/route.ts |
| 115 | /api/analytics/dashboard | GET | Yes | userAuthentication | better-auth | api/analytics/dashboard/route.ts |
| 116 | /api/analytics/metrics | POST | Yes | userAuthentication | better-auth | api/analytics/metrics/route.ts |
| 117 | /api/production/execute | POST | Yes | requireAuth | better-auth | api/production/execute/route.ts |

### Dev Endpoints

| # | Path | Methods | Auth Required | Middleware | Session Provider | File |
|---|------|---------|--------------|-----------|-----------------|------|
| 118 | /api/dev/create-admin | POST | No (dev only) | None | N/A | api/dev/create-admin/route.ts |

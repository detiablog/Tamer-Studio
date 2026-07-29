# API Inventory — Tamer Studio

**Total Route Files:** 118
**Generated:** 2026-07-29

---

## Admin APIs (54 route files)

All use `adminAuthentication` middleware.

| Route | Methods |
|-------|---------|
| `admin/auth/login` | POST |
| `admin/auth/logout` | POST |
| `admin/auth/me` | GET |
| `admin/cache/*` | GET, POST |
| `admin/categories/*` | GET, POST, PUT, DELETE |
| `admin/coupons/*` | GET, POST, PUT, DELETE |
| `admin/dashboard/*` | GET |
| `admin/email/*` | POST |
| `admin/feature-flags/*` | GET, POST, PUT, DELETE |
| `admin/media/*` | GET, POST, DELETE |
| `admin/orders/*` | GET, PUT |
| `admin/pages/*` | GET, POST, PUT, DELETE |
| `admin/products/*` | GET, POST, PUT, DELETE |
| `admin/reviews/*` | GET, PUT, DELETE |
| `admin/roles/*` | GET, POST, PUT, DELETE |
| `admin/settings/*` | GET, PUT |
| `admin/stats/*` | GET |
| `admin/tags/*` | GET, POST, PUT, DELETE |
| `admin/users/*` | GET, PUT, DELETE |

## CMS APIs (7 route files)

All use `adminAuthentication` middleware.

| Route | Methods |
|-------|---------|
| `cms/brands/*` | GET, POST, PUT, DELETE |
| `cms/categories/*` | GET, POST, PUT, DELETE |
| `cms/pages/*` | GET, POST, PUT, DELETE |
| `cms/posts/*` | GET, POST, PUT, DELETE |
| `cms/products/*` | GET, POST, PUT, DELETE |
| `cms/reviews/*` | GET, POST, PUT, DELETE |
| `cms/tags/*` | GET, POST, PUT, DELETE |

## User Auth APIs (7 route files)

Public/no authentication required.

| Route | Methods |
|-------|---------|
| `auth/forgot-password` | POST |
| `auth/login` | POST |
| `auth/register` | POST |
| `auth/reset-password` | POST |
| `auth/verify-email` | POST |
| `auth/refresh` | POST |
| `auth/callback` | GET |

## User-Protected APIs (16 route files)

All use `userAuthentication` middleware.

| Route | Methods |
|-------|---------|
| `user/address/*` | GET, POST, PUT, DELETE |
| `user/checkout/*` | POST |
| `user/favorites/*` | GET, POST, DELETE |
| `user/orders/*` | GET |
| `user/profile/*` | GET, PUT |
| `user/reviews/*` | GET, POST, PUT, DELETE |
| `user/stats` | GET |
| `user/wishlist/*` | GET, POST, DELETE |

## Localization Admin (5 route files)

3 use `adminAuthentication`, 2 are public.

| Route | Methods | Auth |
|-------|---------|------|
| `localization/admin/translations/*` | GET, POST, PUT, DELETE | adminAuth |
| `localization/admin/languages/*` | GET, POST, PUT, DELETE | adminAuth |
| `localization/admin/bundles/*` | GET, POST | adminAuth |
| `localization/search` | GET | none |
| `localization/validate` | POST | none |

## Public APIs (28 route files)

No authentication required.

| Route | Methods |
|-------|---------|
| `ai/*` | POST |
| `landing/*` | GET |
| `seo/*` | GET |
| `health` | GET |
| `metrics` | GET |
| `queues/*` | GET, POST |
| `socket/*` | GET |
| `webhooks/*` | POST |
| `public/*` | GET |

---

**Summary:** 118 route files | HTTP Methods: GET 89, POST 49, PUT 12, PATCH 7, DELETE 14

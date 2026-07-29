# API Classification — Tamer Studio

**Total Routes:** 118 | **Protected:** 83 (70.3%) | **Public:** 35 (29.7%)

---

## Classification by Domain

| Domain | Route Files | Auth | Protection |
|--------|-------------|------|------------|
| **Admin** | 54 | adminAuthentication | Protected |
| **CMS** | 7 | adminAuthentication | Protected |
| **User Auth** | 7 | none/public | Public |
| **User-Protected** | 16 | userAuthentication | Protected |
| **Localization** | 5 | 3 adminAuth, 2 public | Mixed |
| **Landing** | 3 | none | Public |
| **SEO** | 4 | none | Public |
| **Commerce** | 6 | mixed | Mixed |
| **AI** | 1 | none | Public |
| **Public** | 15 | none | Public |
| **Health** | 1 | none | Public |

---

## Protection Summary

```
Protected:  83 routes (70.3%) ████████████████████░░░░░░░░░░
Public:     35 routes (29.7%) ██████████░░░░░░░░░░░░░░░░░░░░
```

## Middleware Mapping

| Middleware | Used By | Count |
|------------|---------|-------|
| `adminAuthentication` | Admin + CMS | 61 |
| `userAuthentication` | User-Protected | 16 |
| `none` | Public/Auth/Landing/SEO/AI/Health | 35 |
| `requireAdminPermission` | Admin (RBAC) | 25 |

## Domain Details

- **Admin (54):** Full CRUD for products, orders, coupons, users, roles, settings, media, feature flags, email, cache, dashboard, reviews, pages, tags, categories, stats
- **CMS (7):** Content management for brands, categories, pages, posts, products, reviews, tags
- **User Auth (7):** Registration, login, logout, password reset, email verification, token refresh, OAuth callback
- **User-Protected (16):** Profile, address, orders, favorites, reviews, checkout, wishlist, stats
- **Localization (5):** Translation management, language management, bundles, search, validate
- **Landing (3):** Landing page sections and content
- **SEO (4):** Sitemap, robots, meta tags, structured data
- **Commerce (6):** Cart, checkout, payment processing
- **AI (1):** AI-powered features
- **Public (15):** Public product/category/brand browsing, search
- **Health (1):** Health check endpoint

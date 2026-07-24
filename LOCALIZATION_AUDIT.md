# LOCALIZATION AUDIT REPORT
## Tamer Studio — Enterprise Smart Localization & Currency System

Generated: 2026-07-24

---

## 1. CURRENT LOCALIZATION STATE

| Aspect | Status | Notes |
|--------|--------|-------|
| Translation Files | **MISSING** | No `/locales`, `/i18n`, `/lang` directories exist |
| i18n Library | **MISSING** | No react-i18next, next-intl, or custom i18n system |
| Hardcoded Strings | **CRITICAL** | 100% of UI text is hardcoded in English across 40+ files |
| Currency Formatting | **MISSING** | Dollar signs manually placed; no `Intl.NumberFormat` usage |
| Locale Detection | **MISSING** | No geo detection, cookie-based locale, or Accept-Language parsing |
| User Preferences | **MISSING** | No DB fields, no API, no UI for language/currency/country preferences |
| Middleware | **MISSING** | No Next.js middleware.ts for geo detection or locale routing |
| SEO (hreflang) | **MISSING** | No hreflang tags or localized metadata |
| Admin Localization | **MISSING** | Admin panel has no localization support |
| Admin Settings | **MISSING** | No default language/currency configuration in admin |

---

## 2. CURRENT CURRENCY HANDLING

| Aspect | Status | Details |
|--------|--------|---------|
| Currency Fields in DB | **EXISTS** | `USD` default on 15+ tables (order, checkout, invoice, wallet, etc.) |
| formatCurrency Utility | **MISSING** | No centralized currency formatter |
| Hardcoded `$` Symbols | **CRITICAL** | Found in 12+ files: pricing, billing, admin, AI dashboard |
| Currency Conversion | **MISSING** | No exchange rate service or multi-currency display logic |
| Currency Context | **MISSING** | No React context or global state for currency |

**Hardcoded Currency Locations:**
- `src/app/(marketing)/pricing/page.tsx:12` — `$0`
- `src/app/(dashboard)/billing/page.tsx:51-54` — `$49.00`, `$0`, `$120.50`
- `src/app/api/billing/route.ts:37-47` — `$49.00`, `$29.00`
- `src/app/admin/page.tsx:83` — `$12,500`
- `src/app/admin/(protected)/page.tsx:16-19` — `$12,500`, `$850`, `$5,200`
- `src/app/admin/(protected)/subscriptions/page.tsx:15-17` — `$99.00`, `$299.00`, `$29.00`
- `src/app/admin/(protected)/coupons/page.tsx:17` — `$50`
- `src/app/admin/(protected)/billing/page.tsx:15-23` — `$99.00`, `$299.00`, `$29.00`
- `src/app/admin/(protected)/analytics/page.tsx:15-19` — `$8,420`, `$7,150`, `$9,210`, `$6,340`, `$7,890`
- `src/app/(dashboard)/ai/page.tsx:29` — `$120.50 value`
- `src/features/ai/AIPlatformDashboard.tsx:289` — `$0.00`

---

## 3. HARDCODED TEXTS — FULL INVENTORY

### Marketing Pages
- `src/app/(marketing)/layout.tsx` — Navigation: Pricing, About, Contact, Sign in, Get started, Privacy, Terms, Docs
- `src/app/(marketing)/page.tsx` — Home page hero, CTAs, feature descriptions, footer
- `src/app/(marketing)/pricing/page.tsx` — Plan names, prices, "Coming soon"
- `src/app/(marketing)/about/page.tsx` — About content
- `src/app/(marketing)/contact/page.tsx` — Contact form labels, support hours
- `src/app/(marketing)/docs/page.tsx` — Documentation headings and content

### Auth Pages
- `src/features/auth/components/login-form.tsx` — Sign in, Email, Password, Remember me, Forgot password?, Signing in...
- `src/features/auth/components/register-form.tsx` — Create your account, Full Name, Email, Password, Create Account, Creating account...
- `src/features/auth/components/reset-password-form.tsx` — Reset password, Resetting...

### Dashboard Pages
- `src/app/(dashboard)/layout.tsx` — Dashboard breadcrumb
- `src/app/(dashboard)/settings/page.tsx` — Settings, General, Appearance, Notifications, Security, Integrations, Data & Storage, Save Changes, all form labels
- `src/app/(dashboard)/billing/page.tsx` — Billing, Next Invoice, Payment Method, Credits Remaining, Billing History, Payment Method, Usage This Month, Upgrade Plan, Loading..., Failed to load billing data
- `src/app/(dashboard)/profile/page.tsx` — Profile, Save Changes, Saving..., all preference labels
- `src/app/(dashboard)/workspace/page.tsx` — Workspace, Create Workspace
- `src/app/(dashboard)/media/page.tsx` — Media Library, Upload Media
- `src/app/(dashboard)/production/page.tsx` — Production, New Job
- `src/app/(dashboard)/publishing/page.tsx` — Publishing, New Publication
- `src/app/(dashboard)/notifications/page.tsx` — Notifications
- `src/app/(dashboard)/projects/page.tsx` — Projects, All, Draft, Planning, etc.
- `src/app/(dashboard)/templates/page.tsx` — Templates
- `src/app/(dashboard)/ai/page.tsx` — AI Platform, Credits Remaining

### Admin Panel
- `src/app/admin/page.tsx` — Admin Dashboard, metrics
- `src/app/admin/(protected)/settings/page.tsx` — All admin settings tabs, labels, buttons
- `src/app/admin/(protected)/users/page.tsx` — Users, Create, Update, Yes/No
- `src/app/admin/(protected)/organizations/page.tsx` — Organizations, Create, Update
- `src/app/admin/(protected)/workspaces/page.tsx` — Workspaces, Create, Update
- `src/app/admin/(protected)/billing/page.tsx` — Billing, table headers
- `src/app/admin/(protected)/subscriptions/page.tsx` — Subscriptions, table headers
- `src/app/admin/(protected)/coupons/page.tsx` — Coupons, Create
- `src/app/admin/(protected)/feature-flags/page.tsx` — Feature Flags
- `src/app/admin/(protected)/audit-logs/page.tsx` — Audit Logs
- `src/app/admin/(protected)/api-keys/page.tsx` — API Keys
- `src/app/admin/(protected)/analytics/page.tsx` — Analytics
- `src/app/admin/(protected)/profile/page.tsx` — Profile
- `src/components/admin/AdminSidebar.tsx` — Dashboard, Billing, Settings
- `src/components/admin/AdminTopbar.tsx` — Notifications

### Shared Components
- `src/components/ui/Sidebar.tsx` — Dashboard, Workspace, Projects, Media, Production, AI Platform, Publishing, Settings, Main, Manage
- `src/components/ui/AppShell.tsx` — Notifications (aria-label)

---

## 4. MISSING FEATURES

| Feature | Priority | Status |
|---------|----------|--------|
| Translation Loader (en.json, id.json) | P0 | MISSING |
| Localization Provider (React Context) | P0 | MISSING |
| Currency Formatter (formatCurrency) | P0 | MISSING |
| Geo Detection Service | P0 | MISSING |
| Country Resolver | P0 | MISSING |
| User Preference Service | P0 | MISSING |
| Cookie-based Locale Storage | P0 | MISSING |
| Next.js Middleware (geo detection) | P0 | MISSING |
| Database Migration (user preferences) | P0 | MISSING |
| Settings Page (Language, Currency, Country, Timezone) | P0 | MISSING |
| Admin Settings (Default Language, Default Currency, Supported Languages/Currencies) | P1 | MISSING |
| API Routes (preferences CRUD, detection) | P1 | MISSING |
| hreflang SEO Tags | P1 | MISSING |
| Number/Date/Time Formatters | P1 | MISSING |
| Timezone Helper | P2 | MISSING |
| Accept-Language Parser | P2 | MISSING |
| Phone Number Formatter (future-ready) | P3 | MISSING |
| Percentage Formatter | P3 | MISSING |
| Exchange Rate Service | P3 | MISSING (optional) |

---

## 5. MISSING DATABASE FIELDS

The `user` table in `src/lib/db/schema/auth.ts` needs:
- `preferredLanguage` (varchar, default "en")
- `preferredCurrency` (varchar, default "USD")
- `preferredCountry` (varchar, nullable)
- `preferredTimezone` (varchar, nullable)
- `autoDetectLocale` (boolean, default true)

---

## 6. MISSING SERVICES

| Service | Location | Purpose |
|---------|----------|---------|
| LocalizationService | `src/lib/localization/` | Core locale management, translation loading |
| CurrencyService | `src/lib/currency/` | Currency metadata, formatting, conversion |
| GeoDetectionService | `src/lib/geolocation/` | IP-to-country resolution from headers |
| CountryResolver | `src/lib/geolocation/` | Maps country code → locale, currency, timezone |
| UserPreferenceService | `src/lib/preferences/` | CRUD for user locale preferences, cookie sync |

---

## 7. MISSING MIDDLEWARE

| Middleware | Purpose |
|------------|---------|
| `src/middleware.ts` | Next.js edge middleware for geo detection, cookie setting, locale routing |

---

## 8. MIGRATION PLAN

1. **Phase 1: Core Infrastructure** — Create all services, types, constants, providers, hooks
2. **Phase 2: Translation Files** — Extract all strings, create `en.json` and `id.json`
3. **Phase 3: Database** — Add user preference fields via drizzle migration
4. **Phase 4: Middleware & API** — Geo detection middleware, preference API routes
5. **Phase 5: UI Integration** — Update all pages/components to use `t()` and `formatCurrency()`
6. **Phase 6: Settings Pages** — User settings + admin settings for localization
7. **Phase 7: SEO** — Add hreflang, localized metadata

---

## 9. RISK ANALYSIS

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking existing auth tables | HIGH | Additive migration only; never remove/rename columns |
| Breaking client-side navigation | MEDIUM | Language switching uses cookie + context, not full reload |
| Performance degradation from geo API | MEDIUM | Use headers first; only call external API as last resort; cache results |
| SEO impact from dynamic lang | LOW | Use `hreflang` and static `html lang` based on detected locale |
| Cookie bloat | LOW | 4 small cookies, 365-day expiry |
| Type safety gaps | MEDIUM | Full TypeScript types for all translation keys, locales, currencies |
| Missing translations on new pages | LOW | Fallback to English for any missing keys |

---

## 10. IMPLEMENTATION NOTES

- **No external i18n library** — Build lightweight custom solution to match project patterns
- **Server + Client compatible** — Translation loader works in both contexts
- **Priority-based detection** — User pref > Cookie > Cloudflare > Vercel > Accept-Language > GeoIP > Fallback
- **Never overwrite manual preferences** — Once user sets language/currency/country/timezone, freeze detection
- **Cookie-based persistence** — 365-day expiry for locale, currency, country, timezone
- **Admin defaults** — Admin panel controls system-wide defaults and supported locales/currencies

# Server Component Audit

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-01

---

## Dynamic Server Usage Summary

| Category | Count |
|----------|-------|
| Pages with explicit `cookies()` | 15 |
| Pages with `getServerSession()` (via layout) | ~45 |
| Pages with `getAdminSession()` (via layout) | ~30 |
| Pages with `export const dynamic = "force-dynamic"` | 7 + 2 layouts |
| Pages with `searchParams` prop | 1 |
| Pages with `params: Promise<...>` | 6 |
| API routes with `force-dynamic` | 18 |
| `headers()` usage in pages | 0 |
| `draftMode()` usage | 0 |
| `generateStaticParams` | **0** |

---

## Accidental Dynamic Rendering

### 1. Admin Pages: Cookie-Passing Anti-Pattern (12 pages)

All `admin/(protected)/` pages read `admin_session` cookie server-side to pass as a prop to client components.

| File | Dynamic API | Could Be Static? |
|------|------------|-----------------|
| `admin/(protected)/settings/page.tsx` | `cookies()` | Yes |
| `admin/(protected)/ai-runtime/page.tsx` | `cookies()` | Yes |
| `admin/(protected)/landing-builder/page.tsx` | `cookies()` | Yes |
| `admin/(protected)/email/page.tsx` | `cookies()` | Yes |
| `admin/(protected)/email/templates/page.tsx` | `cookies()` | Yes |
| `admin/(protected)/email/statistics/page.tsx` | `cookies()` | Yes |
| `admin/(protected)/email/queue/page.tsx` | `cookies()` | Yes |
| `admin/(protected)/email/health/page.tsx` | `cookies()` | Yes |
| `admin/(protected)/email/dashboard/page.tsx` | `cookies()` | Yes |
| `admin/(protected)/email/providers/page.tsx` | `cookies()` | Yes |

**Fix**: Read token in middleware → inject into header, or use client-side auth hook.

### 2. Dashboard Pages: Locale Cookie (3 pages)

| File | Dynamic API | Could Be Static? |
|------|------------|-----------------|
| `(dashboard)/workspace/[id]/page.tsx` | `cookies()` (locale only) | Yes |
| `(dashboard)/ai/providers/[id]/page.tsx` | `cookies()` (locale only) | Yes |
| `(dashboard)/ai/page.tsx` | `cookies()` (locale only) | Yes |

**Fix**: Use `useLocalizationContext()` (already available client-side).

### 3. Pure Client Components with force-dynamic (5 pages)

| File | Dynamic API | Could Be Static? |
|------|------------|-----------------|
| `(dashboard)/ai/video/generate/page.tsx` | `force-dynamic` | Yes |
| `(dashboard)/ai/image/page.tsx` | `force-dynamic` | Yes |
| `(dashboard)/ai/image/generate/page.tsx` | `force-dynamic` | Yes |
| `(dashboard)/agents/page.tsx` | `force-dynamic` | Yes |
| `(dashboard)/affiliate-studio/campaign/page.tsx` | `force-dynamic` | Yes |

**Fix**: Remove `export const dynamic = "force-dynamic"`.

---

## Intentional Dynamic Rendering

| Page | Dynamic API | Reason |
|------|------------|--------|
| `(dashboard)/layout.tsx` | `getServerSession()` + `force-dynamic` | Auth guard |
| `admin/(protected)/layout.tsx` | `getAdminSession()` + `force-dynamic` | Admin auth guard |
| `admin/(public)/login/page.tsx` | `cookies()` | CSRF token |
| `admin/(public)/logout/page.tsx` | `cookies()` in server action | Session cleanup |
| `(auth)/reset-password/page.tsx` | `useSearchParams()` | Client-side URL token |

---

## Static Routes (24 total)

| Route | Type |
|-------|------|
| `/` | Marketing homepage |
| `/_not-found` | Error page |
| `/2fa` | Auth page |
| `/about`, `/contact`, `/faq`, `/features` | Marketing |
| `/blog`, `/careers`, `/roadmap`, `/support` | Marketing |
| `/docs` | Documentation |
| `/pricing` | Marketing |
| `/legal/privacy`, `/legal/terms` | Legal |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` | Auth |
| `/credits`, `/offline` | Utility |
| `/api/seo/sitemap`, `/robots.txt`, `/sitemap.xml` | SEO |

---

## Dynamic Routes (844 total)

| Category | Count | Reason |
|----------|-------|--------|
| `/admin/*` | 65 | Layout forces dynamic |
| `/api/admin/*` | 200+ | API routes (always dynamic) |
| `/dashboard/*` (via `(dashboard)/`) | 45+ | Layout forces dynamic |
| `/api/*` (other) | 500+ | API routes |

---

## Missing generateStaticParams

**Zero implementations found.** All dynamic routes (`[id]`, `[slug]`) are implicitly dynamic at build time.

Candidates for `generateStaticParams`:
- Blog posts (if content is static)
- Marketing pages with known slugs
- Feature pages

# Homepage Audit Report

**Sprint:** CMS-01 B9  
**Date:** 2026-07-28  
**Status:** COMPLETE

---

## Audit Summary

Comprehensive audit of the existing homepage implementation before Homepage Runtime integration.

---

## Current Homepage Files

| File | Type | Purpose |
|---|---|---|
| `src/app/page.tsx` | Server Component | Root route, SEO metadata, Suspense boundary |
| `src/components/landing/LandingPageContent.tsx` | Client Component | Main orchestrator, fetches sections + data |
| `src/lib/landing-section-renderer.ts` | Utility | Section key → component mapping |
| `src/hooks/use-landing-sections.ts` | Hook | Fetches from `/api/landing/sections` |
| `src/hooks/use-landing-data.ts` | Hook | Fetches currency, pricing, campaign, SEO data |
| `src/components/landing/Header.tsx` | Client Component | Navigation header |
| `src/components/landing/Footer.tsx` | Client Component | Footer with links |
| `src/components/landing/Hero.tsx` | Client Component | Hero section |
| `src/components/landing/Features.tsx` | Client Component | Features section |
| `src/components/landing/PricingSection.tsx` | Client Component | Pricing section |
| `src/components/landing/FAQ.tsx` | Client Component | FAQ section |
| `src/components/landing/CTASection.tsx` | Client Component | Call to action section |
| `src/components/landing/Testimonials.tsx` | Client Component | Testimonials section |
| `src/components/landing/SocialProof.tsx` | Client Component | Social proof section |
| `src/components/landing/AIPlatform.tsx` | Client Component | AI platform section |
| `src/components/landing/Screenshots.tsx` | Client Component | Screenshots section |
| `src/components/landing/RealtimeStats.tsx` | Client Component | Real-time stats section |
| `src/components/landing/CreditPacks.tsx` | Client Component | Credit packs section |
| `src/components/landing/CreditCalculator.tsx` | Client Component | Credit calculator section |
| `src/components/landing/CreditUsageTable.tsx` | Client Component | Credit usage table section |
| `src/components/landing/LandingKeyboardShortcuts.tsx` | Client Component | Keyboard shortcuts |

---

## Section Component Registry

| Section Key | Component | Status |
|---|---|---|
| `hero` | Hero | Active |
| `features` | Features | Active |
| `ai-platform` | AIPlatform | Active |
| `screenshots` | Screenshots | Active |
| `realtime-stats` | RealtimeStats | Active |
| `pricing` | PricingSection | Active |
| `credit-packs` | CreditPacks | Active |
| `credit-calculator` | CreditCalculator | Active |
| `credit-usage` | CreditUsageTable | Active |
| `testimonials` | Testimonials | Active |
| `faq` | FAQ | Active |
| `cta` | CTASection | Active |
| `footer` | Footer | Active |
| `social-proof` | SocialProof | Active |

**Total:** 14 registered section types

---

## API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/landing/sections` | GET | List all landing sections |
| `/api/landing/sections` | POST | Create new section (admin) |
| `/api/landing/sections/[key]` | GET | Get section by key |
| `/api/landing/sections/[key]` | PUT | Update section |
| `/api/landing/sections/[key]` | DELETE | Delete section |
| `/api/landing/sections/reorder` | POST | Reorder sections |
| `/api/landing/seo` | GET | Get SEO metadata |
| `/api/landing/pricing` | GET | Get pricing data |
| `/api/landing/currency` | GET | Get currency data |
| `/api/landing/campaign` | GET | Get campaign data |
| `/api/landing/subscription` | GET | Get subscription plans |

---

## Data Sources

| Source | Table | Purpose |
|---|---|---|
| CMS Database | `landing_section` | Section definitions, config, ordering |
| CMS Database | `landing_media` | Section media (images, videos) |
| CMS Service | Pages/Sections | CMS-managed content |
| Localization | `en.json`, `id.json` | Translation strings |
| Navigation Runtime | In-memory | Header/footer navigation items |

---

## Current Architecture Issues

1. **No Runtime Pattern**: Homepage uses direct API fetching, not a runtime pattern like Navigation/Localization
2. **No Composition Engine**: Sections are rendered in DB order only, no dynamic composition
3. **No Fallback System**: No fallback sections when CMS data is unavailable
4. **No Permission Filtering**: No role-based section visibility
5. **No Conditional Rules**: No locale/device/feature-flag-based section visibility
6. **Limited Preview**: No draft preview, no locale preview, no responsive preview
7. **No Caching Layer**: No in-memory caching for resolved homepage data

---

## Recommendation

Implement `HomepageRuntime` as the single rendering engine that:
- Consumes CMS content (not own content)
- Delegates to Navigation Runtime, Localization Platform, Media Library, SEO Runtime
- Provides section registry, composition, fallback, and caching
- Supports preview modes (draft, published, responsive, locale)

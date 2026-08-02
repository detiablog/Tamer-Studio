# SEO Runtime Architecture

**Date:** 2026-07-29  
**Sprint:** SEO-01  

---

## Architecture Overview

### SEO Runtime Pipeline
```
Page Component
  → generatePageMetadata() 
  → SEORuntime.resolvePage()
  → SEO Cache (SharedCache, TTL-based)
  → Metadata Runtime (title, description, keywords)
  → Canonical Runtime (canonical URL, locale alternates)
  → OpenGraph Runtime (OG metadata)
  → Twitter Runtime (Twitter Card metadata)
  → Schema Runtime (JSON-LD structured data)
  → Robots Runtime (robots directives)
  → Hreflang Runtime (language alternates)
  → AI Search Runtime (LLM-optimized metadata)
  → Next.js Metadata API → Search Engines
```

### Core SEO Module (`src/core/seo/`) — 15 files

| File | Purpose |
|------|---------|
| `seo-runtime.ts` | Main orchestrator — resolves all SEO signals for a page |
| `seo-cache.ts` | TTL-based cache with tag invalidation |
| `seo-validation-runtime.ts` | Validates metadata completeness (scoring system) |
| `page-metadata.ts` | `generatePageMetadata()` — convenience function for all pages |
| `metadata-runtime.ts` | Title, description, keywords, author, locale resolution |
| `canonical-runtime.ts` | Canonical URLs + locale alternates |
| `opengraph-runtime.ts` | OpenGraph metadata |
| `twitter-runtime.ts` | Twitter Card metadata |
| `schema-runtime.ts` | JSON-LD (10 types: Organization, Website, BreadcrumbList, FAQPage, Article, SoftwareApplication, Product, VideoObject, ImageObject, WebPage) |
| `robots-runtime.ts` | Robots.txt generation + meta directives |
| `sitemap-runtime.ts` | Sitemap XML generation with 12 default routes |
| `hreflang-runtime.ts` | hreflang alternate links (en, id) |
| `ai-search-runtime.ts` | AI-search metadata for LLM crawlers |
| `seo.types.ts` | 294 lines of TypeScript types |

### Dynamic SEO Files (Next.js)
| File | Purpose |
|------|---------|
| `src/app/sitemap.ts` | Dynamic sitemap via `seoRuntime.resolveSitemap()` |
| `src/app/robots.ts` | Dynamic robots.txt via `seoRuntime.getRobotsRuntime()` |

### API Routes
| Route | Purpose |
|-------|---------|
| `GET /api/seo/sitemap` | Sitemap entries as JSON |
| `GET /api/seo/robots` | robots.txt as text/plain |
| `GET /api/seo/runtime?route=&locale=` | Full SEO data for any page |
| `GET /api/seo/validate?route=&locale=` | SEO validation score + issues |

### Integration Points
| Integration | Status |
|-------------|--------|
| Landing Builder → SEO | Auto-publish updates SEO metadata |
| Localization → SEO | `locale` parameter in `generatePageMetadata()` |
| Admin Panel → SEO | CMS audit, section management |
| Navigation → SEO | NavigationSEOIntegration maps nav items to metadata |
| AI Search → SEO | LLM-specific metadata for ChatGPT, Gemini, Claude, Perplexity, Copilot |

---

## Fixes Applied

| # | Fix | Severity |
|---|-----|----------|
| 1 | Deleted stale `public/sitemap.xml` (contained localhost URLs + private routes) | CRITICAL |
| 2 | Deleted stale `public/robots.txt` (contained localhost URL) | CRITICAL |
| 3 | Added `locale` parameter to `generatePageMetadata()` | HIGH |

---

## Schema.org Support

| Schema Type | Used By |
|-------------|---------|
| Organization | Root layout (all pages) |
| Website | Via SEO Runtime |
| WebPage | Via SEO Runtime |
| BreadcrumbList | Blog [slug] page |
| FAQPage | Supported, not yet used by /faq |
| Article | Blog posts |
| SoftwareApplication | Supported |
| Product | Supported |
| VideoObject | Supported |
| ImageObject | Supported |

---

## AI Search Optimization

| LLM Engine | Support |
|-----------|---------|
| ChatGPT | ✓ (semantic summaries) |
| Gemini | ✓ (entity descriptions) |
| Claude | ✓ (content classification) |
| Perplexity | ✓ (topical relationships) |
| Copilot | ✓ (structured navigation) |

---

## Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| `/api/seo/runtime` timeout | MEDIUM | Pre-existing (heavy DB query) |
| `/api/seo/validate` timeout | MEDIUM | Pre-existing (depends on runtime) |
| Marketing page titles not localized | HIGH | Documented — pages use hardcoded English titles |
| Root layout metadata is static | MEDIUM | Uses `export const metadata` not `generateMetadata` |
| FAQ page doesn't generate FAQPage schema | LOW | SchemaRuntime supports it but FAQ page doesn't pass data |

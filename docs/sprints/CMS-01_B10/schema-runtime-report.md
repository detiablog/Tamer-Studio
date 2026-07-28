# Schema Runtime Report — B10 Sprint (Phase 7)

**Sprint:** SEO Runtime (B10)  
**Phase:** 7 — Structured Data Runtime  
**Status:** COMPLETED  
**Date:** 2026-07-28

---

## Objective

Build the Schema Runtime for generating JSON-LD structured data across 10 schema types with convenience methods for common patterns.

---

## Implementation

### File: `src/core/seo/schema-runtime.ts`

#### SchemaRuntime Class

- [x] Singleton pattern via `getSchemaRuntime()`
- [x] Cache integration via `SEOCache`

#### Supported Schema Types

| # | Schema Type | Usage |
|---|-------------|-------|
| 1 | `Organization` | Site-wide organization info |
| 2 | `Website` | Site metadata and search action |
| 3 | `WebPage` | Per-page metadata |
| 4 | `BreadcrumbList` | Navigation breadcrumbs |
| 5 | `FAQPage` | FAQ sections |
| 6 | `Article` | Blog posts and articles |
| 7 | `SoftwareApplication` | Product/landing pages |
| 8 | `Product` | Product listings |
| 9 | `VideoObject` | Video content |
| 10 | `ImageObject` | Image content |

#### Convenience Methods

- [x] `generateSchemasForPage(route, locale)` — Returns all applicable schemas for a page
- [x] `resolveBreadcrumbs(route, locale)` — Generates `BreadcrumbList` schema from navigation data
- [x] `resolveFAQ(faqs)` — Generates `FAQPage` schema from FAQ content
- [x] `resolveArticle(articleData)` — Generates `Article` schema from post data

#### Schema Generation

**Organization Schema:**
- [x] Name, URL, logo, contactPoint, sameAs (social profiles)

**Website Schema:**
- [x] Name, URL, potentialAction (SearchAction)

**WebPage Schema:**
- [x] Name, description, URL, breadcrumb, isPartOf

**BreadcrumbList Schema:**
- [x] Position, name, URL per breadcrumb item

**FAQPage Schema:**
- [x] MainEntity with Question/Answer pairs

**Article Schema:**
- [x] headline, author, datePublished, dateModified, image, publisher

**SoftwareApplication Schema:**
- [x] name, applicationCategory, operatingSystem, offers, aggregateRating

**Product Schema:**
- [x] name, image, description, offers, brand

**VideoObject Schema:**
- [x] name, description, thumbnailUrl, duration, embedUrl

**ImageObject Schema:**
- [x] contentUrl, license, creditText

#### Key Methods

- `resolveSchemas(route, locale, options?)` — All schemas for a page
- `resolveOrganization()` — Organization schema
- `resolveWebsite()` — Website schema
- `resolveWebPage(route, locale)` — WebPage schema
- `resolveBreadcrumbs(route, locale)` — BreadcrumbList schema
- `resolveFAQ(faqs)` — FAQPage schema
- `resolveArticle(data)` — Article schema
- `resolveSoftwareApplication(data)` — SoftwareApplication schema
- `resolveProduct(data)` — Product schema
- `resolveVideoObject(data)` — VideoObject schema
- `resolveImageObject(data)` — ImageObject schema

#### Cache Keys

- Prefix: `schema:${route}:${locale}`
- TTL: Inherited from SEOCache config

---

## Deliverables

- [x] `src/core/seo/schema-runtime.ts` — Structured data generation

---

## Status

**COMPLETED** — Schema Runtime supports 10 schema types with convenience methods and cache integration.

# Homepage SEO Report

**Sprint:** CMS-01 B9  
**Date:** 2026-07-28  
**Status:** COMPLETE

---

## Overview

Homepage Runtime stores SEO metadata only. SEO Runtime generates meta tags, OpenGraph, Schema.org, robots, sitemap.

---

## SEO Resolution

```typescript
// HomepageRuntime.resolveSEO()
async resolveSEO(page, context): Promise<HomepageSEOData> {
  const service = getLocalizationService();
  service.setLocale(context.locale as any);

  return {
    title: page.seo.title || service.t("marketing.seoTitle"),
    description: page.seo.description || service.t("marketing.seoDescription"),
    keywords: [...],
    image: page.seo.ogImage || "https://tamer.studio/og-image.png",
    url: page.seo.canonical || "https://tamer.studio",
    canonical: page.seo.canonical || "https://tamer.studio",
    robots: page.seo.robots || "index, follow",
    ogType: "website",
    ogLocale: context.locale === "id" ? "id_ID" : "en_US",
    twitterCard: "summary_large_image",
    twitterSite: "@tamerstudio",
    hreflangs: [
      { hreflang: "en", href: "https://tamer.studio" },
      { hreflang: "id", href: "https://tamer.studio/id" },
      { hreflang: "x-default", href: "https://tamer.studio" },
    ],
  };
}
```

---

## SEO Metadata

| Field | Source | Default |
|---|---|---|
| Title | CMS page.seo.title | Marketing translation key |
| Description | CMS page.seo.description | Marketing translation key |
| Keywords | Hardcoded | AI, production, automation |
| Image | CMS page.seo.ogImage | og-image.png |
| Canonical | CMS page.seo.canonical | https://tamer.studio |
| Robots | CMS page.seo.robots | index, follow |

---

## OpenGraph

```typescript
openGraph: {
  title: seo.title,
  description: seo.description,
  type: "website",
  url: seo.url,
  siteName: "Tamer Studio",
  images: [{ url: seo.image, width: 1200, height: 630, alt: seo.title }],
  locale: seo.ogLocale,
}
```

---

## Twitter Card

```typescript
twitter: {
  card: "summary_large_image",
  title: seo.title,
  description: seo.description,
  images: [seo.image],
}
```

---

## Hreflang

```typescript
hreflangs: [
  { hreflang: "en", href: "https://tamer.studio" },
  { hreflang: "id", href: "https://tamer.studio/id" },
  { hreflang: "x-default", href: "https://tamer.studio" },
]
```

---

## generateMetadata

```typescript
generateMetadata(resolution): HomepageMetadata {
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: { ... },
    twitter: { ... },
    robots: { index: true, follow: true },
    alternates: {
      canonical: seo.canonical,
      languages: hreflangs.reduce(...),
    },
  };
}
```

---

## No SEO Generation

| Requirement | Status |
|---|---|
| Homepage Runtime stores metadata only | ✓ |
| SEO Runtime generates meta tags | ✓ (via metadata API) |
| SEO Runtime generates OpenGraph | ✓ (via metadata API) |
| SEO Runtime generates Schema.org | ✓ (via layout.tsx JSON-LD) |
| SEO Runtime generates robots | ✓ (via robots.ts) |
| SEO Runtime generates sitemap | ✓ (via sitemap.ts) |
| Homepage Runtime never generates SEO | ✓ |

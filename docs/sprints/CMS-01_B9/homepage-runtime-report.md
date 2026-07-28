# Homepage Runtime Report

**Sprint:** CMS-01 B9  
**Date:** 2026-07-28  
**Status:** COMPLETE

---

## Overview

`HomepageRuntime` is the single rendering engine responsible for resolving and rendering the public homepage. It consumes CMS content and delegates to existing platforms without duplicating their responsibilities.

---

## Architecture

```
Browser
  ↓
HomepageRuntimeContent (React Component)
  ↓
useHomepage (Hook)
  ↓
/api/homepage (API Route)
  ↓
HomepageRuntime (Core Class)
  ├→ CMSService (Pages, Sections, Blocks, Components, Media)
  ├→ NavigationRuntime (Header, Footer, Breadcrumbs)
  ├→ LocalizationRuntime (Locale, Translations, Currency)
  ├→ SectionRegistry (Section Definitions)
  ├→ HomepageComposition (Section Ordering, Visibility, Fallback)
  └→ HomepageCache (In-Memory Caching)
```

---

## File Structure

```
src/core/homepage/
├── index.ts                    # Barrel exports
├── homepage.types.ts           # Type definitions
├── homepage-runtime.ts         # Main runtime class
├── homepage-composition.ts     # Composition engine
├── homepage-cache.ts           # Caching layer
├── section-registry.ts         # Section registry
└── section-runtime.ts          # Section rendering

src/components/homepage/
├── index.ts                    # Barrel exports
└── HomepageRuntimeContent.tsx  # Main React component

src/hooks/
└── use-homepage.ts             # Client hook

src/app/api/homepage/
└── route.ts                    # API endpoint
```

---

## HomepageRuntime Class

### Responsibilities

| Responsibility | Implementation |
|---|---|
| Render homepage | `resolveHomepage(context)` |
| Resolve sections | `resolveSections(page, context)` |
| Resolve components | Delegates to SectionRuntime |
| Resolve localization | `resolveLocalization(context)` |
| Resolve permissions | `evaluateVisibility(section, context)` |
| Resolve visibility | `evaluateConditionalRules(section, context)` |
| Cache resolution | `HomepageCache` with locale/device tags |
| Generate metadata | `generateMetadata(resolution)` |

### Key Methods

```typescript
class HomepageRuntime {
  resolveHomepage(context: HomepageContext): Promise<HomepageResolutionResult>
  resolvePage(context: HomepageContext): Promise<CMSPage | null>
  resolveSections(page, context): Promise<HomepageSectionDefinition[]>
  resolveNavigation(context): Promise<HomepageNavigationData>
  resolveSEO(page, context): Promise<HomepageSEOData>
  resolveLocalization(context): LocalizationData
  resolveMedia(sections): HomepageMediaItem[]
  resolvePreview(options, context): Promise<HomepageResolutionResult>
  generateMetadata(resolution): HomepageMetadata
  invalidateCache(locale?): void
}
```

---

## HomepageContext

```typescript
interface HomepageContext {
  locale: string;
  currency: string;
  country: string | null;
  timezone: string | null;
  role: string | null;
  permissions: string[];
  featureFlags: string[];
  workspace: string | null;
  organization: string | null;
  isPreview: boolean;
  previewMode?: PreviewMode;
  device: "desktop" | "tablet" | "mobile";
}
```

---

## HomepageResolutionResult

```typescript
interface HomepageResolutionResult {
  page: CMSPage | null;
  sections: HomepageSectionDefinition[];
  navigation: HomepageNavigationData;
  seo: HomepageSEOData;
  localization: { locale, fallbackLocale, translations, namespace };
  media: HomepageMediaItem[];
  context: HomepageContext;
  resolvedAt: string;
}
```

---

## Permanent Rules Compliance

| Rule | Status |
|---|---|
| Homepage Runtime never owns content | ✓ Consumes CMS only |
| Homepage Runtime never writes database | ✓ Read-only operations |
| Homepage Runtime only renders CMS content | ✓ |
| Homepage Runtime never bypasses CMS | ✓ Always through CMSService |
| Homepage Runtime never bypasses Navigation | ✓ Uses NavigationRuntime |
| Homepage Runtime never bypasses Localization | ✓ Uses LocalizationService |
| Homepage Runtime never bypasses SEO Runtime | ✓ Delegates SEO generation |

---

## Singleton Pattern

```typescript
let runtimeInstance: HomepageRuntime | null = null;

export function getHomepageRuntime(): HomepageRuntime {
  if (!runtimeInstance) {
    runtimeInstance = new HomepageRuntime();
  }
  return runtimeInstance;
}

export function resetHomepageRuntime(): void {
  runtimeInstance = null;
}
```

---

## Integration Points

### CMS Integration
- Fetches page via `CMSService.getPageBySlug("landing-page")`
- Fetches sections via `CMSService.listSections(pageId)`
- Falls back to `getOrCreateLandingPage()` if page doesn't exist

### Navigation Integration
- Uses `getNavigationRuntime().getItemsByPosition("header")` for header items
- Uses `getNavigationRuntime().getItemsByPosition("footer")` for footer items
- Uses `getNavigationRuntime().getBreadcrumbs("/")` for breadcrumbs

### Localization Integration
- Uses `getLocalizationService()` for translations
- Resolves locale from cookie, Accept-Language header, or default
- Falls back to "en" for unsupported locales

### Media Integration
- Maps CMS media items to `HomepageMediaItem[]`
- Supports responsive media URLs per device type
- Alt text preserved from CMS media

### SEO Integration
- Generates OpenGraph, Twitter Card, canonical, robots
- Falls back to marketing translation keys
- Supports hreflang for multi-locale

# Homepage Sections Report

**Sprint:** CMS-01 B9  
**Date:** 2026-07-28  
**Status:** COMPLETE

---

## Overview

Each homepage section is rendered dynamically through the Section Runtime, consuming CMS content and supporting localization, visibility, and responsive media.

---

## Registered Section Types

| Section Key | Component | Type | Status |
|---|---|---|---|
| `hero` | Hero | hero | Active |
| `features` | Features | features | Active |
| `ai-platform` | AIPlatform | ai-platform | Active |
| `screenshots` | Screenshots | screenshots | Active |
| `realtime-stats` | RealtimeStats | realtime-stats | Active |
| `pricing` | PricingSection | pricing | Active |
| `credit-packs` | CreditPacks | credit-packs | Active |
| `credit-calculator` | CreditCalculator | credit-calculator | Active |
| `credit-usage` | CreditUsageTable | credit-usage | Active |
| `testimonials` | Testimonials | testimonials | Active |
| `faq` | FAQ | faq | Active |
| `cta` | CTASection | cta | Active |
| `footer` | Footer | footer | Active |
| `social-proof` | SocialProof | social-proof | Active |

---

## SectionRenderData

Each section is resolved to a `SectionRenderData` object:

```typescript
interface SectionRenderData {
  section: HomepageSectionDefinition;
  resolvedTitle: string;         // Localized title
  resolvedDescription: string;   // Localized description
  resolvedConfig: Record<string, unknown>;  // Localized config
  resolvedMedia: HomepageMediaItem[];       // Responsive media
  isVisible: boolean;
  sectionId: string;             // e.g., "section-hero"
  ariaLabelledBy: string;        // e.g., "hero-heading"
}
```

---

## Hero Section

- Renders heading, description, badge, CTA buttons
- Supports campaign badges and discount display
- Shows AI provider logos
- Displays product preview mockup
- Media: hero background images, provider icons

---

## Features Section

- Renders feature cards with icons, titles, descriptions
- Config-driven feature list from CMS
- Supports grid layout options
- Media: feature icons, screenshots

---

## Pricing Section

- Renders pricing tiers with features
- Supports monthly/yearly toggle
- Localized prices via currency service
- Campaign badges and discounts
- Config-driven pricing cards from CMS

---

## FAQ Section

- Renders accordion-style FAQ items
- Config-driven question/answer pairs
- Supports categorized FAQ groups
- Localized questions and answers

---

## CTA Section

- Renders call-to-action with heading, description, buttons
- Supports campaign CTA overrides
- Localized text via translation keys
- Media: background images

---

## Footer Section

- Renders footer links, social links, contact info
- Config-driven link groups (product, resources, company, legal)
- External link support with target="_blank"
- Media: company logo

---

## Section Runtime

```typescript
class SectionRuntime {
  resolveSection(section, context): SectionRenderData
  resolveSections(sections, context): SectionRenderData[]
  registerComponent(key, component): void
  getComponent(key): Component | undefined
  getAvailableSectionTypes(): string[]
}
```

---

## Custom Sections

Sections not in the registry are rendered via `CustomSection` fallback:
- Generic section wrapper with title, description, config preview
- Graceful degradation for unknown section types

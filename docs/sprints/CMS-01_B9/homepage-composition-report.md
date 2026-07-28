# Homepage Composition Report

**Sprint:** CMS-01 B9  
**Date:** 2026-07-28  
**Status:** COMPLETE

---

## Overview

`HomepageComposition` is the engine that assembles homepage sections dynamically from the Section Registry, CMS content, and context-aware rules.

---

## Composition Pipeline

```
CMS Sections + Registry Sections
  ↓
processSections (Visibility, Permissions, Feature Flags)
  ↓
orderSections (Sort by order)
  ↓
applyFallbacks (Fill gaps from registry)
  ↓
localizeSection (Apply translations per locale)
  ↓
CompositionResult
```

---

## Section Registry

### Registration

```typescript
const registry = getSectionRegistry();

registry.register({
  sectionKey: "hero",
  type: "hero",
  component: "hero",
  title: "Hero",
  order: 0,
  visible: true,
  visibility: "public",
  localization: { namespace: "homepage", fallbackLocale: "en" },
});
```

### Registry Operations

| Operation | Method |
|---|---|
| Register section | `register(input)` |
| Unregister section | `unregister(key)` |
| Get section | `get(key)` |
| Get all | `getAll()` |
| Get visible | `getVisible()` |
| Get by type | `getByType(type)` |
| Get ordered | `getOrdered()` |
| Update order | `updateOrder(key, order)` |
| Reorder | `reorder(orders)` |
| Set visibility | `setVisibility(key, visible)` |
| Resolve rules | `resolveConditionalRules(key, context)` |
| Resolve fallback | `resolveFallback(key)` |

---

## Dynamic Ordering

Sections are sorted by their `order` property:

```typescript
sections.sort((a, b) => a.order - b.order);
```

Default order from CMS `landing_section` table. Registry sections fill gaps when CMS sections are missing.

---

## Visibility Rules

| Rule Type | Evaluation |
|---|---|
| `visible: false` | Section hidden |
| `visibility: "admin"` | Only visible to admin role |
| `visibility: "authenticated"` | Only visible to logged-in users |
| `permissions: [...]` | At least one permission must match |
| `featureFlags: [...]` | All feature flags must be present |

---

## Conditional Rules

```typescript
interface SectionConditionalRule {
  type: "locale" | "permission" | "feature_flag" | "device" | "time_range";
  condition: string;
  value: string;
  negate?: boolean;
}
```

### Rule Types

| Type | Condition | Description |
|---|---|---|
| `locale` | `"id"` | Show only for Indonesian locale |
| `permission` | `"admin"` | Show only with admin permission |
| `feature_flag` | `"new-pricing"` | Show only when feature flag active |
| `device` | `"mobile"` | Show only on mobile devices |

---

## Fallback Strategy

```typescript
interface FallbackStrategy {
  type: "default_content" | "hide" | "use_fallback" | "use_registry";
  fallbackSectionKey?: string;
}
```

| Strategy | Behavior |
|---|---|
| `use_registry` | Fill missing sections from Section Registry |
| `use_fallback` | Use specified fallback section |
| `hide` | Hide missing sections |
| `default_content` | Show default content for missing sections |

Default strategy: `use_registry`

---

## Localization

Sections are localized based on:

1. Section's `localization.translations[locale]`
2. Fallback to `localization.translations[fallbackLocale]`
3. Fallback to original value

Config objects are recursively localized, supporting nested translation keys.

---

## CompositionResult

```typescript
interface CompositionResult {
  sections: HomepageSectionDefinition[];
  metadata: {
    totalSections: number;
    visibleSections: number;
    hiddenSections: number;
    resolvedAt: string;
    locale: string;
    device: string;
  };
}
```

---

## API Usage

```typescript
const composition = getHomepageComposition();
const result = composition.compose(sections, context);
// result.sections - ordered, visible, localized sections
// result.metadata - composition metadata
```

---

## Integration with HomepageRuntime

```typescript
// In HomepageRuntime.resolveSections():
const cmsSections = await this.cmsService.listSections(page.id);
const definitions = cmsSections.map(section => this.mapCMSToDefinition(section));

// Apply registry sections
for (const entry of this.sectionRegistry.getAll()) {
  if (!definitions.find(d => d.sectionKey === entry.sectionKey)) {
    definitions.push(this.sectionRegistryToDefinition(entry));
  }
}

// Filter and order
const resolved = definitions
  .filter(section => this.evaluateVisibility(section, context))
  .filter(section => this.evaluateConditionalRules(section, context))
  .sort((a, b) => a.order - b.order);
```

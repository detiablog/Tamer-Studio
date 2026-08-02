# Breadcrumb Runtime Report

**Sprint:** CMS-01 B7 — Navigation Runtime  
**Phase:** Phase 5 — Breadcrumb Runtime  
**Date:** 2026-07-28  
**Status:** COMPLETE  

---

## Executive Summary

The Breadcrumb Runtime has been implemented to automatically generate breadcrumbs from route metadata, support hierarchy, dynamic routes, CMS pages, and localization. No breadcrumbs are hardcoded anymore.

---

## 1. Features

### 1.1 Hierarchy Support
- Breadcrumbs are generated from the route hierarchy
- Each path segment maps to a breadcrumb item
- Parent routes are automatically included in the breadcrumb trail

### 1.2 Dynamic Routes
- Dynamic route parameters (e.g., `[id]`) are handled gracefully
- The breadcrumb for a dynamic segment uses the route metadata title
- If no metadata exists, the segment name is used as a fallback

### 1.3 CMS Pages
- CMS pages can have custom breadcrumb labels
- Breadcrumb labels can be set via route metadata
- CMS page titles are used as breadcrumb labels when available

### 1.4 Localization
- Breadcrumb labels can use translation keys (`labelKey`)
- Labels are translated based on the current locale
- Fallback locale ensures graceful degradation
- Namespace-based translation organization

---

## 2. Configuration

The Breadcrumb Runtime is configurable via `BreadcrumbRuntimeConfig`:

| Option | Type | Default | Description |
|---|---|---|---|
| `separator` | string | `" / "` | Separator between breadcrumb items |
| `maxDepth` | number | `5` | Maximum breadcrumb depth |
| `homeLabel` | string | `"Home"` | Label for the home breadcrumb |
| `homeLabelKey` | string | `"common.home"` | Translation key for home label |
| `homeHref` | string | `"/"` | Href for the home breadcrumb |
| `generateAutomatically` | boolean | `true` | Auto-generate breadcrumbs from routes |
| `includeCurrentPage` | boolean | `true` | Include the current page in breadcrumbs |
| `localize` | boolean | `true` | Enable localization of breadcrumb labels |

---

## 3. Breadcrumb Generation

### 3.1 Automatic Generation
When `generateAutomatically` is `true`, breadcrumbs are generated from the route path:

**Route:** `/dashboard/settings/profile`

**Generated Breadcrumbs:**
1. Home (`/`)
2. Dashboard (`/dashboard`)
3. Settings (`/dashboard/settings`)
4. Profile (`/dashboard/settings/profile`) — current page

### 3.2 Route Metadata Integration
When route metadata is registered, breadcrumbs use the metadata titles:

**Route Metadata:**
```typescript
{
  route: "/dashboard/settings",
  title: "Settings",
  titleKey: "settings.title",
  description: "Manage settings",
  canonical: "/dashboard/settings",
  priority: 0.5,
  robots: "index",
  sitemap: true,
  breadcrumb: [],
  permissions: [],
  featureFlags: [],
  workspaces: [],
  organizations: [],
  localization: { namespace: "navigation", fallbackLocale: "en" },
  metadata: {},
}
```

**Generated Breadcrumbs:**
1. Home (`/`)
2. Settings (`/dashboard/settings`) — uses metadata title
3. Profile (`/dashboard/settings/profile`) — current page

### 3.3 Custom Breadcrumbs
Custom breadcrumbs can be set for specific routes:

```typescript
breadcrumbRuntime.setCustomBreadcrumbs("/custom-route", [
  { label: "Home", href: "/", current: false, order: 0 },
  { label: "Custom Section", href: "/custom-section", current: false, order: 1 },
  { label: "Custom Page", href: "/custom-route", current: true, order: 2 },
]);
```

### 3.4 Localization
Breadcrumb labels are translated using the Localization Platform:

```typescript
const breadcrumbs = breadcrumbRuntime.generateBreadcrumbs("/dashboard", "id");
// Returns: [{ label: "Dasbor", href: "/dashboard", current: true, order: 0 }]
```

---

## 4. API

### 4.1 Generate Breadcrumbs
```typescript
const breadcrumbs = breadcrumbRuntime.generateBreadcrumbs("/dashboard/settings", "en");
```

### 4.2 Set Custom Breadcrumbs
```typescript
breadcrumbRuntime.setCustomBreadcrumbs("/custom", [
  { label: "Home", href: "/", current: false, order: 0 },
  { label: "Custom", href: "/custom", current: true, order: 1 },
]);
```

### 4.3 Clear Custom Breadcrumbs
```typescript
breadcrumbRuntime.clearCustomBreadcrumbs("/custom");
```

### 4.4 Register Route Metadata
```typescript
breadcrumbRuntime.registerRouteMetadata({
  route: "/dashboard/settings",
  title: "Settings",
  titleKey: "settings.title",
  // ... other metadata
});
```

### 4.5 Update Configuration
```typescript
breadcrumbRuntime.updateConfig({
  separator: " > ",
  maxDepth: 10,
  homeLabel: "Accueil",
  homeLabelKey: "common.home",
});
```

---

## 5. Integration Points

### 5.1 Navigation Runtime
The Breadcrumb Runtime is integrated with the Navigation Runtime. Route metadata registered with the runtime is automatically available to the breadcrumb system.

### 5.2 Navigation Registry
The registry provides route metadata that feeds into breadcrumb generation.

### 5.3 Localization Integration
Breadcrumb labels are translated using the Navigation Localization Integration.

### 5.4 CMS Integration
CMS pages can have custom breadcrumb configurations that override auto-generated breadcrumbs.

### 5.5 Navigation Cache
Breadcrumb results are cached for performance. Cache invalidation occurs when route metadata changes.

---

## 6. Example Usage

```typescript
import { getBreadcrumbRuntime } from "@/core/navigation";

const breadcrumbRuntime = getBreadcrumbRuntime();

// Register route metadata
breadcrumbRuntime.registerRouteMetadata({
  route: "/dashboard/projects/[id]",
  title: "Project Details",
  titleKey: "projects.details",
  canonical: "/dashboard/projects/[id]",
  priority: 0.6,
  robots: "index",
  sitemap: true,
  breadcrumb: [],
  permissions: ["projects.view"],
  featureFlags: [],
  workspaces: [],
  organizations: [],
  localization: { namespace: "navigation", fallbackLocale: "en" },
  metadata: {},
});

// Generate breadcrumbs
const breadcrumbs = breadcrumbRuntime.generateBreadcrumbs("/dashboard/projects/123", "en");
// Result:
// [
//   { label: "Home", href: "/", current: false, order: 0 },
//   { label: "Dashboard", href: "/dashboard", current: false, order: 1 },
//   { label: "Projects", href: "/dashboard/projects", current: false, order: 2 },
//   { label: "Project Details", href: "/dashboard/projects/123", current: true, order: 3 },
// ]
```

---

## 7. Benefits

1. **No Hardcoded Breadcrumbs** — All breadcrumbs are generated automatically
2. **Route Metadata Driven** — Breadcrumbs use route metadata for titles and labels
3. **Dynamic Route Support** — Dynamic route parameters are handled correctly
4. **CMS Integration** — CMS pages can have custom breadcrumb configurations
5. **Localized** — Breadcrumb labels are translated based on the current locale
6. **Customizable** — Breadcrumb configuration can be customized per-route or globally
7. **Cacheable** — Breadcrumb results are cached for performance

---

## 8. Conclusion

The Breadcrumb Runtime automatically generates breadcrumbs from route metadata, supports dynamic routes, CMS pages, and localization. No breadcrumbs are hardcoded anymore. All breadcrumbs are generated from the centralized navigation infrastructure.
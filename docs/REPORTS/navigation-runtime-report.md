# Navigation Runtime Report

**Sprint:** CMS-01 B7 — Navigation Runtime  
**Phase:** Phase 2 — Navigation Runtime  
**Date:** 2026-07-28  
**Status:** COMPLETE  

---

## Executive Summary

The Navigation Runtime has been created as the centralized runtime for all navigation operations in Tamer Studio. It provides menu resolution, active route detection, permission-aware filtering, localization integration, and breadcrumb generation.

---

## 1. Architecture

```
Application
    ↓
Navigation Runtime
    ↓
Navigation Registry
    ↓
CMS Engine
    ↓
Localization Platform
    ↓
Infrastructure
    ↓
Repository
    ↓
Database
```

---

## 2. Responsibilities

### 2.1 Menu Resolution
The Navigation Runtime resolves navigation menus from the Navigation Registry. It supports:
- Multiple menu positions (header, sidebar, footer, dashboard, landing)
- Nested menu items with parent-child relationships
- Menu groups with independent visibility
- Dynamic menu ordering
- Menu visibility filtering based on context

### 2.2 Active Route Detection
The runtime detects the currently active route by matching the pathname against registered routes. It supports:
- Exact route matching
- Dynamic route pattern matching (e.g., `/projects/[id]`)
- Active state determination for navigation items
- Breadcrumb generation based on matched routes

### 2.3 Permissions
The runtime integrates with the Permission System to filter navigation items based on:
- User roles
- Explicit permissions
- Workspace membership
- Organization membership
- Feature flags

### 2.4 Localization
The runtime integrates with the Localization Platform to:
- Translate navigation labels using translation keys
- Support fallback locales
- Support namespace-based translation organization
- Dynamically switch languages

### 2.5 Breadcrumbs
The runtime automatically generates breadcrumbs from:
- Route metadata hierarchy
- Dynamic route parameters
- CMS page titles
- Localized labels

---

## 3. Core Components

### 3.1 NavigationRuntime
The main runtime class that orchestrates all navigation operations.

**Key Methods:**
- `registerItem()` — Register a navigation item
- `registerMenu()` — Register a navigation menu
- `registerRouteMetadata()` — Register route metadata for SEO and breadcrumbs
- `getItemsByPosition()` — Get items filtered by position
- `getBreadcrumbs()` — Generate breadcrumbs for a route
- `detectActiveRoute()` — Detect the active route from a pathname
- `isVisible()` — Check if an item is visible given context
- `filterByPermissions()` — Filter items by user permissions

### 3.2 NavigationRegistry
The registry stores all navigation entries and provides lookup by ID, route, module, and position.

**Key Methods:**
- `register()` — Register a new entry
- `unregister()` — Remove an entry
- `getEntry()` — Get an entry by ID
- `getEntriesByRoute()` — Get entries by route
- `hasRoute()` — Check if a route is registered
- `hasId()` — Check if an ID exists

### 3.3 MenuManagement
The menu management system handles nested menus, groups, icons, badges, external links, visibility, ordering, localization, and permissions.

**Key Methods:**
- `createMenu()` — Create a new menu
- `addItemToMenu()` — Add an item to a menu
- `createGroup()` — Create a menu group
- `addItemToGroup()` — Add an item to a group
- `setItemOrder()` — Set item ordering
- `setItemVisibility()` — Control item visibility
- `setGroupVisibility()` — Control group visibility

### 3.4 BreadcrumbRuntime
The breadcrumb runtime automatically generates breadcrumbs from route metadata.

**Key Methods:**
- `generateBreadcrumbs()` — Generate breadcrumbs for a route
- `setCustomBreadcrumbs()` — Set custom breadcrumbs for a route
- `registerRouteMetadata()` — Register route metadata
- `updateConfig()` — Update breadcrumb configuration

### 3.5 PermissionAwareNavigation
The permission-aware navigation system filters navigation items based on roles, permissions, workspaces, organizations, and feature flags.

**Key Methods:**
- `canAccessItem()` — Check if an item is accessible
- `filterItemsByPermission()` — Filter items by permissions
- `filterMenuByPermission()` — Filter an entire menu
- `registerRolePermissions()` — Register permissions for a role
- `setFeatureFlag()` — Set feature flag state

### 3.6 NavigationCache
The navigation cache provides caching for registry, menu, and route data with automatic invalidation.

**Key Methods:**
- `getRegistry()` / `setRegistry()` — Cache registry entries
- `getMenu()` / `setMenu()` — Cache menu data
- `getRoute()` / `setRoute()` — Cache route data
- `invalidateByTag()` — Invalidate by tag
- `invalidateKey()` — Invalidate by key
- `invalidateAll()` — Invalidate all cache

### 3.7 CMSNavigationIntegration
The CMS integration makes navigation editable through the CMS Engine.

**Key Methods:**
- `registerNavigationItem()` — Register an item from CMS
- `registerNavigationMenu()` — Register a menu from CMS
- `updateNavigationItem()` — Update an item from CMS
- `deleteNavigationItem()` — Delete an item from CMS
- `syncFromCMS()` — Sync all navigation from CMS

### 3.8 NavigationLocalizationIntegration
The localization integration provides translation support for navigation items.

**Key Methods:**
- `translateNavigationItem()` — Translate an item
- `translateBreadcrumbItem()` — Translate a breadcrumb item
- `translateMenu()` — Translate an entire menu
- `setLocale()` — Change the active locale
- `setFallbackLocale()` — Change the fallback locale

### 3.9 NavigationSEOIntegration
The SEO integration manages canonical routes, priority, robots visibility, and sitemap visibility.

**Key Methods:**
- `registerSEOMetadata()` — Register SEO metadata
- `registerNavigationItem()` — Register an item for SEO
- `getCanonicalRoute()` — Get the canonical route
- `generateSitemapEntries()` — Generate sitemap entries
- `generateRobotsTxt()` — Generate robots.txt content

### 3.10 NavigationAPI
The API provides centralized access to all navigation data.

**Key Methods:**
- `registerNavigation()` — Register a navigation item
- `getNavigationItem()` — Get a navigation item
- `getNavigationItems()` — Get navigation items with filtering
- `getNavigationMenu()` — Get a navigation menu
- `getBreadcrumbs()` — Get breadcrumbs for a route
- `getActiveRoute()` — Get active route information
- `getNavigationTree()` — Get the navigation tree
- `syncCMS()` — Sync navigation from CMS
- `invalidateCache()` — Invalidate cache

---

## 4. Design Decisions

### 4.1 Single Source of Truth
The Navigation Registry is the single source of truth for all navigation data. All consumers (Sidebar, Breadcrumb, Dashboard, Search, Command Palette) read from the same registry.

### 4.2 Separation of Concerns
Navigation content belongs to CMS. Navigation rendering belongs to Navigation Runtime. CMS never renders navigation. Navigation Runtime never edits CMS.

### 4.3 Permission-Aware by Default
Every navigation item supports permissions, feature flags, workspaces, and organizations. Filtering is applied at runtime based on the current user context.

### 4.4 Localization-First
All navigation labels use translation keys. No hardcoded labels are allowed. Fallback locales ensure graceful degradation.

### 4.5 SEO-Integrated
Every navigation item has SEO metadata (canonical route, priority, robots visibility, sitemap visibility). The SEO integration consumes this metadata automatically.

### 4.6 Cache-Optimized
Navigation data is cached at three levels (registry, menu, route) with automatic invalidation when data changes.

---

## 5. Usage Example

```typescript
import { getNavigationRuntime, getNavigationAPI } from "@/core/navigation";

const runtime = getNavigationRuntime();
const api = getNavigationAPI();

// Register a navigation item
api.registerNavigation({
  id: "dashboard",
  module: "dashboard",
  position: "sidebar",
  type: "page",
  title: "Dashboard",
  titleKey: "dashboard.dashboard",
  route: "/dashboard",
  order: 0,
  permissions: ["dashboard.view"],
  featureFlags: [],
  localization: {
    namespace: "navigation",
    fallbackLocale: "en",
    translations: { en: "Dashboard", id: "Dasbor" },
  },
  seo: {
    canonicalRoute: "/dashboard",
    priority: 0.8,
    robotsVisibility: "index",
    sitemapVisibility: true,
  },
});

// Get breadcrumbs
const breadcrumbs = api.getBreadcrumbs("/dashboard");

// Get active route
const active = api.getActiveRoute("/dashboard");

// Get navigation tree
const tree = api.getNavigationTree(null, {
  permissions: ["dashboard.view"],
  featureFlags: [],
});
```

---

## 6. Conclusion

The Navigation Runtime is now the centralized platform for all navigation in Tamer Studio. It eliminates duplicate navigation definitions, hardcoded navigation logic, and manual breadcrumb configuration. All navigation is now managed through the registry, editable through the CMS, and automatically localized and SEO-optimized.
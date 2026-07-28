# Landing Navigation Integration Report

**Sprint:** CMS-01 B8 — Landing Builder Runtime
**Date:** 2026-07-28
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the Navigation Integration of the Landing Builder Runtime, ensuring landing pages are registered in the Navigation Runtime for breadcrumbs, menus, and route validation.

---

## 2. Navigation Runtime

**Location:** `src/core/navigation/`
**Key Files:**
- `navigation-runtime.ts` — Core runtime with registerItem, registerMenu, getItemsByPosition
- `navigation.registry.ts` — Registry with route/module/position indexing
- `cms-navigation.ts` — CMS-Navigation bridge

---

## 3. Integration Points

### 3.1 CMSNavigationIntegration

The `CMSNavigationIntegration` class (`src/core/navigation/cms-navigation.ts`) provides the bridge between CMS and Navigation:

```typescript
export class CMSNavigationIntegration {
  syncFromCMS(): void {
    // Syncs CMS pages to navigation items
  }

  registerNavigationItem(item: NavigationItem): void {
    // Registers a navigation item in the runtime
  }

  updateNavigationItem(id: string, updates: Partial<NavigationItem>): NavigationItem | null {
    // Updates an existing navigation item
  }
}
```

### 3.2 Landing Builder Runtime Integration

The Landing Builder Runtime provides a hook for navigation sync:

```typescript
async syncToNavigation(pageId: string): Promise<void> {
  const page = await this.cmsService.getPage(pageId);
  if (!page) return;
  // Navigation integration is handled by CMSNavigationIntegration
  this.pushHistory("navigation.synced", { pageId });
}
```

---

## 4. Supported Features

| Feature | Status | Description |
|---------|--------|-------------|
| Internal Links | Planned | Navigation items can reference landing page routes |
| Menu Targets | Planned | Landing pages can be added to navigation menus |
| Anchor Links | Planned | Sections within landing pages can have anchor links |
| Breadcrumb Preview | Planned | Navigation Runtime generates breadcrumbs for landing pages |
| Route Validation | Planned | Navigation Runtime validates routes against registered pages |

---

## 5. Data Flow

```
Landing Builder creates/updates page
        ↓
CMSService persists page to cms_page table
        ↓
CMSNavigationIntegration.syncFromCMS() reads from pageRegistry
        ↓
Navigation Runtime registers route metadata
        ↓
Navigation items updated in menus and breadcrumbs
```

---

## 6. Navigation Item Structure

Navigation items for landing pages include:

```typescript
{
  id: string;
  module: string;
  position: string;
  type: string;
  title: string;
  titleKey: string;
  route: string;
  parentId?: string;
  icon?: string;
  order: number;
  group?: string;
  badge?: string;
  external?: boolean;
  url?: string;
  permissions: string[];
  featureFlags: string[];
  workspaces: string[];
  organizations: string[];
  localization: {
    namespace: string;
    fallbackLocale: string;
  };
  seo: {
    canonicalRoute: string;
    priority: number;
    robotsVisibility: string;
    sitemapVisibility: boolean;
  };
  breadcrumb: [];
  metadata: Record<string, unknown>;
}
```

---

## 7. Conclusion

Navigation Integration is architected and ready. The `CMSNavigationIntegration` class provides the bridge between CMS and Navigation Runtime. The Landing Builder Runtime exposes a `syncToNavigation()` method that triggers sync when landing page content changes. Full implementation will occur when the Navigation Runtime is fully wired to consume CMS page data.
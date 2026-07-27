import type { NavigationItem, NavigationMenu, RouteMetadata } from "./navigation.types";
import { getNavigationRuntime } from "./navigation-runtime";
import { getNavigationRegistry } from "./navigation.registry";

export class CMSNavigationIntegration {
  private navigationItems: Map<string, NavigationItem> = new Map();
  private navigationMenus: Map<string, NavigationMenu> = new Map();
  private routeMetadata: Map<string, RouteMetadata> = new Map();
  private syncEnabled: boolean = true;

  syncFromCMS(): void {
    if (!this.syncEnabled) return;
    const registry = getNavigationRegistry();
    const runtime = getNavigationRuntime();
    const entries = registry.getAllEntries();

    for (const entry of entries) {
      for (const route of entry.routes) {
        const metadata = this.buildRouteMetadataFromEntry(entry, route);
        this.routeMetadata.set(route, metadata);
        runtime.registerRouteMetadata(metadata);
      }
    }
  }

  registerNavigationItem(item: NavigationItem): void {
    this.navigationItems.set(item.id, item);
    const runtime = getNavigationRuntime();
    runtime.registerItem({
      id: item.id,
      module: item.module,
      position: item.position,
      type: item.type,
      title: item.title,
      titleKey: item.titleKey,
      route: item.route,
      parentId: item.parentId,
      icon: item.icon,
      order: item.order,
      group: item.group,
      badge: item.badge,
      external: item.external,
      url: item.url,
      permissions: item.permissions,
      featureFlags: item.featureFlags,
      workspaces: item.workspaces,
      organizations: item.organizations,
      localization: item.localization,
      seo: item.seo,
      breadcrumb: item.breadcrumb,
      metadata: item.metadata,
    });
  }

  registerNavigationMenu(menu: NavigationMenu): void {
    this.navigationMenus.set(menu.id, menu);
    const runtime = getNavigationRuntime();
    runtime.registerMenu(menu);
  }

  updateNavigationItem(id: string, updates: Partial<NavigationItem>): NavigationItem | null {
    const existing = this.navigationItems.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.navigationItems.set(id, updated);
    const runtime = getNavigationRuntime();
    runtime.updateItem(id, updates);
    return updated;
  }

  deleteNavigationItem(id: string): boolean {
    const existed = this.navigationItems.delete(id);
    const runtime = getNavigationRuntime();
    runtime.removeItem(id);
    return existed;
  }

  updateNavigationMenu(id: string, updates: Partial<NavigationMenu>): NavigationMenu | null {
    const existing = this.navigationMenus.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.navigationMenus.set(id, updated);
    const runtime = getNavigationRuntime();
    runtime.registerMenu(updated);
    return updated;
  }

  deleteNavigationMenu(id: string): boolean {
    const existed = this.navigationMenus.delete(id);
    const runtime = getNavigationRuntime();
    runtime.removeMenu(id);
    return existed;
  }

  getNavigationItem(id: string): NavigationItem | undefined {
    return this.navigationItems.get(id);
  }

  getNavigationMenu(id: string): NavigationMenu | undefined {
    return this.navigationMenus.get(id);
  }

  getAllNavigationItems(): NavigationItem[] {
    return Array.from(this.navigationItems.values());
  }

  getAllNavigationMenus(): NavigationMenu[] {
    return Array.from(this.navigationMenus.values());
  }

  getRouteMetadata(route: string): RouteMetadata | undefined {
    return this.routeMetadata.get(route);
  }

  setSyncEnabled(enabled: boolean): void {
    this.syncEnabled = enabled;
  }

  isSyncEnabled(): boolean {
    return this.syncEnabled;
  }

  private buildRouteMetadataFromEntry(
    entry: { id: string; module: string; routes: string[]; metadata: Record<string, unknown> },
    route: string
  ): RouteMetadata {
    return {
      route,
      title: entry.module,
      titleKey: `navigation.${entry.id}.title`,
      description: "",
      descriptionKey: `navigation.${entry.id}.description`,
      canonical: route,
      priority: 0.5,
      robots: "index",
      sitemap: true,
      seo: {
        canonicalRoute: route,
        priority: 0.5,
        robotsVisibility: "index",
        sitemapVisibility: true,
      },
      breadcrumb: [],
      permissions: [],
      featureFlags: [],
      workspaces: [],
      organizations: [],
      localization: {
        namespace: "navigation",
        fallbackLocale: "en",
      },
      metadata: entry.metadata,
    };
  }
}

let cmsNavigationInstance: CMSNavigationIntegration | null = null;

export function getCMSNavigationIntegration(): CMSNavigationIntegration {
  if (!cmsNavigationInstance) {
    cmsNavigationInstance = new CMSNavigationIntegration();
  }
  return cmsNavigationInstance;
}

export function resetCMSNavigationIntegration(): void {
  cmsNavigationInstance = null;
}
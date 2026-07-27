import { getNavigationRegistry } from "./navigation.registry";
import type {
  NavigationItem,
  NavigationMenu,
  BreadcrumbItem,
  BreadcrumbRuntimeConfig,
  ActiveRouteInfo,
  RouteMetadata,
  NavigationPosition,
  NavigationVisibility,
  RegisterNavigationInput,
} from "./navigation.types";

export class NavigationRuntime {
  private menus: Map<string, NavigationMenu> = new Map();
  private items: Map<string, NavigationItem> = new Map();
  private routeMetadata: Map<string, RouteMetadata> = new Map();
  private breadcrumbConfig: BreadcrumbRuntimeConfig;

  constructor(breadcrumbConfig?: Partial<BreadcrumbRuntimeConfig>) {
    this.breadcrumbConfig = {
      separator: " / ",
      maxDepth: 5,
      homeLabel: "Home",
      homeLabelKey: "common.home",
      homeHref: "/",
      generateAutomatically: true,
      includeCurrentPage: true,
      localize: true,
      ...breadcrumbConfig,
    };
  }

  registerItem(input: RegisterNavigationInput): NavigationItem {
    const now = new Date().toISOString();
    const item: NavigationItem = {
      id: input.id,
      module: input.module,
      parentId: input.parentId ?? null,
      position: input.position,
      type: input.type,
      title: input.title,
      titleKey: input.titleKey,
      description: input.description,
      descriptionKey: input.descriptionKey,
      route: input.route,
      icon: input.icon,
      order: input.order ?? 0,
      group: input.group,
      badge: input.badge,
      external: input.external ?? false,
      url: input.url,
      target: input.target ?? "_self",
      rel: input.rel,
      visible: true,
      visibility: "public",
      permissions: input.permissions ?? [],
      featureFlags: input.featureFlags ?? [],
      workspaces: input.workspaces ?? [],
      organizations: input.organizations ?? [],
      localization: {
        namespace: input.localization?.namespace ?? "navigation",
        fallbackLocale: input.localization?.fallbackLocale ?? "en",
        translations: input.localization?.translations ?? {},
      },
      seo: {
        canonicalRoute: input.seo?.canonicalRoute ?? input.route,
        priority: input.seo?.priority ?? 0.5,
        robotsVisibility: input.seo?.robotsVisibility ?? "index",
        sitemapVisibility: input.seo?.sitemapVisibility ?? true,
      },
      breadcrumb: {
        type: input.breadcrumb?.type ?? "auto",
        labelKey: input.breadcrumb?.labelKey,
        generateAutomatically: input.breadcrumb?.generateAutomatically ?? true,
      },
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
      updatedBy: "system",
    };
    this.items.set(item.id, item);
    return item;
  }

  registerMenu(menu: NavigationMenu): void {
    this.menus.set(menu.id, menu);
  }

  registerRouteMetadata(metadata: RouteMetadata): void {
    this.routeMetadata.set(metadata.route, metadata);
  }

  getItem(id: string): NavigationItem | undefined {
    return this.items.get(id);
  }

  getMenu(id: string): NavigationMenu | undefined {
    return this.menus.get(id);
  }

  getRouteMetadata(route: string): RouteMetadata | undefined {
    return this.routeMetadata.get(route);
  }

  getItemsByPosition(position: NavigationPosition): NavigationItem[] {
    return Array.from(this.items.values())
      .filter((item) => item.position === position && item.visible)
      .sort((a, b) => a.order - b.order);
  }

  getItemsByMenu(menuId: string): NavigationItem[] {
    const menu = this.menus.get(menuId);
    if (!menu) return [];
    return menu.items.filter((item) => item.visible).sort((a, b) => a.order - b.order);
  }

  getChildren(parentId: string): NavigationItem[] {
    return Array.from(this.items.values())
      .filter((item) => item.parentId === parentId && item.visible)
      .sort((a, b) => a.order - b.order);
  }

  getTree(parentId: string | null = null): NavigationItem[] {
    const roots = Array.from(this.items.values())
      .filter((item) => item.parentId === parentId && item.visible)
      .sort((a, b) => a.order - b.order);
    return roots.map((root) => ({
      ...root,
      children: this.getChildren(root.id),
    }));
  }

  getBreadcrumbs(route: string, locale?: string): BreadcrumbItem[] {
    const metadata = this.routeMetadata.get(route);
    if (!metadata) {
      return [{ label: this.breadcrumbConfig.homeLabel, href: this.breadcrumbConfig.homeHref, current: false, order: 0 }];
    }
    const breadcrumbs: BreadcrumbItem[] = [];
    const parts = route.split("/").filter(Boolean);
    let accumulatedPath = "";
    for (let i = 0; i < parts.length; i++) {
      accumulatedPath += `/${parts[i]}`;
      const segmentMetadata = this.routeMetadata.get(accumulatedPath);
      const label = segmentMetadata?.title ?? parts[i];
      const labelKey = segmentMetadata?.titleKey;
      breadcrumbs.push({
        label,
        labelKey,
        href: accumulatedPath,
        current: i === parts.length - 1,
        order: i,
      });
    }
    return breadcrumbs;
  }

  detectActiveRoute(pathname: string): ActiveRouteInfo {
    const matchedRoute = this.findMatchingRoute(pathname);
    const metadata = matchedRoute ? this.routeMetadata.get(matchedRoute) : undefined;
    const breadcrumbs = matchedRoute ? this.getBreadcrumbs(matchedRoute) : [];
    const item = matchedRoute
      ? Array.from(this.items.values()).find((i) => i.route === matchedRoute) ?? null
      : null;
    return {
      route: matchedRoute ?? pathname,
      pathname,
      params: {},
      query: {},
      breadcrumbs,
      menuId: item?.module ?? null,
      menuItem: item,
      routeMetadata: metadata ?? null,
      permissions: metadata?.permissions ?? [],
      featureFlags: metadata?.featureFlags ?? [],
    };
  }

  private findMatchingRoute(pathname: string): string | null {
    const exactMatch = this.routeMetadata.get(pathname);
    if (exactMatch) return pathname;
    for (const [route] of this.routeMetadata) {
      if (this.matchRoutePattern(route, pathname)) {
        return route;
      }
    }
    return null;
  }

  private matchRoutePattern(pattern: string, pathname: string): boolean {
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = pathname.split("/").filter(Boolean);
    if (patternParts.length !== pathParts.length) return false;
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith("[")) continue;
      if (patternParts[i] !== pathParts[i]) return false;
    }
    return true;
  }

  isVisible(item: NavigationItem, context?: {
    role?: string;
    permissions?: string[];
    workspace?: string;
    organization?: string;
    featureFlags?: string[];
  }): boolean {
    if (!item.visible) return false;
    if (context?.permissions && item.permissions.length > 0 && !item.permissions.some((p) => context.permissions!.includes(p))) {
      return false;
    }
    if (context?.featureFlags) {
      for (const flag of item.featureFlags) {
        if (!context.featureFlags.includes(flag)) return false;
      }
    }
    if (context?.workspace && item.workspaces.length > 0 && !item.workspaces.includes(context.workspace)) {
      return false;
    }
    if (context?.organization && item.organizations.length > 0 && !item.organizations.includes(context.organization)) {
      return false;
    }
    return true;
  }

  filterByPermissions(items: NavigationItem[], permissions: string[]): NavigationItem[] {
    if (permissions.length === 0) return items;
    return items.filter((item) => {
      if (item.permissions.length === 0) return true;
      return item.permissions.some((p) => permissions.includes(p));
    });
  }

  getBreadcrumbConfig(): BreadcrumbRuntimeConfig {
    return { ...this.breadcrumbConfig };
  }

  updateBreadcrumbConfig(config: Partial<BreadcrumbRuntimeConfig>): void {
    this.breadcrumbConfig = { ...this.breadcrumbConfig, ...config };
  }

  getAllItems(): NavigationItem[] {
    return Array.from(this.items.values());
  }

  getAllMenus(): NavigationMenu[] {
    return Array.from(this.menus.values());
  }

  updateItem(id: string, updates: Partial<NavigationItem>): NavigationItem | null {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.items.set(id, updated);
    return updated;
  }

  removeItem(id: string): boolean {
    return this.items.delete(id);
  }

  removeMenu(id: string): boolean {
    return this.menus.delete(id);
  }
}

let runtimeInstance: NavigationRuntime | null = null;

export function getNavigationRuntime(): NavigationRuntime {
  if (!runtimeInstance) {
    runtimeInstance = new NavigationRuntime();
  }
  return runtimeInstance;
}

export function resetNavigationRuntime(): void {
  runtimeInstance = null;
}
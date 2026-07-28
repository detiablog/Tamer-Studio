import { getNavigationRuntime } from "./navigation-runtime";
import { getNavigationRegistry } from "./navigation.registry";
import { getMenuManagement } from "./menu-management";
import { getBreadcrumbRuntime } from "./breadcrumb-runtime";
import { getPermissionNavigation } from "./permission-navigation";
import { getNavigationCache } from "./navigation-cache";
import { getCMSNavigationIntegration } from "./cms-navigation";
import { getNavigationLocalization } from "./navigation-localization";
import { getNavigationSEO } from "./navigation-seo";
import type {
  NavigationItem,
  NavigationMenu,
  BreadcrumbItem,
  RouteMetadata,
  NavigationRegistryEntry,
  NavigationAPIResponse,
  RegisterNavigationInput,
  NavigationPosition,
} from "./navigation.types";

class NavigationAPI {
  private runtime = getNavigationRuntime();
  private registry = getNavigationRegistry();
  private menuManagement = getMenuManagement();
  private breadcrumbRuntime = getBreadcrumbRuntime();
  private permissionNavigation = getPermissionNavigation();
  private cache = getNavigationCache();
  private cmsIntegration = getCMSNavigationIntegration();
  private localization = getNavigationLocalization();
  private seo = getNavigationSEO();

  async registerNavigation(input: RegisterNavigationInput): Promise<NavigationAPIResponse<NavigationItem>> {
    try {
      const cacheKey = `nav:${input.id}`;
      await this.cache.invalidateKey(cacheKey);
      const item = this.runtime.registerItem(input);
      this.registry.register({
        id: input.id,
        module: input.module,
        routes: [input.route],
        menus: [input.position],
        permissions: input.permissions ?? [],
        featureFlags: input.featureFlags ?? [],
        localizationKeys: input.titleKey ? [input.titleKey] : [],
        breadcrumbConfig: [],
        seoConfig: {
        canonicalRoute: input.seo?.canonicalRoute ?? input.route,
        priority: input.seo?.priority ?? 0.5,
        robotsVisibility: input.seo?.robotsVisibility ?? "index",
        sitemapVisibility: input.seo?.sitemapVisibility ?? true,
      },
        metadata: input.metadata ?? {},
      });
      this.seo.registerNavigationItem(item);
      return { success: true, data: item };
    } catch (error) {
      return {
        success: false,
        data: null as unknown as NavigationItem,
        error: error instanceof Error ? error.message : "Unknown error",
        errorCode: "REGISTRATION_FAILED",
      };
    }
  }

  async getNavigationItem(id: string): Promise<NavigationAPIResponse<NavigationItem | null>> {
    const cacheKey = `nav-item:${id}`;
    const cached = await this.cache.getRegistry<NavigationItem>(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }
    const item = this.runtime.getItem(id);
    if (item) {
      await this.cache.setRegistry(cacheKey, item, [`nav-item-${id}`]);
    }
    return { success: true, data: item ?? null };
  }

  getNavigationItems(
    filters?: {
      position?: NavigationPosition;
      menuId?: string;
      parentId?: string | null;
      visible?: boolean;
      group?: string;
    },
    pagination?: { page: number; limit: number }
  ): NavigationAPIResponse<NavigationItem[]> {
    let items = this.runtime.getAllItems();
    if (filters?.position) {
      items = items.filter((i) => i.position === filters.position);
    }
    if (filters?.menuId) {
      const menu = this.menuManagement.getMenu(filters.menuId);
      if (menu) {
        items = items.filter((i) => menu.items.some((mi) => mi.id === i.id));
      }
    }
    if (filters?.parentId !== undefined) {
      items = items.filter((i) => i.parentId === filters.parentId);
    }
    if (filters?.visible !== undefined) {
      items = items.filter((i) => i.visible === filters.visible);
    }
    if (filters?.group) {
      items = items.filter((i) => i.group === filters.group);
    }
    items.sort((a, b) => a.order - b.order);
    const total = items.length;
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);
    return {
      success: true,
      data: paginated,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getNavigationMenu(id: string): Promise<NavigationAPIResponse<NavigationMenu | null>> {
    const cacheKey = `nav-menu:${id}`;
    const cached = await this.cache.getMenu<NavigationMenu>(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }
    const menu = this.menuManagement.getMenu(id);
    if (menu) {
      await this.cache.setMenu(cacheKey, menu, [`nav-menu-${id}`]);
    }
    return { success: true, data: menu ?? null };
  }

  getNavigationMenus(
    position?: NavigationPosition
  ): NavigationAPIResponse<NavigationMenu[]> {
    const menus = position
      ? this.menuManagement.getMenusByPosition(position)
      : this.menuManagement.getAllMenus();
    return { success: true, data: menus };
  }

  async getBreadcrumbs(
    route: string,
    locale?: string
  ): Promise<NavigationAPIResponse<BreadcrumbItem[]>> {
    const cacheKey = `breadcrumbs:${route}:${locale ?? "default"}`;
    const cached = await this.cache.getRoute<BreadcrumbItem[]>(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }
    const breadcrumbs = this.breadcrumbRuntime.generateBreadcrumbs(route, locale);
    await this.cache.setRoute(cacheKey, breadcrumbs, [`breadcrumb-${route}`]);
    return { success: true, data: breadcrumbs };
  }

  getRouteMetadata(route: string): NavigationAPIResponse<RouteMetadata | null> {
    const metadata = this.runtime.getRouteMetadata(route);
    return { success: true, data: metadata ?? null };
  }

  getActiveRoute(pathname: string): NavigationAPIResponse<{
    route: string;
    breadcrumbs: BreadcrumbItem[];
    menuItem: NavigationItem | null;
    routeMetadata: RouteMetadata | null;
  }> {
    const activeRoute = this.runtime.detectActiveRoute(pathname);
    return {
      success: true,
      data: {
        route: activeRoute.route,
        breadcrumbs: activeRoute.breadcrumbs,
        menuItem: activeRoute.menuItem,
        routeMetadata: activeRoute.routeMetadata,
      },
    };
  }

  getNavigationTree(
    parentId: string | null = null,
    context?: {
      role?: string;
      permissions?: string[];
      workspace?: string;
      organization?: string;
      featureFlags?: string[];
    }
  ): NavigationAPIResponse<NavigationItem[]> {
    const tree = this.runtime.getTree(parentId);
    const filtered = this.permissionNavigation.filterItemsByPermission(tree, context ?? {});
    return { success: true, data: filtered };
  }

  getRegistryEntries(): NavigationAPIResponse<NavigationRegistryEntry[]> {
    const entries = this.registry.getAllEntries();
    return { success: true, data: entries };
  }

  getRegistryEntry(id: string): NavigationAPIResponse<NavigationRegistryEntry | null> {
    const entry = this.registry.getEntry(id);
    return { success: true, data: entry ?? null };
  }

  async updateNavigationItem(
    id: string,
    updates: Partial<NavigationItem>
  ): Promise<NavigationAPIResponse<NavigationItem | null>> {
    const cacheKey = `nav-item:${id}`;
    await this.cache.invalidateKey(cacheKey);
    const item = this.runtime.updateItem(id, updates);
    if (item) {
      this.cmsIntegration.updateNavigationItem(id, updates);
      this.seo.registerNavigationItem(item);
    }
    return { success: true, data: item };
  }

  async removeNavigationItem(id: string): Promise<NavigationAPIResponse<boolean>> {
    const cacheKey = `nav-item:${id}`;
    await this.cache.invalidateKey(cacheKey);
    const removed = this.runtime.removeItem(id);
    if (removed) {
      this.cmsIntegration.deleteNavigationItem(id);
    }
    return { success: true, data: removed };
  }

  createMenu(input: {
    id: string;
    name: string;
    nameKey?: string;
    position: NavigationPosition;
    order?: number;
  }): NavigationAPIResponse<NavigationMenu> {
    const menu = this.menuManagement.createMenu(input);
    return { success: true, data: menu };
  }

  updateMenu(id: string, updates: Partial<NavigationMenu>): NavigationAPIResponse<NavigationMenu | null> {
    const menu = this.menuManagement.updateNavigationMenu(id, updates);
    return { success: true, data: menu };
  }

  deleteMenu(id: string): NavigationAPIResponse<boolean> {
    const removed = this.menuManagement.deleteMenu(id);
    return { success: true, data: removed };
  }

  syncCMS(): NavigationAPIResponse<{ synced: number }> {
    this.cmsIntegration.syncFromCMS();
    const entries = this.registry.getAllEntries();
    return { success: true, data: { synced: entries.length } };
  }

  setLocale(locale: string): NavigationAPIResponse<{ locale: string }> {
    this.localization.setLocale(locale);
    return { success: true, data: { locale } };
  }

  getCacheStats(): NavigationAPIResponse<{
    registrySize: number;
    menuSize: number;
    routeSize: number;
    totalSize: number;
    maxSize: number;
  }> {
    const stats = this.cache.getStats();
    return {
      success: true,
      data: {
        registrySize: stats.size,
        menuSize: stats.size,
        routeSize: stats.size,
        totalSize: stats.size,
        maxSize: 0,
      },
    };
  }

  async invalidateCache(tag?: string): Promise<NavigationAPIResponse<{ invalidated: boolean }>> {
    if (tag) {
      await this.cache.invalidateByTag(tag);
    } else {
      await this.cache.invalidateAll();
    }
    return { success: true, data: { invalidated: true } };
  }

  checkPermission(
    permission: string,
    context: {
      role?: string;
      workspace?: string;
      organization?: string;
      featureFlag?: string;
    }
  ): NavigationAPIResponse<{ result: boolean }> {
    const checkItem: NavigationItem = {
      id: "check",
      module: "check",
      parentId: null,
      position: "header",
      type: "page",
      title: "Check",
      route: "/check",
      order: 0,
      visible: true,
      visibility: "public",
      permissions: [permission],
      featureFlags: [],
      workspaces: [],
      organizations: [],
      localization: { namespace: "check", fallbackLocale: "en", translations: {} },
      seo: { canonicalRoute: "/check", priority: 0.5, robotsVisibility: "index", sitemapVisibility: true },
      breadcrumb: { type: "static", generateAutomatically: true },
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "system",
      updatedBy: "system",
    };
    const result = this.permissionNavigation.canAccessItem(checkItem, context);
    return { success: true, data: { result } };
  }
}

let navigationAPIInstance: NavigationAPI | null = null;

export function getNavigationAPI(): NavigationAPI {
  if (!navigationAPIInstance) {
    navigationAPIInstance = new NavigationAPI();
  }
  return navigationAPIInstance;
}

export function resetNavigationAPI(): void {
  navigationAPIInstance = null;
}

export { NavigationAPI };
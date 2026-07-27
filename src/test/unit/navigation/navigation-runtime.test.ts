import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NavigationRuntime, resetNavigationRuntime } from "@/core/navigation/navigation-runtime";
import { NavigationRegistryImpl, getNavigationRegistry, resetNavigationRegistry } from "@/core/navigation/navigation.registry";
import { MenuManagement, getMenuManagement, resetMenuManagement } from "@/core/navigation/menu-management";
import { BreadcrumbRuntime, getBreadcrumbRuntime, resetBreadcrumbRuntime } from "@/core/navigation/breadcrumb-runtime";
import { PermissionAwareNavigation, getPermissionNavigation, resetPermissionNavigation } from "@/core/navigation/permission-navigation";
import { NavigationCache, getNavigationCache, resetNavigationCache } from "@/core/navigation/navigation-cache";
import { CMSNavigationIntegration, getCMSNavigationIntegration, resetCMSNavigationIntegration } from "@/core/navigation/cms-navigation";
import { NavigationLocalizationIntegration, getNavigationLocalization, resetNavigationLocalization } from "@/core/navigation/navigation-localization";
import { NavigationSEOIntegration, getNavigationSEO, resetNavigationSEO } from "@/core/navigation/navigation-seo";
import { NavigationAPI, getNavigationAPI, resetNavigationAPI } from "@/core/navigation/navigation-api";
import type { NavigationItem, NavigationMenu, RegisterNavigationInput } from "@/core/navigation/navigation.types";

describe("Navigation Runtime", () => {
  beforeEach(() => {
    resetNavigationRuntime();
    resetNavigationRegistry();
    resetMenuManagement();
    resetBreadcrumbRuntime();
    resetPermissionNavigation();
    resetNavigationCache();
    resetCMSNavigationIntegration();
    resetNavigationLocalization();
    resetNavigationSEO();
    resetNavigationAPI();
  });

  afterEach(() => {
    resetNavigationRuntime();
    resetNavigationRegistry();
    resetMenuManagement();
    resetBreadcrumbRuntime();
    resetPermissionNavigation();
    resetNavigationCache();
    resetCMSNavigationIntegration();
    resetNavigationLocalization();
    resetNavigationSEO();
    resetNavigationAPI();
  });

  describe("NavigationRuntime", () => {
    it("should register a navigation item", () => {
      const runtime = new NavigationRuntime();
      const item = runtime.registerItem({
        id: "test-item",
        module: "test",
        position: "sidebar",
        type: "page",
        title: "Test Item",
        route: "/test",
        order: 0,
      });
      expect(item.id).toBe("test-item");
      expect(item.title).toBe("Test Item");
      expect(item.route).toBe("/test");
    });

    it("should retrieve a registered item", () => {
      const runtime = new NavigationRuntime();
      runtime.registerItem({
        id: "test-item",
        module: "test",
        position: "sidebar",
        type: "page",
        title: "Test Item",
        route: "/test",
        order: 0,
      });
      const item = runtime.getItem("test-item");
      expect(item).toBeDefined();
      expect(item!.id).toBe("test-item");
    });

    it("should return undefined for non-existent item", () => {
      const runtime = new NavigationRuntime();
      const item = runtime.getItem("non-existent");
      expect(item).toBeUndefined();
    });

    it("should filter items by position", () => {
      const runtime = new NavigationRuntime();
      runtime.registerItem({
        id: "sidebar-item",
        module: "test",
        position: "sidebar",
        type: "page",
        title: "Sidebar",
        route: "/sidebar",
        order: 0,
      });
      runtime.registerItem({
        id: "header-item",
        module: "test",
        position: "header",
        type: "page",
        title: "Header",
        route: "/header",
        order: 0,
      });
      const sidebarItems = runtime.getItemsByPosition("sidebar");
      expect(sidebarItems).toHaveLength(1);
      expect(sidebarItems[0].id).toBe("sidebar-item");
    });

    it("should generate breadcrumbs", () => {
      const runtime = new NavigationRuntime();
      runtime.registerRouteMetadata({
        route: "/dashboard",
        title: "Dashboard",
        description: "Dashboard page",
        canonical: "/dashboard",
        priority: 0.8,
        robots: "index",
        sitemap: true,
        seo: {
          canonicalRoute: "/dashboard",
          priority: 0.8,
          robotsVisibility: "index",
          sitemapVisibility: true,
        },
        breadcrumb: [],
        permissions: [],
        featureFlags: [],
        workspaces: [],
        organizations: [],
        localization: { namespace: "navigation", fallbackLocale: "en" },
        metadata: {},
      });
      const breadcrumbs = runtime.getBreadcrumbs("/dashboard");
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].label).toBe("Dashboard");
    });

    it("should detect active route", () => {
      const runtime = new NavigationRuntime();
      runtime.registerItem({
        id: "dashboard",
        module: "dashboard",
        position: "sidebar",
        type: "page",
        title: "Dashboard",
        route: "/dashboard",
        order: 0,
      });
      runtime.registerRouteMetadata({
        route: "/dashboard",
        title: "Dashboard",
        description: "",
        canonical: "/dashboard",
        priority: 0.8,
        robots: "index",
        sitemap: true,
        seo: {
          canonicalRoute: "/dashboard",
          priority: 0.8,
          robotsVisibility: "index",
          sitemapVisibility: true,
        },
        breadcrumb: [],
        permissions: [],
        featureFlags: [],
        workspaces: [],
        organizations: [],
        localization: { namespace: "navigation", fallbackLocale: "en" },
        metadata: {},
      });
      const active = runtime.detectActiveRoute("/dashboard");
      expect(active.route).toBe("/dashboard");
      expect(active.menuItem).toBeDefined();
      expect(active.menuItem!.id).toBe("dashboard");
    });

    it("should check visibility with permissions", () => {
      const runtime = new NavigationRuntime();
      const item = runtime.registerItem({
        id: "admin-item",
        module: "admin",
        position: "sidebar",
        type: "page",
        title: "Admin",
        route: "/admin",
        order: 0,
        permissions: ["admin"],
      });
      expect(runtime.isVisible(item, { permissions: ["admin"] })).toBe(true);
      expect(runtime.isVisible(item, { permissions: ["editor"] })).toBe(false);
    });

    it("should filter items by permissions", () => {
      const runtime = new NavigationRuntime();
      runtime.registerItem({
        id: "public-item",
        module: "test",
        position: "sidebar",
        type: "page",
        title: "Public",
        route: "/public",
        order: 0,
        permissions: [],
      });
      runtime.registerItem({
        id: "admin-item",
        module: "admin",
        position: "sidebar",
        type: "page",
        title: "Admin",
        route: "/admin",
        order: 0,
        permissions: ["admin"],
      });
      const filtered = runtime.filterByPermissions(
        runtime.getAllItems(),
        ["admin"]
      );
      expect(filtered).toHaveLength(2);
    });
  });

  describe("NavigationRegistry", () => {
    it("should register and retrieve an entry", () => {
      const registry = getNavigationRegistry();
      registry.register({
        id: "test-entry",
        module: "test",
        routes: ["/test"],
        menus: ["sidebar"],
        permissions: [],
        featureFlags: [],
        localizationKeys: [],
        breadcrumbConfig: [],
        seoConfig: {
          canonicalRoute: "/test",
          priority: 0.5,
          robotsVisibility: "index",
          sitemapVisibility: true,
        },
        metadata: {},
      });
      const entry = registry.getEntry("test-entry");
      expect(entry).toBeDefined();
      expect(entry!.id).toBe("test-entry");
    });

    it("should check if a route exists", () => {
      const registry = getNavigationRegistry();
      registry.register({
        id: "test-entry",
        module: "test",
        routes: ["/test"],
        menus: ["sidebar"],
        permissions: [],
        featureFlags: [],
        localizationKeys: [],
        breadcrumbConfig: [],
        seoConfig: {
          canonicalRoute: "/test",
          priority: 0.5,
          robotsVisibility: "index",
          sitemapVisibility: true,
        },
        metadata: {},
      });
      expect(registry.hasRoute("/test")).toBe(true);
      expect(registry.hasRoute("/nonexistent")).toBe(false);
    });

    it("should unregister an entry", () => {
      const registry = getNavigationRegistry();
      registry.register({
        id: "test-entry",
        module: "test",
        routes: ["/test"],
        menus: ["sidebar"],
        permissions: [],
        featureFlags: [],
        localizationKeys: [],
        breadcrumbConfig: [],
        seoConfig: {
          canonicalRoute: "/test",
          priority: 0.5,
          robotsVisibility: "index",
          sitemapVisibility: true,
        },
        metadata: {},
      });
      registry.unregister("test-entry");
      expect(registry.getEntry("test-entry")).toBeUndefined();
    });

    it("should throw on duplicate registration", () => {
      const registry = getNavigationRegistry();
      registry.register({
        id: "test-entry",
        module: "test",
        routes: ["/test"],
        menus: ["sidebar"],
        permissions: [],
        featureFlags: [],
        localizationKeys: [],
        breadcrumbConfig: [],
        seoConfig: {
          canonicalRoute: "/test",
          priority: 0.5,
          robotsVisibility: "index",
          sitemapVisibility: true,
        },
        metadata: {},
      });
      expect(() =>
        registry.register({
          id: "test-entry",
          module: "test",
          routes: ["/test2"],
          menus: ["sidebar"],
          permissions: [],
          featureFlags: [],
          localizationKeys: [],
          breadcrumbConfig: [],
          seoConfig: {
          canonicalRoute: "/test",
          priority: 0.5,
          robotsVisibility: "index",
          sitemapVisibility: true,
        },
          metadata: {},
        })
      ).toThrow();
    });
  });

  describe("MenuManagement", () => {
    it("should create a menu", () => {
      const menuManagement = getMenuManagement();
      const menu = menuManagement.createMenu({
        id: "main-menu",
        name: "Main Menu",
        position: "sidebar",
      });
      expect(menu.id).toBe("main-menu");
      expect(menu.name).toBe("Main Menu");
    });

    it("should add items to a menu", () => {
      const menuManagement = getMenuManagement();
      const menu = menuManagement.createMenu({
        id: "main-menu",
        name: "Main Menu",
        position: "sidebar",
      });
      const item: NavigationItem = {
        id: "item-1",
        module: "test",
        parentId: null,
        position: "sidebar",
        type: "page",
        title: "Item 1",
        route: "/item-1",
        order: 0,
        visible: true,
        visibility: "public",
        permissions: [],
        featureFlags: [],
        workspaces: [],
        organizations: [],
        localization: { namespace: "navigation", fallbackLocale: "en", translations: {} },
        seo: { canonicalRoute: "/item-1", priority: 0.5, robotsVisibility: "index", sitemapVisibility: true },
        breadcrumb: { type: "static", generateAutomatically: true },
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "test",
        updatedBy: "test",
      };
      const updatedMenu = menuManagement.addItemToMenu("main-menu", item);
      expect(updatedMenu).not.toBeNull();
      expect(updatedMenu!.items).toHaveLength(1);
    });

    it("should create and retrieve groups", () => {
      const menuManagement = getMenuManagement();
      menuManagement.createMenu({
        id: "main-menu",
        name: "Main Menu",
        position: "sidebar",
      });
      const group = menuManagement.createGroup({
        id: "group-1",
        menuId: "main-menu",
        name: "Group 1",
      });
      expect(group.id).toBe("group-1");
      expect(group.name).toBe("Group 1");
    });

    it("should set item visibility", () => {
      const menuManagement = getMenuManagement();
      const menu = menuManagement.createMenu({
        id: "main-menu",
        name: "Main Menu",
        position: "sidebar",
      });
      const item: NavigationItem = {
        id: "item-1",
        module: "test",
        parentId: null,
        position: "sidebar",
        type: "page",
        title: "Item 1",
        route: "/item-1",
        order: 0,
        visible: true,
        visibility: "public",
        permissions: [],
        featureFlags: [],
        workspaces: [],
        organizations: [],
        localization: { namespace: "navigation", fallbackLocale: "en", translations: {} },
        seo: { canonicalRoute: "/item-1", priority: 0.5, robotsVisibility: "index", sitemapVisibility: true },
        breadcrumb: { type: "static", generateAutomatically: true },
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "test",
        updatedBy: "test",
      };
      menuManagement.addItemToMenu("main-menu", item);
      menuManagement.setItemVisibility("main-menu", "item-1", false);
      const updatedMenu = menuManagement.getMenu("main-menu");
      expect(updatedMenu!.items[0].visible).toBe(false);
    });
  });

  describe("BreadcrumbRuntime", () => {
    it("should generate breadcrumbs for a route", () => {
      const breadcrumbRuntime = getBreadcrumbRuntime();
      breadcrumbRuntime.registerRouteMetadata({
        route: "/dashboard/settings",
        title: "Settings",
        description: "",
        canonical: "/dashboard/settings",
        priority: 0.5,
        robots: "index",
        sitemap: true,
        seo: {
          canonicalRoute: "/dashboard/settings",
          priority: 0.5,
          robotsVisibility: "index",
          sitemapVisibility: true,
        },
        breadcrumb: [],
        permissions: [],
        featureFlags: [],
        workspaces: [],
        organizations: [],
        localization: { namespace: "navigation", fallbackLocale: "en" },
        metadata: {},
      });
      const breadcrumbs = breadcrumbRuntime.generateBreadcrumbs("/dashboard/settings");
      expect(breadcrumbs.length).toBeGreaterThanOrEqual(1);
    });

    it("should support custom breadcrumbs", () => {
      const breadcrumbRuntime = getBreadcrumbRuntime();
      breadcrumbRuntime.setCustomBreadcrumbs("/custom", [
        { label: "Home", href: "/", current: false, order: 0 },
        { label: "Custom", href: "/custom", current: true, order: 1 },
      ]);
      const breadcrumbs = breadcrumbRuntime.generateBreadcrumbs("/custom");
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[1].label).toBe("Custom");
    });

    it("should update configuration", () => {
      const breadcrumbRuntime = getBreadcrumbRuntime();
      breadcrumbRuntime.updateConfig({ separator: " > ", maxDepth: 10 });
      const config = breadcrumbRuntime.getBreadcrumbConfig();
      expect(config.separator).toBe(" > ");
      expect(config.maxDepth).toBe(10);
    });
  });

  describe("PermissionAwareNavigation", () => {
    it("should check item access based on permissions", () => {
      const permissionNav = getPermissionNavigation();
      const item: NavigationItem = {
        id: "admin-item",
        module: "admin",
        parentId: null,
        position: "sidebar",
        type: "page",
        title: "Admin",
        route: "/admin",
        order: 0,
        visible: true,
        visibility: "public",
        permissions: ["admin"],
        featureFlags: [],
        workspaces: [],
        organizations: [],
        localization: { namespace: "navigation", fallbackLocale: "en", translations: {} },
        seo: { canonicalRoute: "/admin", priority: 0.5, robotsVisibility: "index", sitemapVisibility: true },
        breadcrumb: { type: "static", generateAutomatically: true },
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "test",
        updatedBy: "test",
      };
      expect(permissionNav.canAccessItem(item, { permissions: ["admin"] })).toBe(true);
      expect(permissionNav.canAccessItem(item, { permissions: ["editor"] })).toBe(false);
    });

    it("should filter items by permissions", () => {
      const permissionNav = getPermissionNavigation();
      const items: NavigationItem[] = [
        {
          id: "public",
          module: "test",
          parentId: null,
          position: "sidebar",
          type: "page",
          title: "Public",
          route: "/public",
          order: 0,
          visible: true,
          visibility: "public",
          permissions: [],
          featureFlags: [],
          workspaces: [],
          organizations: [],
          localization: { namespace: "navigation", fallbackLocale: "en", translations: {} },
          seo: { canonicalRoute: "/public", priority: 0.5, robotsVisibility: "index", sitemapVisibility: true },
          breadcrumb: { type: "static", generateAutomatically: true },
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "test",
          updatedBy: "test",
        },
        {
          id: "admin",
          module: "admin",
          parentId: null,
          position: "sidebar",
          type: "page",
          title: "Admin",
          route: "/admin",
          order: 0,
          visible: true,
          visibility: "public",
          permissions: ["admin"],
          featureFlags: [],
          workspaces: [],
          organizations: [],
          localization: { namespace: "navigation", fallbackLocale: "en", translations: {} },
          seo: { canonicalRoute: "/admin", priority: 0.5, robotsVisibility: "index", sitemapVisibility: true },
          breadcrumb: { type: "static", generateAutomatically: true },
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "test",
          updatedBy: "test",
        },
      ];
      const filtered = permissionNav.filterItemsByPermission(items, { permissions: ["admin"] });
      expect(filtered).toHaveLength(2);
    });

    it("should manage feature flags", () => {
      const permissionNav = getPermissionNavigation();
      permissionNav.setFeatureFlag("new-dashboard", true);
      expect(permissionNav.isFeatureFlagEnabled("new-dashboard")).toBe(true);
      expect(permissionNav.isFeatureFlagEnabled("nonexistent")).toBe(false);
    });
  });

  describe("NavigationCache", () => {
    it("should set and get registry entries", () => {
      const cache = getNavigationCache();
      cache.setRegistry("test-key", { value: "test" }, ["test"]);
      const result = cache.getRegistry<{ value: string }>("test-key");
      expect(result).toBeDefined();
      expect(result!.value).toBe("test");
    });

    it("should invalidate by tag", () => {
      const cache = getNavigationCache();
      cache.setRegistry("key-1", { value: "test1" }, ["tag-1"]);
      cache.setRegistry("key-2", { value: "test2" }, ["tag-2"]);
      cache.invalidateByTag("tag-1");
      const result = cache.getRegistry("key-1");
      expect(result).toBeUndefined();
    });

    it("should invalidate all", () => {
      const cache = getNavigationCache();
      cache.setRegistry("key-1", { value: "test1" });
      cache.setMenu("key-2", { value: "test2" });
      cache.invalidateAll();
      expect(cache.getRegistry("key-1")).toBeUndefined();
      expect(cache.getMenu("key-2")).toBeUndefined();
    });

    it("should return stats", () => {
      const cache = getNavigationCache();
      cache.setRegistry("key-1", { value: "test" });
      const stats = cache.getStats();
      expect(stats.totalSize).toBe(1);
      expect(stats.registrySize).toBe(1);
    });
  });

  describe("CMSNavigationIntegration", () => {
    it("should register a navigation item from CMS", () => {
      const cms = getCMSNavigationIntegration();
      const item: NavigationItem = {
        id: "cms-item",
        module: "cms",
        parentId: null,
        position: "sidebar",
        type: "page",
        title: "CMS Item",
        route: "/cms-item",
        order: 0,
        visible: true,
        visibility: "public",
        permissions: [],
        featureFlags: [],
        workspaces: [],
        organizations: [],
        localization: { namespace: "navigation", fallbackLocale: "en", translations: {} },
        seo: { canonicalRoute: "/cms-item", priority: 0.5, robotsVisibility: "index", sitemapVisibility: true },
        breadcrumb: { type: "static", generateAutomatically: true },
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "cms",
        updatedBy: "cms",
      };
      cms.registerNavigationItem(item);
      const retrieved = cms.getNavigationItem("cms-item");
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe("cms-item");
    });

    it("should sync from CMS registry", () => {
      const cms = getCMSNavigationIntegration();
      const registry = getNavigationRegistry();
      registry.register({
        id: "sync-entry",
        module: "sync-module",
        routes: ["/sync-route"],
        menus: ["sidebar"],
        permissions: [],
        featureFlags: [],
        localizationKeys: [],
        breadcrumbConfig: [],
        seoConfig: {
          canonicalRoute: "/test",
          priority: 0.5,
          robotsVisibility: "index",
          sitemapVisibility: true,
        },
        metadata: {},
      });
      cms.syncFromCMS();
      const metadata = cms.getRouteMetadata("/sync-route");
      expect(metadata).toBeDefined();
    });
  });

  describe("NavigationLocalizationIntegration", () => {
    it("should translate navigation items", () => {
      const localization = getNavigationLocalization();
      const item: NavigationItem = {
        id: "localized-item",
        module: "test",
        parentId: null,
        position: "sidebar",
        type: "page",
        title: "Default Title",
        titleKey: "navigation.test.title",
        route: "/test",
        order: 0,
        visible: true,
        visibility: "public",
        permissions: [],
        featureFlags: [],
        workspaces: [],
        organizations: [],
        localization: {
          namespace: "navigation",
          fallbackLocale: "en",
          translations: { en: "English Title", id: "Indonesian Title" },
        },
        seo: { canonicalRoute: "/test", priority: 0.5, robotsVisibility: "index", sitemapVisibility: true },
        breadcrumb: { type: "static", generateAutomatically: true },
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "test",
        updatedBy: "test",
      };
      const translated = localization.translateNavigationItem(item, "id");
      expect(translated.title).toBe("Indonesian Title");
    });

    it("should change locale", () => {
      const localization = getNavigationLocalization();
      localization.setLocale("id");
      expect(localization.getLocale()).toBe("id");
    });

    it("should change fallback locale", () => {
      const localization = getNavigationLocalization();
      localization.setFallbackLocale("id");
      expect(localization.getFallbackLocale()).toBe("id");
    });
  });

  describe("NavigationSEOIntegration", () => {
    it("should register SEO metadata", () => {
      const seo = getNavigationSEO();
      seo.registerSEOMetadata({
        route: "/test",
        canonicalRoute: "/test",
        priority: 0.8,
        robotsVisibility: "index",
        sitemapVisibility: true,
        changeFrequency: "weekly",
        lastModified: new Date().toISOString(),
      });
      const metadata = seo.getSEOMetadata("/test");
      expect(metadata).toBeDefined();
      expect(metadata!.priority).toBe(0.8);
    });

    it("should generate sitemap entries", () => {
      const seo = getNavigationSEO();
      seo.registerSEOMetadata({
        route: "/test",
        canonicalRoute: "/test",
        priority: 0.8,
        robotsVisibility: "index",
        sitemapVisibility: true,
        changeFrequency: "weekly",
        lastModified: new Date().toISOString(),
      });
      const entries = seo.generateSitemapEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].loc).toBe("/test");
    });

    it("should generate robots.txt", () => {
      const seo = getNavigationSEO();
      seo.registerSEOMetadata({
        route: "/admin",
        canonicalRoute: "/admin",
        priority: 0.3,
        robotsVisibility: "noindex",
        sitemapVisibility: false,
        changeFrequency: "monthly",
        lastModified: new Date().toISOString(),
      });
      const robotsTxt = seo.generateRobotsTxt();
      expect(robotsTxt).toContain("Disallow: /admin");
      expect(robotsTxt).toContain("Sitemap: /sitemap.xml");
    });

    it("should check sitemap visibility", () => {
      const seo = getNavigationSEO();
      seo.registerSEOMetadata({
        route: "/hidden",
        canonicalRoute: "/hidden",
        priority: 0.1,
        robotsVisibility: "noindex",
        sitemapVisibility: false,
        changeFrequency: "never",
        lastModified: new Date().toISOString(),
      });
      expect(seo.isSitemapVisible("/hidden")).toBe(false);
    });
  });

  describe("NavigationAPI", () => {
    it("should register navigation via API", () => {
      const api = getNavigationAPI();
      const result = api.registerNavigation({
        id: "api-item",
        module: "api-test",
        position: "sidebar",
        type: "page",
        title: "API Item",
        route: "/api-item",
        order: 0,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe("api-item");
    });

    it("should retrieve navigation items via API", () => {
      const api = getNavigationAPI();
      api.registerNavigation({
        id: "api-item-1",
        module: "api-test",
        position: "sidebar",
        type: "page",
        title: "API Item 1",
        route: "/api-item-1",
        order: 0,
      });
      const result = api.getNavigationItem("api-item-1");
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.id).toBe("api-item-1");
    });

    it("should return paginated items", () => {
      const api = getNavigationAPI();
      api.registerNavigation({
        id: "pag-item-1",
        module: "api-test",
        position: "sidebar",
        type: "page",
        title: "Pag Item 1",
        route: "/pag-item-1",
        order: 0,
      });
      api.registerNavigation({
        id: "pag-item-2",
        module: "api-test",
        position: "sidebar",
        type: "page",
        title: "Pag Item 2",
        route: "/pag-item-2",
        order: 0,
      });
      const result = api.getNavigationItems(undefined, { page: 1, limit: 1 });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.pagination?.total).toBe(2);
    });

    it("should handle breadcrumbs via API", () => {
      const api = getNavigationAPI();
      api.registerNavigation({
        id: "bc-item",
        module: "api-test",
        position: "sidebar",
        type: "page",
        title: "BC Item",
        route: "/bc-item",
        order: 0,
      });
      const result = api.getBreadcrumbs("/bc-item");
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should handle cache invalidation via API", () => {
      const api = getNavigationAPI();
      const result = api.invalidateCache();
      expect(result.success).toBe(true);
    });

    it("should return cache stats", () => {
      const api = getNavigationAPI();
      const result = api.getCacheStats();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});
export type NavigationItemType = "page" | "section" | "external" | "separator" | "group";
export type NavigationPosition = "header" | "sidebar" | "admin-sidebar" | "footer" | "dashboard" | "landing";
export type NavigationVisibility = "public" | "authenticated" | "admin";
export type BreadcrumbType = "static" | "dynamic" | "cms" | "auto";

export interface NavigationItem {
  id: string;
  module: string;
  parentId: string | null;
  position: NavigationPosition;
  type: NavigationItemType;
  title: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  route: string;
  icon?: string;
  iconComponent?: string;
  order: number;
  group?: string;
  badge?: string;
  badgeKey?: string;
  badgeColor?: string;
  external?: boolean;
  url?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  rel?: string;
  visible: boolean;
  visibility: NavigationVisibility;
  permissions: string[];
  featureFlags: string[];
  workspaces: string[];
  organizations: string[];
  localization: {
    namespace: string;
    fallbackLocale: string;
    translations: Record<string, string>;
  };
  seo: {
    canonicalRoute: string;
    priority: number;
    robotsVisibility: "index" | "nofollow" | "noindex" | "noindex,nofollow";
    sitemapVisibility: boolean;
  };
  breadcrumb: {
    type: BreadcrumbType;
    labelKey?: string;
    generateAutomatically: boolean;
  };
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface NavigationMenu {
  id: string;
  name: string;
  nameKey?: string;
  position: NavigationPosition;
  items: NavigationItem[];
  groups: NavigationGroup[];
  order: number;
  visible: boolean;
  localization: {
    namespace: string;
    fallbackLocale: string;
  };
  permissions: string[];
  featureFlags: string[];
  workspaces: string[];
  organizations: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationGroup {
  id: string;
  menuId: string;
  name: string;
  nameKey?: string;
  items: NavigationItem[];
  order: number;
  visible: boolean;
  permissions: string[];
  featureFlags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface BreadcrumbItem {
  label: string;
  labelKey?: string;
  href: string;
  current: boolean;
  order: number;
}

export interface BreadcrumbRuntimeConfig {
  separator: string;
  maxDepth: number;
  homeLabel: string;
  homeLabelKey: string;
  homeHref: string;
  generateAutomatically: boolean;
  includeCurrentPage: boolean;
  localize: boolean;
}

export interface RouteMetadata {
  route: string;
  title: string;
  titleKey?: string;
  description: string;
  descriptionKey?: string;
  canonical: string;
  priority: number;
  robots: string;
  sitemap: boolean;
  seo?: {
    canonicalRoute: string;
    priority: number;
    robotsVisibility: string;
    sitemapVisibility: boolean;
  };
  breadcrumb: BreadcrumbItem[];
  permissions: string[];
  featureFlags: string[];
  workspaces: string[];
  organizations: string[];
  localization: {
    namespace: string;
    fallbackLocale: string;
  };
  metadata: Record<string, unknown>;
}

export interface ActiveRouteInfo {
  route: string;
  pathname: string;
  params: Record<string, string>;
  query: Record<string, string>;
  breadcrumbs: BreadcrumbItem[];
  menuId: string | null;
  menuItem: NavigationItem | null;
  routeMetadata: RouteMetadata | null;
  permissions: string[];
  featureFlags: string[];
}

export interface NavigationRegistryEntry {
  id: string;
  module: string;
  routes: string[];
  menus: string[];
  permissions: string[];
  featureFlags: string[];
  localizationKeys: string[];
  breadcrumbConfig: BreadcrumbItem[];
  seoConfig: RouteMetadata["seo"];
  metadata: Record<string, unknown>;
}

export interface NavigationRegistry {
  register(entry: NavigationRegistryEntry): void;
  unregister(id: string): void;
  getEntry(id: string): NavigationRegistryEntry | undefined;
  getEntriesByModule(module: string): NavigationRegistryEntry[];
  getEntriesByRoute(route: string): NavigationRegistryEntry[];
  getEntriesByPosition(position: NavigationPosition): NavigationRegistryEntry[];
  getAllEntries(): NavigationRegistryEntry[];
  hasRoute(route: string): boolean;
  hasId(id: string): boolean;
}

export interface NavigationCacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
  createdAt: number;
}

export interface NavigationCacheConfig {
  registryTTL: number;
  menuTTL: number;
  routeTTL: number;
  breadcrumbTTL: number;
  maxSize: number;
  enableInvalidation: boolean;
}

export interface NavigationPermissionCheck {
  permission: string;
  role: string;
  workspace: string;
  organization: string;
  featureFlag: string;
  result: boolean;
}

export interface NavigationLocalizationEntry {
  key: string;
  namespace: string;
  locale: string;
  value: string;
  fallback: string;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationSEOMetadata {
  route: string;
  canonicalRoute: string;
  priority: number;
  robotsVisibility: "index" | "nofollow" | "noindex" | "noindex,nofollow";
  sitemapVisibility: boolean;
  changeFrequency: string;
  lastModified: string;
}

export interface NavigationAPIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  errorCode?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RegisterNavigationInput {
  id: string;
  module: string;
  position: NavigationPosition;
  type: NavigationItemType;
  title: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  route: string;
  parentId?: string | null;
  icon?: string;
  order?: number;
  group?: string;
  badge?: string;
  external?: boolean;
  url?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  rel?: string;
  permissions?: string[];
  featureFlags?: string[];
  workspaces?: string[];
  organizations?: string[];
  localization?: {
    namespace?: string;
    fallbackLocale?: string;
    translations?: Record<string, string>;
  };
  seo?: {
    canonicalRoute?: string;
    priority?: number;
    robotsVisibility?: "index" | "nofollow" | "noindex" | "noindex,nofollow";
    sitemapVisibility?: boolean;
  };
  breadcrumb?: {
    type?: BreadcrumbType;
    labelKey?: string;
    generateAutomatically?: boolean;
  };
  metadata?: Record<string, unknown>;
}
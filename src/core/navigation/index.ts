export { NavigationRuntime, getNavigationRuntime, resetNavigationRuntime } from "./navigation-runtime";
export { NavigationRegistryImpl, getNavigationRegistry, resetNavigationRegistry } from "./navigation.registry";
export { MenuManagement, getMenuManagement, resetMenuManagement } from "./menu-management";
export { BreadcrumbRuntime, getBreadcrumbRuntime, resetBreadcrumbRuntime } from "./breadcrumb-runtime";
export { PermissionAwareNavigation, getPermissionNavigation, resetPermissionNavigation } from "./permission-navigation";
export { NavigationCache, getNavigationCache, resetNavigationCache } from "./navigation-cache";
export { CMSNavigationIntegration, getCMSNavigationIntegration, resetCMSNavigationIntegration } from "./cms-navigation";
export { NavigationLocalizationIntegration, getNavigationLocalization, resetNavigationLocalization } from "./navigation-localization";
export { NavigationSEOIntegration, getNavigationSEO, resetNavigationSEO } from "./navigation-seo";
export { NavigationAPI, getNavigationAPI, resetNavigationAPI } from "./navigation-api";
export { bootstrapNavigation, resetBootstrap } from "./navigation-bootstrap";
export { resolveIcon, registerIcon } from "./navigation-icons";
export type {
  NavigationItem,
  NavigationMenu,
  NavigationGroup,
  BreadcrumbItem,
  BreadcrumbRuntimeConfig,
  ActiveRouteInfo,
  RouteMetadata,
  NavigationRegistryEntry,
  NavigationCacheConfig,
  NavigationPermissionCheck,
  NavigationLocalizationEntry,
  NavigationSEOMetadata,
  NavigationAPIResponse,
  RegisterNavigationInput,
  NavigationItemType,
  NavigationPosition,
  NavigationVisibility,
  BreadcrumbType,
} from "./navigation.types";
import type { BreadcrumbItem, BreadcrumbRuntimeConfig, RouteMetadata } from "./navigation.types";

export class BreadcrumbRuntime {
  private config: BreadcrumbRuntimeConfig;
  private routeMetadata: Map<string, RouteMetadata> = new Map();
  private customBreadcrumbs: Map<string, BreadcrumbItem[]> = new Map();

  constructor(config?: Partial<BreadcrumbRuntimeConfig>) {
    this.config = {
      separator: " / ",
      maxDepth: 5,
      homeLabel: "Home",
      homeLabelKey: "common.home",
      homeHref: "/",
      generateAutomatically: true,
      includeCurrentPage: true,
      localize: true,
      ...config,
    };
  }

  registerRouteMetadata(metadata: RouteMetadata): void {
    this.routeMetadata.set(metadata.route, metadata);
  }

  getRouteMetadata(route: string): RouteMetadata | undefined {
    return this.routeMetadata.get(route);
  }

  generateBreadcrumbs(route: string, locale?: string): BreadcrumbItem[] {
    const custom = this.customBreadcrumbs.get(route);
    if (custom) return custom;

    const metadata = this.routeMetadata.get(route);
    if (!metadata) {
      return this.generateDefaultBreadcrumbs(route);
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

  generateDefaultBreadcrumbs(route: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: this.config.homeLabel,
        labelKey: this.config.homeLabelKey,
        href: this.config.homeHref,
        current: false,
        order: 0,
      },
    ];

    const parts = route.split("/").filter(Boolean);
    let accumulatedPath = "";
    for (let i = 0; i < parts.length; i++) {
      accumulatedPath += `/${parts[i]}`;
      breadcrumbs.push({
        label: parts[i],
        href: accumulatedPath,
        current: i === parts.length - 1,
        order: i + 1,
      });
    }

    return breadcrumbs;
  }

  setCustomBreadcrumbs(route: string, items: BreadcrumbItem[]): void {
    this.customBreadcrumbs.set(route, items);
  }

  clearCustomBreadcrumbs(route: string): void {
    this.customBreadcrumbs.delete(route);
  }

  getBreadcrumbConfig(): BreadcrumbRuntimeConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<BreadcrumbRuntimeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getSeparator(): string {
    return this.config.separator;
  }

  getMaxDepth(): number {
    return this.config.maxDepth;
  }

  isAutoGenerate(): boolean {
    return this.config.generateAutomatically;
  }

  includeCurrentPage(): boolean {
    return this.config.includeCurrentPage;
  }

  shouldLocalize(): boolean {
    return this.config.localize;
  }
}

let breadcrumbRuntimeInstance: BreadcrumbRuntime | null = null;

export function getBreadcrumbRuntime(): BreadcrumbRuntime {
  if (!breadcrumbRuntimeInstance) {
    breadcrumbRuntimeInstance = new BreadcrumbRuntime();
  }
  return breadcrumbRuntimeInstance;
}

export function resetBreadcrumbRuntime(): void {
  breadcrumbRuntimeInstance = null;
}
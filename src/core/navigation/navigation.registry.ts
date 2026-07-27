import type {
  NavigationRegistryEntry,
  NavigationRegistry,
  NavigationPosition,
} from "./navigation.types";

class NavigationRegistryImpl implements NavigationRegistry {
  private entries: Map<string, NavigationRegistryEntry> = new Map();
  private routeIndex: Map<string, string[]> = new Map();
  private moduleIndex: Map<string, string[]> = new Map();
  private positionIndex: Map<NavigationPosition, string[]> = new Map();

  register(entry: NavigationRegistryEntry): void {
    if (this.entries.has(entry.id)) {
      throw new Error(`Navigation entry with id "${entry.id}" already exists`);
    }
    if (this.hasId(entry.id)) {
      throw new Error(`Navigation entry id "${entry.id}" is already registered`);
    }
    for (const route of entry.routes) {
      if (this.routeIndex.has(route)) {
        const existing = this.routeIndex.get(route)!;
        if (!existing.includes(entry.id)) {
          existing.push(entry.id);
        }
      } else {
        this.routeIndex.set(route, [entry.id]);
      }
    }
    this.moduleIndex.set(entry.module, [
      ...(this.moduleIndex.get(entry.module) || []),
      entry.id,
    ]);
    this.positionIndex.set(entry.module as NavigationPosition, [
      ...(this.positionIndex.get(entry.module as NavigationPosition) || []),
      entry.id,
    ]);
    this.entries.set(entry.id, entry);
  }

  unregister(id: string): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    for (const route of entry.routes) {
      const ids = this.routeIndex.get(route);
      if (ids) {
        const filtered = ids.filter((i) => i !== id);
        if (filtered.length === 0) {
          this.routeIndex.delete(route);
        } else {
          this.routeIndex.set(route, filtered);
        }
      }
    }
    const moduleIds = this.moduleIndex.get(entry.module);
    if (moduleIds) {
      const filtered = moduleIds.filter((i) => i !== id);
      if (filtered.length === 0) {
        this.moduleIndex.delete(entry.module);
      } else {
        this.moduleIndex.set(entry.module, filtered);
      }
    }
    this.entries.delete(id);
  }

  getEntry(id: string): NavigationRegistryEntry | undefined {
    return this.entries.get(id);
  }

  getEntriesByModule(module: string): NavigationRegistryEntry[] {
    const ids = this.moduleIndex.get(module) || [];
    return ids.map((id) => this.entries.get(id)).filter((e): e is NavigationRegistryEntry => e !== undefined);
  }

  getEntriesByRoute(route: string): NavigationRegistryEntry[] {
    const ids = this.routeIndex.get(route) || [];
    return ids.map((id) => this.entries.get(id)).filter((e): e is NavigationRegistryEntry => e !== undefined);
  }

  getEntriesByPosition(position: NavigationPosition): NavigationRegistryEntry[] {
    const ids = this.positionIndex.get(position) || [];
    return ids.map((id) => this.entries.get(id)).filter((e): e is NavigationRegistryEntry => e !== undefined);
  }

  getAllEntries(): NavigationRegistryEntry[] {
    return Array.from(this.entries.values());
  }

  hasRoute(route: string): boolean {
    return this.routeIndex.has(route);
  }

  hasId(id: string): boolean {
    return this.entries.has(id);
  }
}

let registryInstance: NavigationRegistryImpl | null = null;

export function getNavigationRegistry(): NavigationRegistryImpl {
  if (!registryInstance) {
    registryInstance = new NavigationRegistryImpl();
  }
  return registryInstance;
}

export function resetNavigationRegistry(): void {
  registryInstance = null;
}

export { NavigationRegistryImpl };
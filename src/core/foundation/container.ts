export type ServiceScope = "singleton" | "scoped" | "transient";

export interface ServiceDescriptor<T = unknown> {
  name: string;
  factory: () => T;
  scope: ServiceScope;
  dependencies?: string[];
  replaceable?: boolean;
}

export interface ContainerStats {
  totalServices: number;
  singletons: number;
  scoped: number;
  transient: number;
}

export class ApplicationContainer {
  private static instance: ApplicationContainer;
  private singletons = new Map<string, unknown>();
  private factories = new Map<string, ServiceDescriptor>();
  private scopedInstances = new Map<string, Map<string, unknown>>();
  private testOverrides = new Map<string, unknown>();
  private initialized = false;
  private currentScope = "default";

  private constructor() {}

  static getInstance(): ApplicationContainer {
    if (!ApplicationContainer.instance) {
      ApplicationContainer.instance = new ApplicationContainer();
    }
    return ApplicationContainer.instance;
  }

  register<T>(descriptor: ServiceDescriptor<T>): void {
    if (!descriptor.replaceable && this.factories.has(descriptor.name)) {
      throw new Error(`Service ${descriptor.name} is already registered and not replaceable`);
    }
    this.factories.set(descriptor.name, descriptor as ServiceDescriptor);
    if (descriptor.scope === "singleton") {
      this.singletons.delete(descriptor.name);
    }
  }

  registerSingleton<T>(name: string, factory: () => T, dependencies?: string[], replaceable = true): void {
    this.register({ name, factory, scope: "singleton", dependencies, replaceable });
  }

  registerScoped<T>(name: string, factory: () => T, dependencies?: string[], replaceable = true): void {
    this.register({ name, factory, scope: "scoped", dependencies, replaceable });
  }

  registerTransient<T>(name: string, factory: () => T, dependencies?: string[], replaceable = true): void {
    this.register({ name, factory, scope: "transient", dependencies, replaceable });
  }

  resolve<T>(name: string): T {
    if (this.testOverrides.has(name)) {
      return this.testOverrides.get(name) as T;
    }

    const descriptor = this.factories.get(name);
    if (!descriptor) {
      throw new Error(`Service ${name} not found. Register it before use.`);
    }

    if (descriptor.scope === "singleton") {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, descriptor.factory());
      }
      return this.singletons.get(name) as T;
    }

    if (descriptor.scope === "scoped") {
      const scopeMap = this.scopedInstances.get(this.currentScope);
      if (!scopeMap) {
        throw new Error(`Scope ${this.currentScope} not initialized`);
      }
      if (!scopeMap.has(name)) {
        scopeMap.set(name, descriptor.factory());
      }
      return scopeMap.get(name) as T;
    }

    return descriptor.factory() as T;
  }

  createScope(scopeId: string): void {
    this.scopedInstances.set(scopeId, new Map());
  }

  setCurrentScope(scopeId: string): void {
    this.currentScope = scopeId;
    this.createScope(scopeId);
  }

  clearScope(scopeId: string): void {
    this.scopedInstances.delete(scopeId);
  }

  has(name: string): boolean {
    return this.factories.has(name);
  }

  setTestOverride<T>(name: string, mock: T): void {
    if (!this.factories.has(name)) {
      throw new Error(`Cannot override ${name}: service not registered`);
    }
    this.testOverrides.set(name, mock);
  }

  clearTestOverrides(): void {
    this.testOverrides.clear();
  }

  getStats(): ContainerStats {
    let singletons = 0;
    let scoped = 0;
    let transient = 0;
    for (const descriptor of this.factories.values()) {
      if (descriptor.scope === "singleton") singletons++;
      else if (descriptor.scope === "scoped") scoped++;
      else transient++;
    }
    return { totalServices: this.factories.size, singletons, scoped, transient };
  }

  reset(): void {
    this.singletons.clear();
    this.factories.clear();
    this.scopedInstances.clear();
    this.testOverrides.clear();
    this.initialized = false;
    this.currentScope = "default";
  }
}

export const container = ApplicationContainer.getInstance();

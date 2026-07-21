export type ServiceRegistry = Record<string, unknown>;

export class ApplicationContainer {
  private static instance: ApplicationContainer;
  private services: ServiceRegistry = {};
  private initialized = false;

  private constructor() {}

  static getInstance(): ApplicationContainer {
    if (!ApplicationContainer.instance) {
      ApplicationContainer.instance = new ApplicationContainer();
    }
    return ApplicationContainer.instance;
  }

  register(name: string, service: unknown): void {
    if (this.services[name]) {
      throw new Error(`Service ${name} is already registered`);
    }
    this.services[name] = service;
  }

  resolve<T>(name: string): T {
    const service = this.services[name];
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service as T;
  }

  has(name: string): boolean {
    return name in this.services;
  }

  reset(): void {
    this.services = {};
    this.initialized = false;
  }
}

export const container = ApplicationContainer.getInstance();

import { container } from "./container";
import { lifecycle } from "./lifecycle";

export class ServiceRegistry {
  static register(name: string, factory: () => unknown): void {
    const instance = factory();
    container.register(name, instance);
  }

  static get<T>(name: string): T {
    return container.resolve<T>(name);
  }

  static has(name: string): boolean {
    return container.has(name);
  }
}

export function initializeServices(): void {
  ServiceRegistry.register("container", () => container);
  ServiceRegistry.register("lifecycle", () => lifecycle);
}

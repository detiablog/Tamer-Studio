import type { GatewayEvent, GatewayEventType } from "./types";

export type { GatewayEvent, GatewayEventType } from "./types";

export interface GatewayEventHandler {
  handle(event: GatewayEvent): void | Promise<void>;
}

export type GatewayEventListener = (event: GatewayEvent) => void | Promise<void>;

export class GatewayEventBus {
  private listeners: Map<GatewayEventType, Set<GatewayEventListener>> = new Map();
  private globalListeners: Set<GatewayEventListener> = new Set();

  subscribe(type: GatewayEventType, listener: GatewayEventListener): () => void {
    const set = this.listeners.get(type) ?? new Set();
    set.add(listener);
    this.listeners.set(type, set);

    return () => {
      const current = this.listeners.get(type);
      if (current) {
        current.delete(listener);
        if (current.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  subscribeAll(listener: GatewayEventListener): () => void {
    this.globalListeners.add(listener);

    return () => {
      this.globalListeners.delete(listener);
    };
  }

  emit(event: GatewayEvent): void {
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      for (const listener of typeListeners) {
        listener(event);
      }
    }

    for (const listener of this.globalListeners) {
      listener(event);
    }
  }

  clear(): void {
    this.listeners.clear();
    this.globalListeners.clear();
  }
}

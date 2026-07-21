import type { BillingEventBus, BillingEvent, BillingEventType, BillingEventHandler } from "../../types/billing";

export class InMemoryBillingEventBus implements BillingEventBus {
  private handlers: Map<BillingEventType, Set<BillingEventHandler>> = new Map();
  private history: BillingEvent[] = [];

  async emit(event: BillingEvent): Promise<void> {
    this.history.push(event);
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        await handler(event);
      }
    }
  }

  subscribe(type: BillingEventType, handler: BillingEventHandler): () => void {
    const existing = this.handlers.get(type) ?? new Set();
    existing.add(handler);
    this.handlers.set(type, existing);

    return () => {
      const current = this.handlers.get(type);
      if (current) {
        current.delete(handler);
        if (current.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  getHistory(): BillingEvent[] {
    return [...this.history];
  }
}

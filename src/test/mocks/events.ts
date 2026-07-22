import type { DomainEvent, ApplicationEvent } from '@/core/events/event';

export class MockEventPublisher {
  private domainEvents: DomainEvent[] = [];
  private applicationEvents: ApplicationEvent[] = [];

  async publishDomainEvent(
    type: string,
    payload: Record<string, unknown>,
    source: string,
    options?: Record<string, unknown>
  ): Promise<void> {
    const event: DomainEvent = {
      id: `evt_${Math.random().toString(36).slice(2, 9)}`,
      type: type as DomainEvent['type'],
      source: source as DomainEvent['source'],
      payload,
      timestamp: new Date(),
      ...options,
    };

    this.domainEvents.push(event);
  }

  async publishApplicationEvent(
    type: string,
    payload: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<void> {
    const event: ApplicationEvent = {
      id: `evt_${Math.random().toString(36).slice(2, 9)}`,
      type: type as ApplicationEvent['type'],
      source: 'notifications',
      payload,
      timestamp: new Date(),
      ...options,
    };

    this.applicationEvents.push(event);
  }

  getDomainEvents() {
    return this.domainEvents;
  }

  getApplicationEvents() {
    return this.applicationEvents;
  }

  clear() {
    this.domainEvents = [];
    this.applicationEvents = [];
  }
}

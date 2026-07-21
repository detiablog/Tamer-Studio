import type { AssetId, AssetLifecycleEvent, AssetLifecycleTransition } from "../types";

export interface LifecycleService {
  transition(assetId: AssetId, transition: AssetLifecycleTransition, metadata?: Record<string, unknown>): Promise<AssetLifecycleEvent | undefined>;
  getHistory(assetId: AssetId): Promise<AssetLifecycleEvent[]>;
  getNextTransitions(assetId: AssetId): Promise<AssetLifecycleTransition[]>;
}

export class InMemoryLifecycleService implements LifecycleService {
  private transitions: Record<string, Set<AssetLifecycleTransition>> = {
    draft: new Set(["process", "delete"]),
    processing: new Set(["complete", "fail"]),
    ready: new Set(["archive", "delete", "publish"]),
    archived: new Set(["restore", "delete"]),
    failed: new Set(["process", "delete"]),
    deleted: new Set(["restore"]),
  };

  private events: Map<string, AssetLifecycleEvent[]> = new Map();

  async transition(assetId: AssetId, transition: AssetLifecycleTransition, metadata?: Record<string, unknown>): Promise<AssetLifecycleEvent | undefined> {
    const events = this.events.get(assetId) ?? [];
    const lastEvent = events[events.length - 1];
    const from = lastEvent?.to ?? "draft";
    const allowed = this.transitions[from] ?? new Set();
    if (!allowed.has(transition)) {
      throw new Error(`Transition ${transition} not allowed from ${from}`);
    }

    const to = this.resolveStatus(transition, from);
    const event: AssetLifecycleEvent = {
      assetId,
      from,
      to,
      trigger: transition,
      metadata,
      timestamp: new Date().toISOString(),
    };

    events.push(event);
    this.events.set(assetId, events);

    return event;
  }

  async getHistory(assetId: AssetId): Promise<AssetLifecycleEvent[]> {
    return this.events.get(assetId) ?? [];
  }

  async getNextTransitions(assetId: AssetId): Promise<AssetLifecycleTransition[]> {
    const events = this.events.get(assetId) ?? [];
    const lastEvent = events[events.length - 1];
    const current = lastEvent?.to ?? "draft";
    return Array.from(this.transitions[current] ?? new Set());
  }

  private resolveStatus(transition: AssetLifecycleTransition, current: string): string {
    switch (transition) {
      case "create":
        return "draft";
      case "process":
        return "processing";
      case "complete":
        return "ready";
      case "archive":
        return "archived";
      case "delete":
        return "deleted";
      case "fail":
        return "failed";
      case "restore":
        return "draft";
      case "publish":
        return "ready";
      default:
        return current;
    }
  }
}

import { describe, it, expect, vi } from "vitest";
import { AsyncEventBus } from "@/core/events/async-event-bus";
import type { EventType } from "@/core/events/event";

describe("AsyncEventBus", () => {
  it("should process events with concurrency control", async () => {
    const bus = new AsyncEventBus({ concurrency: 1 });
    const handler = vi.fn().mockResolvedValue(undefined);

    bus.enqueue({
      id: "1",
      type: "user.created" as EventType,
      source: "identity",
      payload: { name: "alice" },
      timestamp: new Date(),
    }, handler);

    bus.start();
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("should limit concurrent executions", async () => {
    const bus = new AsyncEventBus({ concurrency: 2 });
    let active = 0;
    let maxActive = 0;
    const handler = async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((resolve) => setTimeout(resolve, 50));
      active--;
    };

    bus.enqueue({ id: "1", type: "a" as EventType, source: "test", payload: {}, timestamp: new Date() }, handler);
    bus.enqueue({ id: "2", type: "a" as EventType, source: "test", payload: {}, timestamp: new Date() }, handler);
    bus.enqueue({ id: "3", type: "a" as EventType, source: "test", payload: {}, timestamp: new Date() }, handler);

    bus.start();
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(maxActive).toBeLessThanOrEqual(2);
  });

  it("should stop processing", async () => {
    const bus = new AsyncEventBus({ concurrency: 1 });
    let handlerCalls = 0;
    const handler = async () => {
      handlerCalls++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    };

    bus.enqueue({ id: "1", type: "a" as EventType, source: "test", payload: {}, timestamp: new Date() }, handler);
    bus.enqueue({ id: "2", type: "a" as EventType, source: "test", payload: {}, timestamp: new Date() }, handler);

    bus.start();
    await new Promise((resolve) => setTimeout(resolve, 30));
    bus.stop();

    expect(handlerCalls).toBe(1);
  });
});
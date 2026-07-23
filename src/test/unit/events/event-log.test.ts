import { describe, it, expect } from "vitest";
import { EventLog } from "@/core/events/event-log";
import type { Event, EventType } from "@/core/events/event";

describe("EventLog", () => {
  it("should append and retrieve events", () => {
    const log = new EventLog();
    const event: Event = {
      id: "1",
      type: "user.created" as EventType,
      source: "identity",
      payload: {},
      timestamp: new Date(),
    };

    log.append(event);
    const history = log.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe("1");
  });

  it("should retrieve events since a timestamp", () => {
    const log = new EventLog();
    const event1: Event = {
      id: "1",
      type: "user.created" as EventType,
      source: "identity",
      payload: {},
      timestamp: new Date(),
    };
    const event2: Event = {
      id: "2",
      type: "user.updated" as EventType,
      source: "identity",
      payload: {},
      timestamp: new Date(),
    };

    log.append(event1);
    log.append(event2);
    const threshold = Date.now() - 1;
    const since = log.getHistorySince(threshold);
    expect(since.length).toBe(2);
  });

  it("should replay events to a handler", async () => {
    const log = new EventLog();
    const event1: Event = {
      id: "1",
      type: "user.created" as EventType,
      source: "identity",
      payload: { name: "alice" },
      timestamp: new Date(),
    };

    log.append(event1);
    const received: Record<string, unknown>[] = [];
    await log.replay((e) => { received.push(e.payload); });

    expect(received.length).toBe(1);
    expect(received[0]).toEqual({ name: "alice" });
  });

  it("should clear history", () => {
    const log = new EventLog();
    log.append({
      id: "1",
      type: "user.created" as EventType,
      source: "identity",
      payload: {},
      timestamp: new Date(),
    });

    log.clear();
    expect(log.getHistory().length).toBe(0);
  });
});
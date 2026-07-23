import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryTracer } from "@/core/observability/tracing";
import type { SpanEvent } from "@/core/observability/tracing";

describe("InMemoryTracer", () => {
  let testTracer: InMemoryTracer;

  beforeEach(() => {
    testTracer = new InMemoryTracer();
  });

  it("starts and ends a span", () => {
    const span = testTracer.startSpan("test-span", { key: "value" });
    expect(span.name).toBe("test-span");
    expect(span.status).toBe("ok");
    expect(span.attributes).toEqual({ key: "value" });
    expect(span.endTime).toBeUndefined();
    expect(span.durationMs).toBeUndefined();

    testTracer.endSpan(span);
    expect(span.endTime).toBeDefined();
    expect(typeof span.durationMs).toBe("number");
  });

  it("records events on a span", () => {
    const span = testTracer.startSpan("test-span");
    const event: SpanEvent = {
      name: "event-1",
      timestamp: new Date().toISOString(),
      attributes: { foo: "bar" },
    };

    testTracer.recordEvent(span, event);
    expect(span.events).toHaveLength(1);
    expect(span.events[0].name).toBe("event-1");
  });

  it("tracks multiple spans", () => {
    const span1 = testTracer.startSpan("span-1");
    const span2 = testTracer.startSpan("span-2");

    testTracer.endSpan(span1);
    testTracer.endSpan(span2);

    expect(testTracer.getSpans()).toHaveLength(2);
  });

  it("clears all spans", () => {
    testTracer.startSpan("span-1");
    testTracer.clear();
    expect(testTracer.getSpans()).toHaveLength(0);
  });

  it("generates unique trace ids", () => {
    const span1 = testTracer.startSpan("span-1");
    const span2 = testTracer.startSpan("span-2");
    expect(span1.traceId).not.toBe(span2.traceId);
  });
});

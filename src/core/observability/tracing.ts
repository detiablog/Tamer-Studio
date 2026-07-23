export interface Span {
  id: string;
  name: string;
  traceId: string;
  parentId?: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  status: "ok" | "error";
  attributes: Record<string, unknown>;
  events: SpanEvent[];
}

export interface SpanEvent {
  name: string;
  timestamp: string;
  attributes: Record<string, unknown>;
}

export interface Tracer {
  startSpan(name: string, attributes?: Record<string, unknown>): Span;
  recordEvent(span: Span, event: SpanEvent): void;
  endSpan(span: Span): void;
}

export class InMemoryTracer implements Tracer {
  private spans: Span[] = [];

  startSpan(name: string, attributes?: Record<string, unknown>): Span {
    const span: Span = {
      id: `span_${crypto.randomUUID()}`,
      name,
      traceId: `trace_${crypto.randomUUID()}`,
      startTime: new Date().toISOString(),
      status: "ok",
      attributes: attributes ?? {},
      events: [],
    };
    this.spans.push(span);
    return span;
  }

  recordEvent(span: Span, event: SpanEvent): void {
    span.events.push(event);
  }

  endSpan(span: Span): void {
    span.endTime = new Date().toISOString();
    const start = new Date(span.startTime).getTime();
    const end = new Date(span.endTime).getTime();
    span.durationMs = end - start;
  }

  getSpans(): Span[] {
    return [...this.spans];
  }

  clear(): void {
    this.spans = [];
  }
}

export const tracer = new InMemoryTracer();

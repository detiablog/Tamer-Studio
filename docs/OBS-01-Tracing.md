# OBS-01 Tracing

## Scope

This document defines the distributed tracing subsystem, including span creation, context propagation, trace visualization, and performance analysis.

## Architecture

The tracing subsystem implements:

1. **Distributed Traces** - End-to-end request paths across services, databases, and external APIs
2. **Spans** - Individual operations within a trace, with timing, status, and metadata
3. **Context Propagation** - W3C Trace Context headers for cross-service trace linking
4. **Trace Viewer** - Visual timeline of spans with drill-down into individual operations

### Span Attributes

| Attribute     | Type   | Description                        |
|-------------|--------|------------------------------------|
| service     | string | Service name                       |
| operation   | string | Operation or method name           |
| duration    | int    | Span duration in microseconds      |
| statusCode  | int    | HTTP or gRPC status code           |
| error       | bool   | Whether the span represents an error |
| traceId     | string | Unique trace identifier            |
| spanId      | string | Unique span identifier             |
| parentSpanId| string | Parent span identifier             |

### Sampling Strategies

- **Probabilistic** - Sample a fixed percentage of traces (default: 10%)
- **Rate Limiting** - Sample up to N traces per second
- **Adaptive** - Increase sampling for slow or errored traces
- **Always On** - Always sample traces with errors or status >= 500

## Configuration

```yaml
tracing:
  enabled: true
  exporter:
    protocol: "otlp"
    endpoint: "http://collector:4317"
  sampling:
    strategy: "adaptive"
    baseRate: 0.1
    errorRate: 1.0
    slowThresholdMs: 2000
  propagation:
    headers: ["traceparent", "tracestate", "x-correlation-id"]
  maxSpansPerTrace: 1000
```

## Commands

```bash
# List recent traces
pnpm obs:traces:list --limit=50

# Get trace by ID
pnpm obs:traces:get --traceId="abc-123"

# Find slow traces
pnpm obs:traces:slow --threshold=2000ms

# Export traces
pnpm obs:traces:export --format=jaeger --since="1h"
```

## Verification

- Traces propagate across all service boundaries
- Span timing is accurate within 1 millisecond
- Slow traces are identified by the adaptive sampler
- Context propagation headers are present in all cross-service calls
- Trace Viewer renders spans with correct parent-child relationships

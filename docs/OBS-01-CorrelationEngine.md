# OBS-01 Correlation Engine

## Scope

This document describes the Correlation Engine that links metrics, logs, and traces through shared identifiers, enabling unified investigation of production issues.

## Architecture

The Correlation Engine provides:

1. **ID Propagation** - Correlation ID, trace ID, and request ID flow through all service calls
2. **Cross-Signal Linking** - Query logs by trace ID, traces by error, metrics by service
3. **Unified Timeline** - Present correlated telemetry in a single chronological view
4. **Service Dependency Mapping** - Automatically discover service relationships from trace data

### Correlation Flow

```
Request Entry
  --> Generate Correlation ID (UUID v4)
  --> Inject into headers (x-correlation-id)
  --> Each service logs with correlationId
  --> Each span includes correlationId as attribute
  --> Correlation Engine indexes by correlationId
  --> Query returns all related telemetry
```

### Supported Correlations

| From       | To       | Method                                    |
|-----------|----------|-------------------------------------------|
| Correlation ID | Logs, Traces | Header propagation               |
| Trace ID  | Spans    | Parent-child span relationships           |
| Service   | Metrics  | Service name tag on all metrics           |
| Error     | Trace    | Error flag on spans                       |
| Endpoint  | Latency  | Operation name on spans and histograms    |

## Configuration

```yaml
correlation:
  enabled: true
  propagationHeaders:
    - "x-correlation-id"
    - "x-request-id"
    - "traceparent"
  storage:
    type: "indexed"
    ttlDays: 90
  rules:
    - name: "error-to-trace"
      condition: "span.statusCode >= 400"
      action: "link_error_to_trace"
    - name: "slow-request"
      condition: "span.duration > 2000"
      action: "flag_slow_request"
```

## Commands

```bash
# Query by correlation ID
pnpm obs:correlation:get --id="abc-123"

# View service dependencies
pnpm obs:correlation:dependencies

# Rebuild correlation index
pnpm obs:correlation:reindex

# Export correlation report
pnpm obs:correlation:report --period="7d"
```

## Verification

- Correlation ID is present in all log entries and spans
- Querying by correlation ID returns all related telemetry
- Service dependency map reflects actual call patterns
- Cross-signal queries complete within 3 seconds
- Rebuild index operation completes without data loss

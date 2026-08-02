# OBS-01 Architecture

## Scope

This document describes the overall architecture of the Tamer Studio Observability Platform, including its core components, data flow, and integration points within the production system.

## Architecture

The Observability Platform follows a layered architecture:

1. **Data Collection Layer** - Agents and SDKs embedded in services that collect metrics, logs, and traces
2. **Ingestion Layer** - Receives telemetry data via gRPC and HTTP endpoints with built-in validation
3. **Storage Layer** - Time-series database for metrics, document store for logs, and distributed trace storage
4. **Processing Layer** - Correlation engine that links metrics, logs, and traces via correlation IDs
5. **Presentation Layer** - Dashboards, alerting rules, and report generators

### Component Diagram

```
[Services] --> [OTel Collectors] --> [Ingestion API] --> [Storage]
                                                    --> [Correlation Engine]
[Dashboards] <-- [Query Engine] <-- [Storage]
[Alerting]   <-- [Rule Engine]  <-- [Storage]
[Reports]    <-- [Aggregator]   <-- [Storage]
```

### Key Design Decisions

- OpenTelemetry-compatible instrumentation for vendor-neutral telemetry
- Correlation ID propagation across all service boundaries
- Configurable sampling rates per service and endpoint
- Retention policies enforced at the storage layer

## Configuration

```yaml
observability:
  enabled: true
  endpoint: "http://localhost:4317"
  samplingRate: 0.1
  metrics:
    enabled: true
    exportInterval: 30s
  logs:
    enabled: true
    maxLogSize: 64KB
    retentionDays: 30
  tracing:
    enabled: true
    maxSpansPerTrace: 1000
  correlation:
    enabled: true
    propagateHeaders: ["x-correlation-id", "x-request-id"]
```

## Commands

```bash
# Start the observability collector
pnpm obs:collector:start

# Verify collector health
pnpm obs:collector:health

# Run observability migration
pnpm obs:db:migrate
```

## Verification

- Collector health endpoint returns 200 OK
- Metrics appear in the dashboard within 30 seconds of generation
- Traces propagate correlation IDs across service calls
- Logs are queryable within 5 seconds of ingestion
- Alerts fire within the configured evaluation window

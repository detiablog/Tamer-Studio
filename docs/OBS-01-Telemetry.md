# OBS-01 Telemetry

## Scope

This document covers the telemetry pipeline responsible for collecting, processing, and routing observability data from all Tamer Studio services to the storage backend.

## Architecture

The telemetry pipeline consists of:

1. **Instrumentation SDKs** - Embedded in each service, auto-instrumenting HTTP, gRPC, database, and queue operations
2. **OTel Collector Agents** - Deployed as sidecars or standalone processes, handling batching, retry, and export
3. **Protocol Adapters** - Convert vendor-specific formats to the unified observability schema
4. **Backpressure Mechanism** - Drop policies and queue limits prevent telemetry from overwhelming downstream systems

### Data Flow

```
Service Code
  --> SDK (auto-instrument + manual spans)
    --> OTel Collector (batch, sample, filter)
      --> Exporter (gRPC/HTTP to ingestion endpoint)
        --> Validation & Deduplication
          --> Storage (metrics | logs | traces)
```

### Supported Instrumentation

| Signal     | Protocol         | Format     |
|-----------|------------------|------------|
| Metrics   | OTLP gRPC/HTTP   | Protobuf   |
| Logs      | OTLP gRPC/HTTP   | JSON       |
| Traces    | OTLP gRPC/HTTP   | Protobuf   |
| Events    | Custom HTTP      | JSON       |

## Configuration

```yaml
telemetry:
  exporter:
    protocol: "otlp"
    endpoint: "http://collector:4317"
    timeout: 10s
    retryDelay: 5s
  batch:
    maxSize: 8192
    timeout: 5s
  sampling:
    strategy: "probabilistic"
    rate: 0.1
    rules:
      - path: "/api/health"
        rate: 0.0
      - path: "/api/ai/*"
        rate: 0.5
```

## Commands

```bash
# Start telemetry pipeline
pnpm obs:telemetry:start

# Check pipeline status
pnpm obs:telemetry:status

# Flush pending telemetry
pnpm obs:telemetry:flush

# Dry-run sampling rules
pnpm obs:telemetry:dry-run
```

## Verification

- All services emit telemetry within 1 second of operation
- Collector batching groups at least 100 spans before export
- Sampling rules are applied correctly (verified via dry-run)
- Backpressure drops telemetry gracefully under load
- Retry logic retransmits failed exports within 30 seconds

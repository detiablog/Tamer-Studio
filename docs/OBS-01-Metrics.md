# OBS-01 Metrics

## Scope

This document defines the metrics subsystem of the Observability Platform, including metric types, collection intervals, aggregation strategies, and dashboard integration.

## Architecture

The metrics subsystem handles:

1. **Counter Metrics** - Monotonically increasing values (requests served, errors emitted)
2. **Gauge Metrics** - Point-in-time values (memory usage, queue depth, active connections)
3. **Histogram Metrics** - Distribution of values (request duration, payload size)
4. **Summary Metrics** - Pre-computed quantiles (p50, p95, p99 latency)

### Storage

- Time-series database (InfluxDB-compatible) with configurable resolution
- Downsampling at 1-minute, 5-minute, and 1-hour intervals
- Automatic aggregation for historical queries

### Metric Categories

| Category    | Metrics                                         |
|-----------|--------------------------------------------------|
| System     | CPU, memory, disk, network                       |
| Application| Request rate, error rate, response time          |
| Business   | Generations, credits consumed, active users      |
| AI Runtime | Provider latency, model throughput, failure rate |

## Configuration

```yaml
metrics:
  collection:
    interval: 15s
    exporters:
      - type: "prometheus"
        port: 9090
      - type: "otlp"
        endpoint: "http://collector:4317"
  retention:
    raw: 7d
    downsampled_5m: 30d
    downsampled_1h: 365d
  aggregation:
    defaultWindow: "5m"
    quantiles: [0.5, 0.9, 0.95, 0.99]
```

## Commands

```bash
# List all registered metrics
pnpm obs:metrics:list

# Query specific metric
pnpm obs:metrics:query --name="http_requests_total" --window="1h"

# Force metric flush
pnpm obs:metrics:flush

# Generate metric report
pnpm obs:metrics:report --period="24h"
```

## Verification

- Metrics appear within 15 seconds of generation
- Downsampled metrics retain accuracy within 1% of raw values
- Histogram buckets cover the expected value range
- Prometheus endpoint exposes all registered metrics
- Metric queries return within 500ms for 24-hour windows

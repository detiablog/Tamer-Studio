# OBS-01 Performance

## Scope

This document covers the performance monitoring subsystem, including response time analysis, throughput tracking, resource utilization, and performance regression detection.

## Architecture

The performance subsystem tracks:

1. **Response Time** - P50, P90, P95, P99 latency for all endpoints
2. **Throughput** - Requests per second per service and endpoint
3. **Resource Utilization** - CPU, memory, disk I/O, and network bandwidth
4. **Performance Regressions** - Automated detection of latency increases and throughput drops

### Performance Score

The platform calculates a composite performance score (0-100) based on:

- Response time percentiles (40% weight)
- Error rate (30% weight)
- Resource utilization (20% weight)
- Throughput stability (10% weight)

### Regression Detection

- Baseline comparison using rolling 7-day averages
- Configurable thresholds for latency and error rate changes
- Automatic alerting when performance degrades beyond threshold
- Historical trend analysis for capacity planning

## Configuration

```yaml
performance:
  enabled: true
  sampling:
    slowRequestThresholdMs: 2000
    verySlowRequestThresholdMs: 5000
  regression:
    enabled: true
    latencyThresholdPercent: 20
    errorRateThresholdPercent: 50
    evaluationWindow: "1h"
    baselineWindow: "7d"
  dashboards:
    autoRefreshInterval: 30s
    defaultTimeRange: "1h"
```

## Commands

```bash
# View performance summary
pnpm obs:performance:summary

# Check for regressions
pnpm obs:performance:regressions

# Generate performance report
pnpm obs:performance:report --period="7d"

# View endpoint performance
pnpm obs:performance:endpoints --sort=latency
```

## Verification

- Performance score updates within 15 seconds of metric collection
- Regression detection triggers within 5 minutes of threshold breach
- Dashboard auto-refreshes at configured intervals
- Performance reports include all tracked endpoints
- Resource utilization metrics are accurate within 5% of actual values

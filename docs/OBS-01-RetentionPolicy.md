# OBS-01 Retention Policy

## Scope

This document defines the data retention policies for all observability data types, including storage optimization, archival strategies, and compliance requirements.

## Architecture

The retention subsystem manages:

1. **Automatic Expiration** - Data is purged after configured retention periods
2. **Downsampling** - High-resolution data is aggregated to reduce storage
3. **Archival** - Historical data is moved to cold storage for compliance
4. **Storage Optimization** - Compression and deduplication reduce storage costs

### Retention Periods

| Data Type  | Hot Storage | Warm Storage | Cold Storage | Archive  |
|-----------|-------------|-------------|-------------|----------|
| Metrics   | 7 days      | 30 days     | 90 days     | 1 year   |
| Logs      | 7 days      | 30 days     | 90 days     | 2 years  |
| Traces    | 3 days      | 14 days     | 30 days     | 90 days  |
| Alerts    | 90 days     | 365 days    | -           | -        |
| Reports   | 30 days     | 90 days     | 365 days    | -        |

### Downsampling Rules

| Resolution | Source     | Target    | Window  |
|-----------|------------|-----------|---------|
| Raw       | 15s metrics| 1m aggregate| 7 days |
| 5-minute  | 1m metrics | 5m aggregate| 30 days|
| 1-hour    | 5m metrics | 1h aggregate| 90 days|

## Configuration

```yaml
retention:
  enabled: true
  evaluationInterval: "1h"
  policies:
    metrics:
      hot: 7d
      warm: 30d
      cold: 90d
      archive: 365d
    logs:
      hot: 7d
      warm: 30d
      cold: 90d
      archive: 730d
    traces:
      hot: 3d
      warm: 14d
      cold: 30d
      archive: 90d
  downsampling:
    enabled: true
    rules:
      - source: "raw"
        target: "1m"
        after: "7d"
      - source: "1m"
        target: "5m"
        after: "30d"
      - source: "5m"
        target: "1h"
        after: "90d"
  archival:
    enabled: true
    provider: "s3"
    bucket: "tamer-observability-archive"
    compression: "zstd"
```

## Commands

```bash
# View retention status
pnpm obs:retention:status

# Manually trigger downsampling
pnpm obs:retention:downsample --type=metrics

# Check storage usage
pnpm obs:retention:storage

# Purge expired data
pnpm obs:retention:purge --dry-run
```

## Verification

- Expired data is purged within 1 hour of expiration
- Downsampled data retains accuracy within 1% of raw values
- Archival jobs complete within the configured window
- Storage usage reports are accurate within 5%
- Purge operations do not affect hot or warm data

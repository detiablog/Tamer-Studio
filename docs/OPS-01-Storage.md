# OPS-01: Storage Dashboard

## Scope

This document describes the storage monitoring subsystem within the Operations Center, covering storage usage, provider health, and cleanup management.

## Architecture

### Storage Providers

| Provider | Usage | Health Check |
|---|---|---|
| S3 Compatible | Primary file storage | HEAD request to bucket |
| Local Storage | Development fallback | Filesystem stat |
| CDN | Static asset delivery | HTTP HEAD to edge |

### Storage Metrics

- **Total Storage Used**: Aggregate storage consumed across all providers.
- **Total Files**: Number of files stored.
- **Bandwidth (30d)**: Total bandwidth consumed in the last 30 days.
- **Requests (30d)**: Total API requests to storage in the last 30 days.
- **Growth Trend**: Storage growth rate over time.

### Per-User Storage

- **Default Quota**: Default storage quota per user (configurable in GB).
- **Storage Used**: Current storage consumption per user.
- **File Count**: Number of files per user.
- **Quota Utilization**: Percentage of quota used per user.

### Cleanup Management

- **Expired Files**: Files that have exceeded their retention period.
- **Orphaned Files**: Files not associated with any entity.
- **Cleanup Runs**: History of cleanup job executions.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `STORAGE_CHECK_INTERVAL` | `60000` | Storage health check interval (ms) |
| `DEFAULT_USER_QUOTA_GB` | `10` | Default per-user storage quota (GB) |
| `STORAGE_WARNING_THRESHOLD` | `80` | Storage usage warning threshold (%) |
| `STORAGE_CRITICAL_THRESHOLD` | `90` | Storage usage critical threshold (%) |
| `CLEANUP_RETENTION_DAYS` | `90` | Days before expired files are cleaned |
| `STORAGE_REGION` | `ap-southeast-1` | Primary storage region |

## Commands

```bash
# View storage summary
pnpm ops:storage-summary

# View per-user storage usage
pnpm ops:storage-users

# Run cleanup job
pnpm ops:storage-cleanup

# View cleanup history
pnpm ops:storage-cleanup-history

# Check storage provider health
pnpm ops:storage-health

# Set user quota
pnpm ops:storage-quota --user <user-id> --quota 20GB
```

## Verification

- Storage usage metrics are accurate and updated in real-time.
- Per-user storage breakdown is available for all users.
- Expired and orphaned files are correctly identified.
- Cleanup jobs execute and remove eligible files.
- Storage provider health is monitored and reported.
- Quota enforcement prevents users from exceeding their storage limit.

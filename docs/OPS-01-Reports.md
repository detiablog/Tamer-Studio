# OPS-01: Operational Reports

## Scope

This document describes the operational reports subsystem, covering report generation, scheduling, export, and report types within the Operations Center.

## Architecture

### Report Types

| Report | Content | Default Period |
|---|---|---|
| health | System health summary with uptime and status | Daily |
| alerts | Alert summary with counts by severity | Daily |
| incidents | Incident summary with resolution times | Weekly |
| deployments | Deployment history and rollback events | Weekly |
| audit | Audit log summary by action and user | Monthly |
| performance | Performance metrics with trends | Weekly |
| billing | Revenue and payment status summary | Monthly |
| storage | Storage usage and growth trends | Monthly |

### Report Generation

Reports are generated through:

1. **Scheduled Reports**: Generated automatically based on configured cron schedules.
2. **On-Demand Reports**: Generated manually from the Operations Center UI.
3. **API Reports**: Generated via the REST API for programmatic access.

### Report Output

Reports are generated in the following formats:

- **JSON**: Structured data for programmatic consumption.
- **CSV**: Tabular data for spreadsheet analysis.
- **PDF**: Formatted report for sharing and archival (future).

### Report Storage

Generated reports are stored with:

- **Report Type**: Category of the report.
- **Period**: Time range covered by the report.
- **Generated At**: Timestamp of report generation.
- **Format**: Output format (json, csv).
- **File Size**: Size of the generated report file.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `REPORT_SCHEDULE_CRON` | `0 0 * * *` | Daily report generation cron |
| `REPORT_RETENTION_DAYS` | `90` | Days to retain generated reports |
| `REPORT_MAX_SIZE_MB` | `50` | Maximum report file size (MB) |
| `REPORT_EXPORT_FORMAT` | `json` | Default export format |

## Commands

```bash
# Generate a health report
pnpm ops:report --type health --period 7d

# Generate an alert report
pnpm ops:report --type alerts --period 30d

# Generate an audit report
pnpm ops:report --type audit --period 30d

# List generated reports
pnpm ops:reports --type health

# Download a report
pnpm ops:report-download --id <report-id>

# Export report as CSV
pnpm ops:report-export --id <report-id> --format csv
```

## Verification

- Scheduled reports are generated at the configured intervals.
- On-demand reports complete within 30 seconds for standard periods.
- Reports contain accurate data for the specified period.
- Reports can be downloaded in JSON and CSV formats.
- Report retention policy is enforced correctly.
- Report metadata (type, period, generated_at) is accurate.

# OBS-01 Dashboards

## Scope

This document covers the dashboard subsystem, including dashboard creation, widget configuration, data visualization, and sharing capabilities.

## Architecture

The dashboard subsystem provides:

1. **Dashboard Builder** - Drag-and-drop interface for creating custom dashboards
2. **Widget Library** - Pre-built widgets for metrics, logs, traces, and alerts
3. **Template System** - Reusable dashboard templates for common monitoring scenarios
4. **Sharing and Permissions** - Role-based access control for dashboard visibility

### Widget Types

| Widget        | Data Source  | Visualization       |
|--------------|-------------|---------------------|
| Time Series  | Metrics     | Line chart          |
| Gauge        | Metrics     | Single value gauge  |
| Table        | Logs/Traces | Sortable table      |
| Heatmap      | Metrics     | Color-coded grid    |
| Top List     | Metrics     | Ranked list         |
| Log Stream   | Logs        | Live log feed       |
| Trace List   | Traces      | Span timeline       |
| Alert List   | Alerts      | Active alerts table |

### Default Dashboards

- **System Overview** - High-level health of all services
- **AI Runtime** - Provider latency, throughput, and error rates
- **Production Pipeline** - Job queue depth, processing time, success rate
- **API Performance** - Endpoint response times and error rates

## Configuration

```yaml
dashboards:
  enabled: true
  autoRefreshInterval: 30s
  defaultTimeRange: "1h"
  templates:
    - name: "system-overview"
      description: "System health overview"
      widgets: 12
    - name: "ai-runtime"
      description: "AI provider performance"
      widgets: 8
  permissions:
    default: "read"
    admin: "write"
    owner: "admin"
```

## Commands

```bash
# List dashboards
pnpm obs:dashboards:list

# Create dashboard
pnpm obs:dashboards:create --name="Custom View"

# Clone dashboard
pnpm obs:dashboards:clone --id="dash-123"

# Export dashboard
pnpm obs:dashboards:export --id="dash-123" --format=json
```

## Verification

- Dashboards load within 3 seconds
- Widgets refresh at configured intervals
- Time range selection updates all widgets simultaneously
- Dashboard sharing respects permission levels
- Export produces valid JSON configuration

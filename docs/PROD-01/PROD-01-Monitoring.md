# PROD-01: Monitoring

**Document ID:** PROD-01-Monitoring  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the monitoring setup for Tamer Studio, including health checks, metrics collection, logging, alerting, and observability.

---

## Health Checks

### Endpoint Overview

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/health` | Application health | GET |
| `/api/health` | API health | GET |
| `/api/health/database` | Database connectivity | GET |
| `/api/health/runtime` | Runtime metrics | GET |

### Health Check Implementation

```typescript
// src/core/observability/health.ts

export interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  details?: Record<string, unknown>;
  checkedAt: string;
}

export class InMemoryHealthDashboard implements HealthDashboard {
  registerCheck(name: string, check: () => Promise<HealthCheck>): void;
  async runChecks(): Promise<HealthCheck[]>;
  getSummary(): { healthy: number; degraded: number; unhealthy: number; lastChecked: string };
}
```

### Health Check Response

```json
{
  "status": "healthy",
  "checks": [
    { "name": "database", "status": "healthy", "latencyMs": 5 },
    { "name": "redis", "status": "healthy", "latencyMs": 2 },
    { "name": "storage", "status": "healthy", "latencyMs": 10 }
  ],
  "summary": { "healthy": 3, "degraded": 0, "unhealthy": 0 },
  "timestamp": "2026-08-02T14:00:00Z"
}
```

### Docker Health Check

```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 10s
```

---

## Metrics Collection

### System Metrics

```typescript
// src/core/observability/metrics.ts

export interface SystemMetrics {
  activeUsers: number;
  apiRequestCount: number;
  authSuccessCount: number;
  authFailureCount: number;
  avgApiLatencyMs: number;
  lastUpdated: string;
}
```

### Metric Types

| Type | Description | Example |
|------|-------------|---------|
| Counter | Incrementing value | API requests, auth attempts |
| Histogram | Distribution of values | Request latency |
| Gauge | Current value | Active users, queue depth |

### Monitoring Engine

```typescript
// src/core/monitoring/monitoring-engine.ts

export class MonitoringEngine {
  async checkHealth(serviceName: string, serviceType: string): Promise<{
    status: ServiceStatus;
    latencyMs?: number;
    error?: string;
  }>

  async recordMetric(metricName: string, category: string, value: string): Promise<void>
  async getMetrics(metricName: string, startDate: Date, endDate: Date): Promise<SystemMetric[]>
  async getMetricSummary(startDate: Date, endDate: Date): Promise<MetricSummary[]>

  async createAlert(data: AlertInput): Promise<SystemAlert>
  async getAlerts(filters?: AlertFilters): Promise<SystemAlert[]>

  async createIncident(data: IncidentInput): Promise<SystemIncident>
  async updateIncident(id: string, data: Record<string, unknown>): Promise<SystemIncident>

  async runFullHealthCheck(): Promise<HealthSummary>
  async getOverviewStats(): Promise<OverviewStats>
}
```

### Tracked Services

| Service | Type | Check Method |
|---------|------|--------------|
| database | database | `SELECT 1` |
| ai-runtime | ai | Provider ping |
| storage | storage | Provider health |
| email | email | SMTP check |
| payment | payment | Provider health |
| queue | queue | Redis ping |

---

## Logging

### Log Levels

| Level | Usage |
|-------|-------|
| `error` | System errors, failures |
| `warn` | Degraded performance, warnings |
| `info` | Normal operations, events |
| `debug` | Debug information |

### Configuration

```bash
LOG_LEVEL=info
AUDIT_LOG_ENABLED=true
```

### Structured Logging

```json
{
  "timestamp": "2026-08-02T14:00:00Z",
  "level": "info",
  "message": "Request processed",
  "method": "POST",
  "path": "/api/auth/login",
  "statusCode": 200,
  "duration": 150,
  "userId": "user_123"
}
```

### Log Sources

| Source | Location | Purpose |
|--------|----------|---------|
| Application | stdout/stderr | General logs |
| Nginx | `/var/log/nginx/` | Access/error logs |
| PostgreSQL | Docker logs | Database logs |
| Redis | Docker logs | Cache logs |

---

## Alerting

### Alert Configuration

```typescript
interface Alert {
  name: string;
  type: string;
  severity: "minor" | "major" | "critical";
  condition: Record<string, unknown>;
  serviceName?: string;
  isActive: boolean;
  triggerCount: number;
  lastTriggeredAt?: Date;
}
```

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 75% | > 90% |
| Disk Usage | > 70% | > 85% |
| DB Connections | > 80 | > 95 |
| Response Time | > 500ms | > 2000ms |
| Error Rate | > 5% | > 20% |

### Alert Channels

| Channel | Use Case |
|---------|----------|
| Email | Non-urgent alerts |
| Slack | Real-time notifications |
| PagerDuty | Critical incidents |
| Status Page | User-facing incidents |

---

## Incident Management

### Incident Severity

| Severity | Description | Response Time |
|----------|-------------|---------------|
| minor | Minor issue, no user impact | 2 hours |
| major | Significant impact | 30 minutes |
| critical | Complete outage | 15 minutes |

### Incident Status

| Status | Description |
|--------|-------------|
| open | Incident created |
| investigating | Team investigating |
| identified | Root cause identified |
| monitoring | Fix implemented, monitoring |
| resolved | Issue resolved |
| closed | Incident closed |

---

## Commands

### Health Checks

```bash
# Application health
curl http://localhost/health

# API health
curl http://localhost/api/health

# Database health
curl http://localhost/api/health/database

# Runtime health
curl http://localhost/api/health/runtime
```

### View Metrics

```bash
# Docker stats
docker stats

# Container logs
docker compose logs --tail=100 app

# System metrics
curl http://localhost/api/health/runtime
```

### Monitoring Dashboard

```bash
# Access monitoring API
curl http://localhost/api/monitoring/health
curl http://localhost/api/monitoring/stats
curl http://localhost/api/monitoring/alerts
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| Health endpoint | `curl http://localhost/health` | HTTP 200 |
| Database health | `curl http://localhost/api/health/database` | HTTP 200 |
| Runtime health | `curl http://localhost/api/health/runtime` | HTTP 200 |
| Metrics recorded | Check monitoring database | Metrics present |
| Alerts configured | Check alert rules | Rules active |
| Logs flowing | `docker compose logs --tail=10 app` | Logs present |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Health check fails | Check service dependencies | Verify DB, Redis, storage connectivity |
| Metrics not recorded | Check monitoring engine | Verify database connection |
| Alerts not firing | Check alert configuration | Verify thresholds, channels |
| Logs missing | Check log level, output | Verify LOG_LEVEL, container logs |
| High latency | Check metrics, identify bottleneck | Optimize queries, scale resources |

# GA-01 Operations Runbook

## Scope

This document provides operational runbooks for Tamer Studio v1.0 GA release, covering daily operations, monitoring, and maintenance procedures.

## Architecture

### Operations Dashboard

```
┌─────────────────────────────────────────────────┐
│              Operations Center                   │
├─────────┬─────────┬─────────┬─────────┬─────────┤
│ Health  │ Metrics │  Logs   │ Alerts  │  Jobs   │
├─────────┴─────────┴─────────┴─────────┴─────────┤
│                                                  │
│  System Health: ████████████ OK                  │
│  Active Users:  1,234                            │
│  API Requests:  45,678/hr                        │
│  Error Rate:    0.02%                            │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Daily Operations

| Task | Frequency | Command |
|------|-----------|---------|
| Health check | Every 5 min | `/api/health` |
| Log review | Daily | `docker logs` |
| Backup verification | Daily | Backup script |
| Metric review | Daily | Dashboard |
| Security scan | Weekly | Security tools |

### Monitoring Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Metrics | Prometheus | System metrics |
| Logs | ELK Stack | Log aggregation |
| Traces | Jaeger | Distributed tracing |
| Alerts | AlertManager | Alert routing |
| Dashboards | Grafana | Visualization |

### Key Metrics

```typescript
const keyMetrics = {
  availability: { target: 99.9, critical: 99.5 },
  latency: { p95: 500, p99: 1000 },
  errorRate: { target: 0.01, critical: 0.05 },
  throughput: { target: 1000, critical: 500 },
};
```

## Configuration

### Environment Variables

```env
# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
ALERTMANAGER_PORT=9093

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Alerts
ALERT_EMAIL=ops@tamerstudio.com
ALERT_SLACK=#ops-alerts
```

### Health Check Configuration

```typescript
const healthCheck = {
  interval: 30000, // 30 seconds
  timeout: 5000, // 5 seconds
  retries: 3,
  endpoints: [
    { name: "api", url: "/api/health" },
    { name: "database", url: "/api/health/database" },
    { name: "runtime", url: "/api/health/runtime" },
  ],
};
```

## Commands

### System Health

```bash
# Full health check
curl -X GET http://localhost:3000/api/health

# Database check
curl -X GET http://localhost:3000/api/health/database

# Runtime check
curl -X GET http://localhost:3000/api/health/runtime
```

### Log Management

```bash
# View application logs
docker logs tamerstudio-app -f --tail=100

# Search logs
docker logs tamerstudio-app 2>&1 | grep "ERROR"

# Rotate logs
docker exec tamerstudio-app logrotate /etc/logrotate.conf
```

### Backup Procedures

```bash
# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Verify backup
psql -f backup_$(date +%Y%m%d).sql -d tamerstudio_test
```

### Scaling

```bash
# Scale horizontally
docker-compose up -d --scale app=3

# Check resource usage
docker stats
```

## Verification

- [ ] Health checks running every 30s
- [ ] Alerts configured for all severity levels
- [ ] Backup schedule verified
- [ ] Log rotation configured
- [ ] Monitoring dashboards accessible
- [ ] On-call rotation documented
- [ ] Escalation paths defined
- [ ] Runbooks accessible to all engineers

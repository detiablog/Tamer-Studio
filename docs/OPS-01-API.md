# OPS-01: API Endpoints

## Scope

This document describes the 26 REST API endpoints that power the Operations Center, covering request/response schemas, authentication, and rate limiting.

## Architecture

### API Base

All operations endpoints are prefixed with `/api/admin/operations`.

### Authentication

All endpoints require admin authentication via Bearer token or session cookie.

### Endpoints Overview

| # | Method | Endpoint | Description |
|---|---|---|---|
| 1 | GET | `/overview` | System overview summary |
| 2 | GET | `/health` | Service health status |
| 3 | POST | `/health/check` | Trigger manual health check |
| 4 | GET | `/health/history` | Health check history |
| 5 | GET | `/alerts` | List alerts |
| 6 | POST | `/alerts` | Create alert |
| 7 | PUT | `/alerts/:id/acknowledge` | Acknowledge alert |
| 8 | PUT | `/alerts/:id/resolve` | Resolve alert |
| 9 | PUT | `/alerts/:id/dismiss` | Dismiss alert |
| 10 | GET | `/incidents` | List incidents |
| 11 | POST | `/incidents` | Create incident |
| 12 | PUT | `/incidents/:id` | Update incident |
| 13 | PUT | `/incidents/:id/resolve` | Resolve incident |
| 14 | GET | `/deployments` | List deployments |
| 15 | POST | `/deployments` | Create deployment |
| 16 | GET | `/maintenance` | List maintenance windows |
| 17 | POST | `/maintenance` | Create maintenance window |
| 18 | PUT | `/maintenance/:id/toggle` | Toggle maintenance mode |
| 19 | GET | `/audit` | List audit logs |
| 20 | POST | `/audit/export` | Export audit logs |
| 21 | GET | `/reports` | List reports |
| 22 | POST | `/reports/generate` | Generate report |
| 23 | GET | `/reports/:id/download` | Download report |
| 24 | GET | `/settings` | Get operations settings |
| 25 | PUT | `/settings` | Update operations settings |
| 26 | GET | `/metrics` | Get operational metrics |

### Request/Response Schemas

#### GET /overview

Response:
```json
{
  "systemStatus": "healthy",
  "cpuUsage": 45.2,
  "memoryUsage": 62.8,
  "diskUsage": 38.5,
  "openAlerts": 3,
  "criticalAlerts": 1,
  "openIncidents": 2,
  "totalIncidents": 15,
  "currentVersion": "1.2.3",
  "commitHash": "abc1234",
  "deploymentStatus": "active",
  "maintenanceMode": false
}
```

#### POST /alerts

Request:
```json
{
  "title": "Database connection timeout",
  "severity": "critical",
  "category": "infrastructure",
  "affectedServices": ["postgres"],
  "details": "Connection pool exhausted"
}
```

#### PUT /alerts/:id/acknowledge

Request:
```json
{
  "acknowledgedBy": "admin@tamer.studio",
  "notes": "Investigating connection pool settings"
}
```

### Rate Limiting

- Overview endpoint: 60 requests/minute
- Alert endpoints: 30 requests/minute
- Audit endpoints: 10 requests/minute
- Report generation: 5 requests/minute
- Settings endpoints: 10 requests/minute

## Configuration

| Setting | Default | Description |
|---|---|---|
| `API_RATE_LIMIT` | `60` | Default rate limit per minute |
| `API_PAGE_SIZE` | `25` | Default page size for list endpoints |
| `API_MAX_PAGE_SIZE` | `100` | Maximum page size for list endpoints |
| `API_TIMEOUT` | `30000` | API response timeout (ms) |

## Commands

```bash
# Test API health endpoint
curl -H "Authorization: Bearer $TOKEN" /api/admin/operations/health

# List open alerts
curl -H "Authorization: Bearer $TOKEN" /api/admin/operations/alerts?status=open

# Create incident
curl -X POST -H "Authorization: Bearer $TOKEN" -d '{"title":"Service outage","severity":"critical"}' /api/admin/operations/incidents

# Generate report
curl -X POST -H "Authorization: Bearer $TOKEN" -d '{"type":"health","period":"7d"}' /api/admin/operations/reports/generate
```

## Verification

- All 26 endpoints are accessible via the admin API.
- Authentication is enforced on all endpoints.
- Request and response schemas match the documented formats.
- Rate limiting is applied correctly per endpoint category.
- Pagination works for all list endpoints.
- Error responses include appropriate HTTP status codes and error messages.

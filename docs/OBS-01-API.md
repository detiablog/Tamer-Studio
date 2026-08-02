# OBS-01 API

## Scope

This document documents the Observability Platform API, including endpoints for metrics, logs, traces, alerts, dashboards, and reports.

## Architecture

The API follows RESTful conventions with JSON payloads and OpenTelemetry-compatible endpoints.

### Base URL

```
https://api.tamer.studio/v1/observability
```

### Authentication

All API requests require a valid API key in the `Authorization` header:

```
Authorization: Bearer <api_key>
```

### Endpoints

#### Metrics

| Method | Endpoint                        | Description              |
|-------|--------------------------------|--------------------------|
| GET   | /metrics                        | List metrics             |
| GET   | /metrics/:name                  | Get metric by name       |
| GET   | /metrics/:name/query            | Query metric data        |
| POST  | /metrics/:name/ingest           | Ingest custom metrics    |

#### Logs

| Method | Endpoint                        | Description              |
|-------|--------------------------------|--------------------------|
| GET   | /logs                           | List logs                |
| GET   | /logs/:id                       | Get log entry            |
| POST  | /logs/search                    | Search logs              |
| POST  | /logs/ingest                    | Ingest log entries       |

#### Traces

| Method | Endpoint                        | Description              |
|-------|--------------------------------|--------------------------|
| GET   | /traces                         | List traces              |
| GET   | /traces/:traceId                | Get trace by ID          |
| GET   | /traces/:traceId/spans          | Get spans for trace      |
| POST  | /traces/search                  | Search traces            |

#### Alerts

| Method | Endpoint                        | Description              |
|-------|--------------------------------|--------------------------|
| GET   | /alerts                         | List alerts              |
| POST  | /alerts                         | Create alert rule        |
| PUT   | /alerts/:id                     | Update alert rule        |
| DELETE| /alerts/:id                     | Delete alert rule        |
| POST  | /alerts/:id/acknowledge         | Acknowledge alert        |
| POST  | /alerts/:id/resolve             | Resolve alert            |

#### Dashboards

| Method | Endpoint                        | Description              |
|-------|--------------------------------|--------------------------|
| GET   | /dashboards                     | List dashboards          |
| POST  | /dashboards                     | Create dashboard         |
| GET   | /dashboards/:id                 | Get dashboard            |
| PUT   | /dashboards/:id                 | Update dashboard         |
| DELETE| /dashboards/:id                 | Delete dashboard         |

#### Reports

| Method | Endpoint                        | Description              |
|-------|--------------------------------|--------------------------|
| GET   | /reports                        | List reports             |
| POST  | /reports                        | Generate report          |
| GET   | /reports/:id                    | Get report               |
| GET   | /reports/:id/download           | Download report          |

## Configuration

```yaml
api:
  enabled: true
  port: 3001
  rateLimit:
    enabled: true
    maxRequestsPerMinute: 600
  cors:
    enabled: true
    origins: ["https://tamer.studio"]
  compression:
    enabled: true
    threshold: 1024
```

## Commands

```bash
# Start API server
pnpm obs:api:start

# Run API tests
pnpm obs:api:test

# Generate API documentation
pnpm obs:api:docs

# Validate API schema
pnpm obs:api:validate
```

## Verification

- All endpoints return correct HTTP status codes
- Rate limiting blocks requests exceeding limits
- API responses are compressed when payload exceeds 1KB
- CORS headers are present on cross-origin requests
- API documentation is auto-generated and accurate

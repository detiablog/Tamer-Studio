# OBS-01 Logging

## Scope

This document describes the structured logging subsystem, including log levels, structured fields, search capabilities, and retention policies.

## Architecture

The logging subsystem provides:

1. **Structured JSON Logging** - All logs emitted as structured JSON with standardized fields
2. **Log Levels** - DEBUG, INFO, WARNING, ERROR, CRITICAL, EMERGENCY
3. **Context Propagation** - Correlation ID, trace ID, and request ID injected into every log entry
4. **Log Explorer** - Full-text search with filtering by service, severity, time range, and custom fields

### Log Entry Schema

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "level": "error",
  "service": "ai-runtime",
  "module": "provider-router",
  "message": "Provider request failed",
  "correlationId": "abc-123",
  "traceId": "def-456",
  "requestId": "ghi-789",
  "statusCode": 503,
  "duration": 2340,
  "metadata": {
    "provider": "openai",
    "model": "gpt-4o"
  }
}
```

### Retention

| Level     | Retention | Sampling |
|----------|-----------|----------|
| DEBUG    | 7 days    | 10%      |
| INFO     | 30 days   | 100%     |
| WARNING  | 90 days   | 100%     |
| ERROR    | 180 days  | 100%     |
| CRITICAL | 365 days  | 100%     |

## Configuration

```yaml
logging:
  level: "info"
  format: "json"
  maxLogSize: "64KB"
  output:
    - type: "stdout"
    - type: "file"
      path: "/var/log/tamer"
      rotate: true
      maxFiles: 10
  structuredFields:
    - "correlationId"
    - "traceId"
    - "requestId"
    - "service"
    - "module"
```

## Commands

```bash
# Stream live logs
pnpm obs:logs:stream --level=error

# Search logs
pnpm obs:logs:search --query="provider failed" --service="ai-runtime"

# Export logs
pnpm obs:logs:export --format=csv --since="24h"

# Purge expired logs
pnpm obs:logs:purge
```

## Verification

- Log entries contain all required structured fields
- Log Explorer search returns results within 2 seconds
- Correlation ID links logs to traces correctly
- Log rotation triggers at configured file size limits
- Expired logs are purged according to retention policy

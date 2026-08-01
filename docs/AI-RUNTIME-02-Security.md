# AI-RUNTIME-02 — Security

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The AI Gateway Intelligence implements multiple security layers to protect provider credentials, API keys, user data, and system integrity. All security measures follow the principles defined in ADR-010 and ADR-011.

---

## Provider Credential Protection

### Environment Variable Storage

Provider API keys are loaded exclusively from environment variables:

| Variable | Provider | Location |
|----------|----------|----------|
| `OPENAI_API_KEY` | OpenAI | Environment |
| `ANTHROPIC_API_KEY` | Anthropic | Environment |
| `GOOGLE_AI_API_KEY` | Google Gemini | Environment |

### Prohibited Practices

The following practices are strictly prohibited:

- Hardcoding API keys in source code
- Storing API keys in database tables
- Logging API keys in any output
- Exposing API keys in API responses
- Passing API keys through URL parameters
- Including API keys in error messages

### Adapter Initialization

Provider adapters initialize SDK clients lazily using environment variables:

```typescript
private getClient(): OpenAI {
  if (!this.client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    this.client = new OpenAI({ apiKey });
  }
  return this.client;
}
```

Keys are never stored in adapter state beyond the SDK client instance.

---

## API Key Security

### Key Rotation

API keys should be rotated regularly. The system supports key rotation by:

1. Updating the environment variable
2. Restarting the application process
3. The adapter initializes with the new key on next request

### Key Validation

The system validates API key presence before executing requests:

1. Adapter checks for key existence on client initialization
2. Throws descriptive error if key is missing
3. Request fails before contacting the provider

### Key Isolation

- Each provider adapter manages its own client instance
- Adapter instances are singletons (one per provider)
- Client instances are not shared across providers
- No cross-provider key leakage is possible

---

## Rate Limiting

### Provider-Level Rate Limits

The `ai_provider` table includes rate limit configuration:

```typescript
rateLimit: {
  requestsPerMinute: number;
  tokensPerMinute: number;
}
```

### Application-Level Protection

The circuit breaker system provides application-level protection:

- **Failure threshold**: Blocks providers after N consecutive failures
- **Recovery timeout**: Prevents premature retry
- **Half-open limiting**: Limits probe requests during recovery

### Queue-Based Throttling

The queue system (`ai_queue_item`) provides request throttling:

- Requests are queued with priority levels
- Concurrent execution is limited
- Queue position enforces ordering
- Scheduled execution controls timing

---

## Audit Logging

### Request Audit Trail

Every AI request produces audit entries in two systems:

1. **Request Log** (`ai_request_log`): Full telemetry for every request
2. **Routing Decision** (`ai_routing_decision`): Routing rationale for every decision
3. **Audit Log** (via `DefaultAuditRepository`): Compliance-grade audit entries

### Audit Entry Fields

```typescript
{
  action: "ai.execution.completed" | "ai.execution.failed",
  actorId: string,        // User ID
  actorType: "user",
  resourceType: "ai_execution",
  resourceId: string,     // Execution ID
  metadata: {
    provider: string,
    model: string,
    workspaceId: string,
    tokensUsed: number,
    costUsd: number,
    creditsCharged: number,
    durationMs: number,
  }
}
```

### Admin Action Logging

Admin operations are logged to `ai_admin_action`:

```typescript
{
  adminId: string,
  action: string,         // e.g., "toggle_provider", "update_model"
  targetType: string,     // e.g., "provider", "model"
  targetId: string,
  details: Record<string, unknown>,
  ipAddress: string,
  userAgent: string,
}
```

---

## Data Protection

### User Data Isolation

- User preferences are scoped by `userId`
- Request logs include `userId` and `workspaceId`
- Generation history is per-user
- Credit operations are per-workspace

### Sensitive Data Handling

| Data Type | Protection |
|-----------|-----------|
| API keys | Environment variables only |
| User prompts | Logged with truncation |
| Token counts | Logged as integers |
| Cost data | Logged as floats |
| Error messages | Logged without credentials |

### Metadata Encryption

The `metadata` JSONB fields store extensible data but should not contain sensitive information. No encryption is applied to metadata fields.

---

## Network Security

### HTTPS

All API endpoints communicate over HTTPS in production.

### Provider Communication

Provider adapters communicate with external APIs using the official SDK libraries, which handle TLS verification.

### Internal Communication

The gateway components communicate within the same application process. No network calls occur between internal components.

---

## Input Validation

### Request Validation

All incoming requests are validated:

- Provider name must be a registered provider
- Model name must be a valid model for the provider
- Prompt must be non-empty
- Token limits must be within provider bounds
- User must be authenticated

### Parameter Bounds

| Parameter | Validation |
|-----------|-----------|
| `maxTokens` | Must be positive, within model limits |
| `temperature` | Must be 0.0-2.0 |
| `priority` | Must be a valid priority level |

---

## Compliance

### ADR-010 Compliance

- Provider credentials are centrally managed
- Business modules never access provider credentials
- Provider strategy is configurable

### ADR-011 Compliance

- No direct SDK usage outside provider adapters
- All requests pass through the gateway
- Business logic is prohibited inside adapters
- Provider-specific conditionals are centralized

### Security Checklist

| # | Criterion | Status |
|---|-----------|--------|
| 1 | No hardcoded credentials | PASS |
| 2 | API keys in environment variables only | PASS |
| 3 | Audit logging for all requests | PASS |
| 4 | Circuit breaker protection | PASS |
| 5 | Rate limiting via queue | PASS |
| 6 | Input validation | PASS |
| 7 | Error messages without credentials | PASS |
| 8 | Admin action logging | PASS |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/core/ai/providers/*.ts` | Adapter implementations with key handling |
| `src/core/ai/ai-runtime.ts` | Request execution with audit logging |
| `src/core/ai/provider-router.ts` | Health checking and circuit breaker |
| `src/core/ai/ai-admin.service.ts` | Admin action logging |
| `src/lib/db/schema/ai-admin.ts` | aiAdminAction, aiSafetyPolicy tables |

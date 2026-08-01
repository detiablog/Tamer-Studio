# AI-RUNTIME-02 — Circuit Breaker

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

The Circuit Breaker protects the platform from cascading failures by monitoring provider health and temporarily blocking requests to providers experiencing sustained failures. It follows the standard three-state circuit breaker pattern.

---

## States

### Closed (Normal)

- **Description**: Provider is operating normally
- **Behavior**: All requests are allowed through
- **Monitoring**: Success and failure counts are tracked
- **Transition**: Opens when failure count reaches threshold

### Open (Blocking)

- **Description**: Provider is experiencing sustained failures
- **Behavior**: All requests are immediately rejected without contacting the provider
- **Duration**: Remains open for the configured recovery timeout period
- **Transition**: Moves to half-open after recovery timeout expires

### Half-Open (Testing)

- **Description**: Provider is being tested for recovery
- **Behavior**: A limited number of probe requests are allowed through
- **Probe Limit**: `halfOpenMaxAttempts` (default: 3)
- **Transition to Closed**: If all probe requests succeed
- **Transition to Open**: If any probe request fails

---

## State Transitions

```
                    failure_count >= threshold
    +---------+  ---------------------------->  +---------+
    | CLOSED  |                                  |  OPEN   |
    +---------+                                  +---------+
         ^                                              |
         |                                              |
         |   all probe requests succeed                 | recovery_timeout expires
         +----------------------------------------------+
         |                                              |
         |   any probe request fails                    |
         +<---------------------------------------------+
                    return to OPEN
```

### Closed -> Open

- **Trigger**: `failureCount >= failureThreshold`
- **Action**: Set `state = "open"`, record `lastStateChangeAt`

### Open -> Half-Open

- **Trigger**: `lastStateChangeAt + recoveryTimeoutMs < now`
- **Action**: Set `state = "half_open"`, reset `successCount` and `failureCount`

### Half-Open -> Closed

- **Trigger**: `successCount >= halfOpenMaxAttempts`
- **Action**: Set `state = "closed"`, reset `failureCount` and `successCount`

### Half-Open -> Open

- **Trigger**: `failureCount >= 1` (any failure during probing)
- **Action**: Set `state = "open"`, record `lastStateChangeAt`

---

## Configuration

### Circuit Breaker Table (`ai_circuit_breaker`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | text | PK | Record identifier |
| `providerId` | varchar(100) | unique | Provider identifier |
| `state` | varchar(50) | `"closed"` | Current state |
| `failureCount` | integer | 0 | Consecutive failure counter |
| `successCount` | integer | 0 | Success counter (for half-open probes) |
| `lastFailureAt` | timestamp | null | Timestamp of last failure |
| `lastSuccessAt` | timestamp | null | Timestamp of last success |
| `lastStateChangeAt` | timestamp | now | Timestamp of last state transition |
| `failureThreshold` | integer | 5 | Failures needed to open breaker |
| `recoveryTimeoutMs` | integer | 30000 | Time before testing recovery (ms) |
| `halfOpenMaxAttempts` | integer | 3 | Probe requests in half-open state |
| `metadata` | jsonb | {} | Extensible metadata |

### Default Thresholds

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| `failureThreshold` | 5 | 1-100 | Consecutive failures to trigger open |
| `recoveryTimeoutMs` | 30000 | 5000-300000 | Wait before probing (ms) |
| `halfOpenMaxAttempts` | 3 | 1-10 | Successful probes to close |

---

## Failure Threshold

The circuit breaker opens after `failureThreshold` consecutive failures. This prevents transient issues from triggering unnecessary circuit breaking while still catching sustained provider problems.

**Default: 5 consecutive failures**

The threshold is configurable per provider through the `ai_circuit_breaker` table.

---

## Recovery Timeout

After the circuit opens, it waits `recoveryTimeoutMs` before transitioning to half-open. This gives the provider time to recover from whatever issue caused the failures.

**Default: 30,000ms (30 seconds)**

The timeout is configurable per provider. Providers with known maintenance windows may use longer timeouts.

---

## Automatic Recovery

The circuit breaker automatically recovers through the half-open state:

1. After `recoveryTimeoutMs`, the breaker transitions to half-open
2. The routing engine allows up to `halfOpenMaxAttempts` probe requests
3. If all probes succeed, the breaker closes (provider is healthy)
4. If any probe fails, the breaker reopens (provider is still unhealthy)

This cycle repeats automatically without manual intervention.

---

## Integration with Routing Engine

The routing engine checks circuit breaker state before selecting a provider:

| State | Routing Effect |
|-------|---------------|
| Closed | Provider is eligible for selection |
| Open | Provider is excluded from candidate pool |
| Half-Open | Provider is eligible with reduced score multiplier (0.5x) |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai-gateway/circuit-breakers` | GET | List all circuit breaker states |
| `/api/ai-gateway/circuit-breakers/[providerId]` | GET | Get specific provider circuit breaker |
| `/api/ai-gateway/circuit-breakers/[providerId]/reset` | POST | Manually reset circuit breaker to closed |

---

## Source Files

| File | Purpose |
|------|---------|
| `src/lib/db/schema/ai-gateway.ts` | aiCircuitBreaker table definition |
| `src/core/ai/provider-router.ts` | Circuit breaker state checking in routing |
| `src/app/api/ai-gateway/circuit-breakers/route.ts` | Circuit breaker API endpoint |

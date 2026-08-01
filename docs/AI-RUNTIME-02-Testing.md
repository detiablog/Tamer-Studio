# AI-RUNTIME-02 — Testing Guide

**Date:** 2026-08-01
**Sprint:** AI-RUNTIME-02
**Status:** Complete

---

## Overview

This guide covers the testing strategy for the AI Gateway Intelligence, including test coverage areas, routing testing, health monitoring testing, and circuit breaker testing.

---

## Test Coverage Areas

### Core Components

| Component | Test Type | Coverage |
|-----------|-----------|----------|
| Provider Registry | Unit | Adapter initialization, model listing, cost estimation |
| Provider Router | Unit | Health-based selection, preference application |
| AI Runtime | Integration | Full request lifecycle, credit management |
| Model Registry | Unit | Metadata queries, capability filtering |
| Health Monitor | Unit | Health recording, status checking |
| Circuit Breaker | Unit | State transitions, threshold handling |
| Fallback Engine | Integration | Retry logic, failover execution |
| Cost Optimizer | Unit | Cost estimation, credit calculation |

### Database Layer

| Table | Test Type | Coverage |
|-------|-----------|----------|
| ai_model_registry | Integration | CRUD, unique constraints, indexes |
| ai_capability_registry | Integration | CRUD, unique name constraint |
| ai_routing_decision | Integration | Insert, query by request/user |
| ai_request_log | Integration | Insert, query by provider/status |
| ai_circuit_breaker | Integration | State updates, unique provider |
| ai_queue_item | Integration | Queue operations, priority ordering |
| ai_user_preference | Integration | CRUD, unique user constraint |
| ai_runtime_metric | Integration | Insert, time-range queries |

### API Layer

| Endpoint Group | Test Type | Coverage |
|---------------|-----------|----------|
| Models API | Integration | List, get, update, scores |
| Capabilities API | Integration | List, get |
| Routing API | Integration | Decisions, stats, preferences |
| Requests API | Integration | List, get, stats |
| Queue API | Integration | List, status, retry, cancel |
| Health API | Integration | List, get, check |
| Circuit Breakers API | Integration | List, get, reset |
| Metrics API | Integration | List, summary |
| Analytics API | Integration | Dashboard data |
| Estimate API | Integration | Cost estimation |

---

## Routing Testing

### Test Scenarios

**Scenario 1: Balanced Strategy Selection**

```
Setup:
- Provider A: quality=80, speed=60, cost=70
- Provider B: quality=70, speed=80, cost=60
- Provider C: quality=60, speed=70, cost=80

Expected: Provider A selected (highest composite score)
```

**Scenario 2: Fastest Strategy Selection**

```
Setup:
- Provider A: quality=80, speed=90, cost=50
- Provider B: quality=70, speed=95, cost=60
- Provider C: quality=60, speed=80, cost=70

Expected: Provider B selected (highest speed score)
```

**Scenario 3: Cheapest Strategy Selection**

```
Setup:
- Provider A: quality=80, speed=60, cost=90
- Provider B: quality=70, speed=80, cost=95
- Provider C: quality=60, speed=70, cost=98

Expected: Provider A selected (highest cost score)
```

**Scenario 4: User Preference Application**

```
Setup:
- User prefers: ["openai"]
- User excludes: ["anthropic"]
- Available: openai, anthropic, google

Expected: Only openai and google in candidates
```

**Scenario 5: Cost Constraint Filtering**

```
Setup:
- User maxCostPerRequest: 0.01
- Model A cost: 0.005
- Model B cost: 0.02
- Model C cost: 0.008

Expected: Only models A and C in candidates
```

**Scenario 6: Health-Based Exclusion**

```
Setup:
- Provider A: status=online, failureRate=5%
- Provider B: status=offline, failureRate=60%
- Provider C: status=online, failureRate=45%

Expected: Provider B excluded from candidates
```

---

## Health Monitoring Testing

### Test Scenarios

**Scenario 1: Success Recording**

```
Action: recordSuccess("openai", 1500)

Verify:
- totalRequests incremented
- latencyMs updated to 1500
- successRate recalculated
- lastSuccessAt updated
- status set to "online"
```

**Scenario 2: Failure Recording**

```
Action: recordFailure("openai", "Rate limit exceeded")

Verify:
- totalRequests incremented
- totalFailures incremented
- failureRate recalculated
- lastFailureAt updated
- lastError set to "Rate limit exceeded"
- status set to "offline" if failureRate > 50%
```

**Scenario 3: Health Check Query**

```
Setup: Provider with status=online, failureRate=5%

Action: isHealthy("openai")

Expected: true
```

**Scenario 4: Unhealthy Provider Detection**

```
Setup: Provider with status=offline

Action: isHealthy("openai")

Expected: false
```

**Scenario 5: High Failure Rate Detection**

```
Setup: Provider with failureRate=55%

Action: isHealthy("openai")

Expected: false
```

---

## Circuit Breaker Testing

### Test Scenarios

**Scenario 1: Closed State (Normal)**

```
Setup: state=closed, failureCount=0

Action: Record 3 successes

Verify:
- state remains "closed"
- failureCount remains 0
- successCount incremented
```

**Scenario 2: Closed to Open Transition**

```
Setup: state=closed, failureThreshold=5

Action: Record 5 consecutive failures

Verify:
- state transitions to "open"
- lastStateChangeAt updated
- failureCount = 5
```

**Scenario 3: Open State (Blocking)**

```
Setup: state=open

Action: Check if provider is eligible

Expected: Provider excluded from candidate pool
```

**Scenario 4: Open to Half-Open Transition**

```
Setup: state=open, recoveryTimeoutMs=30000, lastStateChangeAt=30s ago

Action: Check circuit breaker state

Verify:
- state transitions to "half_open"
- successCount reset to 0
- failureCount reset to 0
```

**Scenario 5: Half-Open to Closed Recovery**

```
Setup: state=half_open, halfOpenMaxAttempts=3

Action: Record 3 consecutive successes

Verify:
- state transitions to "closed"
- failureCount reset to 0
- successCount reset to 0
```

**Scenario 6: Half-Open to Open Regression**

```
Setup: state=half_open

Action: Record 1 failure

Verify:
- state transitions to "open"
- lastStateChangeAt updated
- failureCount incremented
```

**Scenario 7: Manual Reset**

```
Setup: state=open, failureCount=10

Action: POST /api/ai-gateway/circuit-breakers/openai/reset

Verify:
- state transitions to "closed"
- failureCount reset to 0
- successCount reset to 0
```

---

## Fallback Engine Testing

### Test Scenarios

**Scenario 1: Successful Primary Execution**

```
Setup: Provider A is healthy

Action: Execute request

Verify:
- Request completes with Provider A
- No fallback triggered
- wasFallback = false
- retryCount = 0
```

**Scenario 2: Retry on Transient Failure**

```
Setup: Provider A fails with HTTP 500

Action: Execute request

Verify:
- Retry after exponential backoff
- Second attempt succeeds
- retryCount = 1
- wasFallback = false
```

**Scenario 3: Fallback to Alternative Provider**

```
Setup: Provider A fails after maxRetries
       Provider B is healthy

Action: Execute request

Verify:
- Request completes with Provider B
- wasFallback = true
- fallbackProvider = "B"
- Credit reservation adjusted for Provider B
```

**Scenario 4: All Providers Exhausted**

```
Setup: Provider A fails after maxRetries
       Provider B fails after maxRetries
       Provider C fails after maxRetries

Action: Execute request

Verify:
- Error returned to caller
- All credit reservations released
- Health monitor updated for all providers
```

**Scenario 5: Credit Handling During Fallback**

```
Setup: Provider A fails, Provider B succeeds

Verify:
- Credit reservation for A is released
- New credit reservation for B is made
- Credits adjusted based on B's actual usage
```

---

## Running Tests

### Unit Tests

```bash
npm run test:unit
```

### Integration Tests

```bash
npm run test:integration
```

### Full Test Suite

```bash
npm run test
```

### Coverage Report

```bash
npm run test:coverage
```

---

## Test Configuration

The test configuration is defined in `vitest.config.ts`:

- Test framework: Vitest
- Environment: Node.js
- Coverage provider: v8
- Test timeout: 30,000ms

---

## Source Files

| File | Purpose |
|------|---------|
| `vitest.config.ts` | Test configuration |
| `src/test/unit/` | Unit test directory |
| `src/test/integration/` | Integration test directory |

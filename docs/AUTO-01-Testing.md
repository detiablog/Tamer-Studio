# AUTO-01: Testing Guide

## Overview

This document outlines the testing strategy for the Intelligent Automation Center, covering unit tests, integration tests, and validation approaches for each engine component.

## Test Coverage Areas

### Rule Engine

- Rule CRUD operations (create, read, update, delete, toggle)
- Condition evaluation with all 8 operators
- Nested condition groups (AND/OR logic)
- Action execution ordering
- Skip-on-error behavior
- Execution recording and progress tracking
- Event recording and listing
- Statistics calculation
- Pagination and filtering

### Scheduling Engine

- Schedule CRUD operations
- Next-run calculation for all 7 schedule types
- Due schedule detection
- Schedule execution marking
- Max-runs limit enforcement
- Timezone handling
- Statistics calculation

### Queue Engine

- Enqueue with position calculation
- Dequeue with priority ordering
- Ack/nack operations
- Retry mechanism
- Cancel operation
- Queue status tracking
- Priority reprioritization
- Queue clearing

### Template Engine

- Template CRUD operations
- Template-to-rule conversion
- Usage counting
- Category and type filtering
- System template protection

### Settings Service

- Default settings creation
- Settings upsert (create/update)
- Per-user isolation

### Report Engine

- Report generation from execution data
- Success/failure rate calculation
- Credit analysis
- Report listing and pagination

## Engine Testing

### Unit Test Pattern

Each engine service can be tested by mocking the database layer:

```typescript
// Example: Rule Engine condition evaluation
describe("RuleEngineService", () => {
  describe("evaluateConditions", () => {
    it("should return true for empty conditions", async () => {
      const result = await ruleEngineService.evaluateConditions([], {});
      expect(result).toBe(true);
    });

    it("should evaluate equals operator", async () => {
      const conditions = [
        { field: "status", operator: "equals", value: "active" }
      ];
      const context = { status: "active" };
      const result = await ruleEngineService.evaluateConditions(conditions, context);
      expect(result).toBe(true);
    });

    it("should evaluate nested AND groups", async () => {
      const conditions = [
        {
          field: "status",
          operator: "equals",
          value: "active",
          logicalOperator: "AND",
          group: [
            { field: "type", operator: "equals", value: "video" }
          ]
        }
      ];
      const context = { status: "active", type: "video" };
      const result = await ruleEngineService.evaluateConditions(conditions, context);
      expect(result).toBe(true);
    });

    it("should evaluate nested OR groups", async () => {
      const conditions = [
        {
          field: "status",
          operator: "equals",
          value: "active",
          logicalOperator: "OR",
          group: [
            { field: "type", operator: "equals", value: "image" }
          ]
        }
      ];
      const context = { status: "inactive", type: "image" };
      const result = await ruleEngineService.evaluateConditions(conditions, context);
      expect(result).toBe(true);
    });
  });
});
```

### Condition Operator Tests

| Operator | Test Case | Expected |
|---|---|---|
| `equals` | `{ field: "a", op: "equals", value: 1 }` with `{ a: 1 }` | `true` |
| `equals` | `{ field: "a", op: "equals", value: 1 }` with `{ a: 2 }` | `false` |
| `not_equals` | `{ field: "a", op: "not_equals", value: 1 }` with `{ a: 2 }` | `true` |
| `contains` | `{ field: "a", op: "contains", value: "lo" }` with `{ a: "hello" }` | `true` |
| `not_contains` | `{ field: "a", op: "not_contains", value: "xyz" }` with `{ a: "hello" }` | `true` |
| `greater_than` | `{ field: "a", op: "greater_than", value: 5 }` with `{ a: 10 }` | `true` |
| `less_than` | `{ field: "a", op: "less_than", value: 5 }` with `{ a: 3 }` | `true` |
| `in` | `{ field: "a", op: "in", value: [1,2,3] }` with `{ a: 2 }` | `true` |
| `not_in` | `{ field: "a", op: "not_in", value: [1,2,3] }` with `{ a: 4 }` | `true` |

### Action Execution Tests

| Test Case | Expected Behavior |
|---|---|
| Single action, success | Returns result with `success: true` |
| Single action, failure | Returns error in `errors` array |
| Multiple actions, all success | All results returned in order |
| Multiple actions, first fails, `skipOnError: false` | Execution stops after first failure |
| Multiple actions, first fails, `skipOnError: true` | Continues to next action |
| Actions with non-sequential order | Sorted by `order` before execution |

### Scheduling Tests

| Test Case | Expected Behavior |
|---|---|
| `once` schedule | Next run = now + intervalMs |
| `daily` schedule | Next run = next midnight |
| `weekly` schedule | Next run = next midnight + 7 days |
| `monthly` schedule | Next run = 1st of next month |
| `yearly` schedule | Next run = Jan 1 of next year |
| `interval` schedule | Next run = now + intervalMs |
| Max runs reached | `isActive` set to `false` |

### Queue Tests

| Test Case | Expected Behavior |
|---|---|
| Enqueue | Position = max + 1 |
| Dequeue empty queue | Returns `null` |
| Dequeue with priority | High priority dequeued first |
| Dequeue with scheduledAt | Only dequeues when time has passed |
| Ack | Status set to `completed` |
| Nack | Status set to `failed` |
| Retry | Status reset to `waiting` |
| Cancel | Status set to `cancelled` |

## Integration Testing

### API Endpoint Tests

Each API endpoint should be tested for:

1. **Authentication**: Unauthenticated requests return 401
2. **Validation**: Missing required fields return 400
3. **Success**: Valid requests return expected response
4. **User isolation**: Cannot access other users' resources
5. **Pagination**: List endpoints return paginated results
6. **Error handling**: Invalid inputs return appropriate errors

### Test Flow

```
1. Create user session
2. Create automation rule via POST /api/automation
3. Verify rule created via GET /api/automation/[id]
4. Toggle rule via POST /api/automation/[id]/toggle
5. Record event via POST /api/automation/events
6. Evaluate conditions via POST /api/automation/evaluate
7. Execute rule via POST /api/automation/[id]/execute
8. Check execution via GET /api/automation/executions
9. Generate report via POST /api/automation/reports
10. Verify report via GET /api/automation/reports/[id]
11. Clean up via DELETE operations
```

### Database Integration Tests

- Verify all 8 tables are created correctly
- Test foreign key relationships
- Test index usage for common queries
- Test JSONB field storage and retrieval
- Test timestamp defaults and updates

## Test Environment

### Requirements

- PostgreSQL database (test instance)
- Environment variables configured in `.env.local`
- Test user with valid session token

### Mock Strategy

For unit tests:
- Mock database queries using Drizzle's test utilities
- Mock external service calls (AI modules, email, notifications)
- Use in-memory state for singleton services

For integration tests:
- Use real database with test data isolation
- Clean up test data after each test suite
- Use unique IDs to prevent conflicts

## Running Tests

```bash
# Run all tests
pnpm test

# Run automation-specific tests
pnpm test --filter automation

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

## Validation Checklist

- [ ] All 8 database tables created with correct schema
- [ ] All 24 API endpoints respond correctly
- [ ] Authentication middleware enforced on all endpoints
- [ ] User isolation enforced on all data operations
- [ ] Condition evaluation handles all 8 operators
- [ ] Nested condition groups evaluate correctly
- [ ] Actions execute in correct order
- [ ] Skip-on-error behavior works as expected
- [ ] Queue priority ordering is correct
- [ ] Schedule next-run calculation is accurate
- [ ] Max-runs limit deactivates schedules
- [ ] Reports generate correct statistics
- [ ] Settings upsert creates and updates correctly
- [ ] Template-to-rule conversion works
- [ ] Pagination returns correct page counts
- [ ] Error responses include proper error codes

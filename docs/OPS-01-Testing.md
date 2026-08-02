# OPS-01: Testing

## Scope

This document describes the testing strategy for the Operations Center, including unit tests, integration tests, and end-to-end tests for all operational subsystems.

## Architecture

### Test Pyramid

```
End-to-End Tests (10%)
  |
  +-- Dashboard navigation
  +-- Alert creation and lifecycle
  +-- Incident creation and resolution
  +-- Report generation and download
  |
Integration Tests (30%)
  |
  +-- API endpoint testing
  +-- Database operations
  +-- Redis cache behavior
  +-- Alert rule evaluation
  +-- Health check execution
  |
Unit Tests (60%)
  |
  +-- Alert severity calculation
  +-- Metric threshold evaluation
  +-- Report data aggregation
  +-- Audit log formatting
  +-- Settings validation
```

### Test Coverage Targets

| Component | Unit | Integration | E2E |
|---|---|---|---|
| Health Monitoring | 90% | 80% | 70% |
| Alert Center | 90% | 85% | 75% |
| Incident Manager | 85% | 80% | 70% |
| Deployment Tracker | 85% | 75% | 65% |
| Maintenance Scheduler | 80% | 75% | 65% |
| Audit Logger | 90% | 85% | 70% |
| Report Engine | 85% | 80% | 70% |
| Settings Manager | 90% | 85% | 75% |

### Test Data

Test fixtures include:

- Mock health check responses for all service types.
- Sample alert, incident, and deployment data.
- Mock metric data for threshold evaluation tests.
- Sample audit log entries for query tests.

### Test Environment

- **Database**: PostgreSQL test database with migration support.
- **Cache**: Redis test instance with flush between tests.
- **Mocking**: MSW (Mock Service Worker) for API mocking.
- **Assertions**: Vitest with custom matchers.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `TEST_DB_URL` | (env) | Test database connection URL |
| `TEST_REDIS_URL` | (env) | Test Redis connection URL |
| `TEST_TIMEOUT` | `30000` | Test timeout (ms) |
| `TEST_RETRY_COUNT` | `2` | Number of retries for flaky tests |

## Commands

```bash
# Run all Operations Center tests
pnpm test --filter operations

# Run unit tests only
pnpm test:unit --filter operations

# Run integration tests only
pnpm test:integration --filter operations

# Run E2E tests only
pnpm test:e2e --filter operations

# Run tests with coverage
pnpm test:coverage --filter operations

# Run specific test file
pnpm test --filter operations -- --testPathPattern="alert-center"
```

## Verification

- All unit tests pass with the configured coverage thresholds.
- Integration tests pass against the test database and Redis instance.
- E2E tests pass in the full application context.
- No test isolation issues between test runs.
- Test data cleanup occurs between test suites.
- CI pipeline runs all test suites on every commit.

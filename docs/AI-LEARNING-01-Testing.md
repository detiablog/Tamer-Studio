# AI-LEARNING-01 - Testing

## Overview

The Continuous Learning Engine includes comprehensive testing across unit, integration, and end-to-end levels. All tests use Vitest as the testing framework.

## Testing Strategy

### Test Pyramid

```
        /\
       /  \  E2E Tests (10%)
      /----\
     /      \ Integration Tests (30%)
    /--------\
   /          \ Unit Tests (60%)
  /------------\
```

### Coverage Targets

| Category | Target |
|----------|--------|
| Line Coverage | 80% |
| Branch Coverage | 75% |
| Function Coverage | 85% |
| Statement Coverage | 80% |

## Unit Tests

### Event Collection

```typescript
describe("Event Collection", () => {
  it("should create a learning event with valid data", async () => {
    const event = {
      type: "content.create",
      category: "behavior",
      description: "Created a new story",
      metadata: { contentId: "story_123" },
    };
    const result = await createEvent(userId, workspaceId, event);
    expect(result.id).toBeDefined();
    expect(result.type).toBe("content.create");
  });

  it("should reject event with missing required fields", async () => {
    const event = { type: "", category: "behavior" };
    await expect(createEvent(userId, workspaceId, event)).rejects.toThrow();
  });

  it("should scope events to user and workspace", async () => {
    const event = await createEvent(user1Id, ws1Id, validEvent);
    const found = await getEvent(event.id, user2Id, ws2Id);
    expect(found).toBeNull();
  });
});
```

### Pattern Detection

```typescript
describe("Pattern Detection", () => {
  it("should detect frequency patterns from events", async () => {
    const events = Array(10).fill({
      type: "content.create",
      category: "behavior",
      timestamp: "2026-01-15T19:00:00Z",
    });
    const patterns = await detectPatterns(userId, events);
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].confidence).toBeGreaterThan(0);
  });

  it("should not detect patterns below threshold", async () => {
    const events = [{ type: "content.create", category: "behavior" }];
    const patterns = await detectPatterns(userId, events);
    expect(patterns.length).toBe(0);
  });

  it("should calculate confidence correctly", async () => {
    const confidence = calculateConfidence(45, 0.9, 0.8);
    expect(confidence).toBeGreaterThan(0);
    expect(confidence).toBeLessThanOrEqual(1);
  });
});
```

### Preference Inference

```typescript
describe("Preference Inference", () => {
  it("should infer preference from behavioral data", async () => {
    const preferences = await inferPreferences(userId, patterns);
    expect(preferences.length).toBeGreaterThan(0);
    expect(preferences[0].source).toBe("behavioral");
  });

  it("should resolve explicit override over inferred", async () => {
    await setPreferenceOverride(userId, "key", "override_value");
    const resolved = await resolvePreference(userId, "key");
    expect(resolved).toBe("override_value");
  });

  it("should fall back to default when no data", async () => {
    const resolved = await resolvePreference(newUserId, "unknown_key");
    expect(resolved).toBeDefined();
  });
});
```

### Recommendation Generation

```typescript
describe("Recommendation Generation", () => {
  it("should generate recommendations from patterns", async () => {
    const recommendations = await generateRecommendations(userId, patterns, preferences);
    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].title).toBeDefined();
  });

  it("should prioritize recommendations by confidence", async () => {
    const recommendations = await generateRecommendations(userId, patterns, preferences);
    for (let i = 1; i < recommendations.length; i++) {
      expect(recommendations[i - 1].confidence).toBeGreaterThanOrEqual(
        recommendations[i].confidence
      );
    }
  });

  it("should not exceed max active recommendations", async () => {
    const recommendations = await generateRecommendations(userId, patterns, preferences);
    expect(recommendations.length).toBeLessThanOrEqual(10);
  });
});
```

## Integration Tests

### API Endpoint Tests

```typescript
describe("Learning API", () => {
  describe("GET /api/learning/events", () => {
    it("should return events for authenticated user", async () => {
      const res = await request(app)
        .get("/api/learning/events")
        .set("Cookie", authCookie);
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it("should return 401 for unauthenticated request", async () => {
      const res = await request(app).get("/api/learning/events");
      expect(res.status).toBe(401);
    });

    it("should filter by type", async () => {
      const res = await request(app)
        .get("/api/learning/events?type=content.create")
        .set("Cookie", authCookie);
      expect(res.status).toBe(200);
      res.body.data.forEach((event: any) => {
        expect(event.type).toBe("content.create");
      });
    });
  });

  describe("POST /api/learning/recommendations/[id]/status", () => {
    it("should update recommendation status to accepted", async () => {
      const res = await request(app)
        .put(`/api/learning/recommendations/${recId}/status`)
        .set("Cookie", authCookie)
        .send({ status: "accepted" });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("accepted");
    });

    it("should reject invalid status", async () => {
      const res = await request(app)
        .put(`/api/learning/recommendations/${recId}/status`)
        .set("Cookie", authCookie)
        .send({ status: "invalid" });
      expect(res.status).toBe(400);
    });
  });
});
```

### Database Tests

```typescript
describe("Learning Database", () => {
  it("should enforce unique preference per user-key", async () => {
    await createPreference(userId, "key", "value1");
    await expect(
      createPreference(userId, "key", "value2")
    ).rejects.toThrow();
  });

  it("should cascade delete on user deletion", async () => {
    const userId = await createTestUser();
    await createEvent(userId, wsId, validEvent);
    await deleteUser(userId);
    const events = await getEventsByUser(userId);
    expect(events.length).toBe(0);
  });

  it("should enforce foreign key constraints", async () => {
    await expect(
      createEvent("nonexistent_user", wsId, validEvent)
    ).rejects.toThrow();
  });
});
```

## End-to-End Tests

### Learning Flow

```typescript
describe("Learning Flow E2E", () => {
  it("should complete full learning lifecycle", async () => {
    // 1. Create events
    await page.goto("/learning");
    await page.click('[data-testid="settings-tab"]');
    await page.fill('[data-testid="learning-enabled"]', "true");

    // 2. Trigger pattern detection
    await page.click('[data-testid="detect-patterns"]');
    await expect(page.locator('[data-testid="pattern-count"]')).not.toBe("0");

    // 3. View recommendations
    await page.click('[data-testid="recommendations-tab"]');
    await expect(page.locator('[data-testid="recommendation-card"]').first()).toBeVisible();

    // 4. Accept recommendation
    await page.click('[data-testid="accept-recommendation"]');
    await expect(page.locator('[data-testid="status-accepted"]')).toBeVisible();

    // 5. Submit feedback
    await page.click('[data-testid="feedback-tab"]');
    await page.click('[data-testid="star-5"]');
    await page.fill('[data-testid="feedback-comment"]', "Helpful!");
    await page.click('[data-testid="submit-feedback"]');
    await expect(page.locator('[data-testid="feedback-submitted"]')).toBeVisible();
  });
});
```

## Test Configuration

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules", "tests"],
    },
  },
});
```

### Test Data

- Test users created with unique IDs
- Test workspaces isolated per test suite
- Cleanup after each test
- No shared state between tests

## Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test tests/learning/events.test.ts

# Run in watch mode
pnpm test:watch
```

## Test Maintenance

- Tests updated with feature changes
- Flaky tests identified and fixed
- Coverage reports reviewed weekly
- Test data fixtures maintained
- Mock data kept consistent with schemas

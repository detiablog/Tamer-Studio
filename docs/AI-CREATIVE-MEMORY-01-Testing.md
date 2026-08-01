# AI Creative Memory System - Testing Guide

## Test Coverage Areas

### Core Service Tests

| Area | Service | Coverage |
|------|---------|----------|
| CRUD Operations | `CreativeMemoryService` | Create, read, update, delete for all memory types |
| List & Search | `CreativeMemoryService` | Filtering, pagination, search |
| Brand Management | `CreativeMemoryService` | Multi-brand support, active profile |
| Preference Management | `CreativeMemoryService` | CRUD with confidence scoring |
| Learning Events | `CreativeMemoryService` | Event recording and listing |
| Import/Export | `CreativeMemoryService` | Full import, full export, selective import |
| Clear Operations | `CreativeMemoryService` | Category-specific and full clear |
| Statistics | `CreativeMemoryService` | Aggregate counts across all types |

### Learning Engine Tests

| Area | Method | Coverage |
|------|--------|----------|
| Event Processing | `processEvent()` | Enable/disable/pause checks |
| Prompt Learning | `recordPromptUsage()` | Score calculation, memory upsert, preference inference |
| Asset Learning | `recordAssetPreference()` | Action weights, preference updates |
| Style Learning | `recordStylePreference()` | Confidence updates |
| Batch Inference | `inferPreferences()` | Event aggregation, preference creation |
| Learning Stats | `getLearningStats()` | Breakdown queries |
| Settings Check | `checkSettings()` | Default and custom settings |
| Data Clearing | `clearLearningData()` | Category and time-based clearing |

### Style Engine Tests

| Area | Method | Coverage |
|------|--------|----------|
| Visual Memory | CRUD methods | Create, list, get, update, delete |
| Thumbnail Memory | CRUD methods | Create, list, get, update, delete |
| Caption Memory | CRUD methods | Create, list, get, update, delete |
| Style Stats | `getStyleStats()` | Aggregate counts, mood/composition breakdowns |
| Active Style | `getActiveVisualStyle()` | Active style retrieval |

### Context Builder Tests

| Area | Method | Coverage |
|------|--------|----------|
| Full Context | `buildContext()` | All memory types loaded |
| Prompt Context | `buildPromptContext()` | Lightweight context |
| Summary Generation | `getContextSummary()` | Text formatting for all sections |
| Suggestions | `getSuggestions()` | Pinned-first, fallback logic |
| Context Search | `searchContext()` | Cross-category search |

---

## API Endpoint Testing

### Test Categories

#### 1. Authentication Tests

- Verify all endpoints reject unauthenticated requests (401)
- Verify authenticated requests proceed correctly
- Verify session extraction works correctly

#### 2. Validation Tests

- Verify required fields are enforced
- Verify optional fields are handled
- Verify invalid input returns 400 errors
- Verify edge cases (empty strings, null values, large payloads)

#### 3. CRUD Tests

- Verify create returns 201 with correct data
- Verify get returns correct data
- Verify update modifies only specified fields
- Verify delete removes the resource
- Verify non-existent resources return 404

#### 4. Pagination Tests

- Verify default pagination works
- Verify custom page/limit works
- Verify total count is accurate
- Verify edge cases (page 0, negative limits, limit > 100)

#### 5. Search Tests

- Verify search returns matching results
- Verify category filtering works
- Verify search is case-insensitive (LIKE)
- Verify empty results are handled

### Endpoint Test Matrix

| Endpoint | GET | POST | PUT | DELETE |
|----------|-----|------|-----|--------|
| `/api/memory` | List | Create | - | - |
| `/api/memory/[id]` | Get | - | Update | Delete |
| `/api/memory/brand` | List | Create | - | - |
| `/api/memory/brand/[id]` | Get | - | Update | Delete |
| `/api/memory/preferences` | List | Create | - | - |
| `/api/memory/preferences/[id]` | Get | - | Update | Delete |
| `/api/memory/learning` | List | Create | - | - |
| `/api/memory/visual` | List | Create | - | - |
| `/api/memory/visual/[id]` | Get | - | Update | Delete |
| `/api/memory/story` | List | Create | - | - |
| `/api/memory/story/[id]` | Get | - | Update | Delete |
| `/api/memory/character` | List | Create | - | - |
| `/api/memory/character/[id]` | Get | - | Update | Delete |
| `/api/memory/thumbnail` | List | Create | - | - |
| `/api/memory/thumbnail/[id]` | Get | - | Update | Delete |
| `/api/memory/caption` | List | Create | - | - |
| `/api/memory/caption/[id]` | Get | - | Update | Delete |
| `/api/memory/workflow` | List | Create | - | - |
| `/api/memory/workflow/[id]` | Get | - | Update | Delete |
| `/api/memory/generation` | List | Create | - | - |
| `/api/memory/generation/[id]` | Get | - | Update | Delete |
| `/api/memory/publishing` | Get | Create | Update | - |
| `/api/memory/stats` | Get | - | - | - |
| `/api/memory/settings` | Get | Create | Update | - |
| `/api/memory/search` | Get | - | - | - |
| `/api/memory/suggestions` | Get | - | - | - |
| `/api/memory/context` | - | Create | - | - |
| `/api/memory/export` | Get | - | - | - |
| `/api/memory/import` | - | Create | - | - |
| `/api/memory/clear` | - | Create | - | - |
| `/api/memory/admin/analytics` | Get | - | - | - |
| `/api/memory/admin/rules` | List | Create | - | - |
| `/api/memory/admin/clear` | - | Create | - | - |
| `/api/memory/admin/reset-learning` | - | Create | - | - |

---

## Service Layer Testing

### Unit Test Structure

```
src/test/unit/
  creative-memory/
    creative-memory.service.test.ts
    learning-engine.service.test.ts
    style-engine.service.test.ts
    context-builder.service.test.ts
```

### Mock Strategy

- Mock database queries using Drizzle's test utilities
- Mock `generateId()` for deterministic IDs
- Mock `Date.now()` for timestamp consistency

### Test Fixtures

```typescript
const mockUserId = "user_test123";

const mockMemory = {
  id: "cmem_test123",
  userId: mockUserId,
  category: "prompts",
  key: "test_key",
  content: "Test content",
  data: {},
  score: 50,
  isPinned: false,
  isSystem: false,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockBrandProfile = {
  id: "cbpf_test123",
  userId: mockUserId,
  name: "Test Brand",
  primaryColors: ["#000000"],
  secondaryColors: [],
  preferredPlatforms: [],
  keywords: [],
  rules: [],
  brandStyleGuide: {},
  isActive: true,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

---

## UI Component Testing

### Component Test Areas

| Component | Test Focus |
|-----------|-----------|
| Memory List | Rendering, pagination, search, filtering |
| Memory Form | Create/edit validation, field types |
| Brand Profile Form | Multi-brand management, color picker |
| Preference Display | Confidence visualization, category grouping |
| Learning Events Timeline | Event type display, chronological ordering |
| Context Preview | Summary rendering, section formatting |
| Import/Export UI | File upload, download, progress indication |
| Settings Panel | Toggle switches, number inputs, category management |

### Test Framework

- Use Vitest for unit tests
- Use React Testing Library for component tests
- Use MSW (Mock Service Worker) for API mocking

### Component Test Examples

```typescript
// Example: Memory list rendering
describe("MemoryList", () => {
  it("renders memories from API response", async () => {
    render(<MemoryList userId="user_test" />);
    await screen.findByText("Test Memory");
  });

  it("handles empty state", async () => {
    server.use(
      http.get("/api/memory", () => {
        return HttpResponse.json({ success: true, data: { data: [], total: 0 } });
      })
    );
    render(<MemoryList userId="user_test" />);
    await screen.findByText("No memories found");
  });
});
```

---

## Integration Testing

### End-to-End Flow Tests

1. **Brand Setup Flow**: Create brand -> Activate -> Verify context includes brand
2. **Learning Flow**: Record events -> Verify preferences updated -> Verify context includes preferences
3. **Import/Export Flow**: Export data -> Import to new user -> Verify data integrity
4. **Context Building Flow**: Create memories -> Build context -> Verify summary format

### Performance Tests

- Context build time with 1000+ memories
- Import time with 10,000+ records
- Search performance across large datasets
- Concurrent API request handling

---

## Test Commands

```bash
# Run all unit tests
npm run test

# Run specific test file
npm run test -- src/test/unit/creative-memory/creative-memory.service.test.ts

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

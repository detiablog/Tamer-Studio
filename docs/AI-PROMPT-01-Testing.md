# AI Prompt Intelligence - Testing

## Overview

The Prompt Testing service provides a cost-controlled testing workflow for prompts. It estimates token and credit consumption before execution and records test runs with their resolved prompt, provider, model, and execution results. It is backed by the `prompt_tests` table.

- **File**: `src/core/prompt-intelligence/prompt-testing.service.ts`
- **Export**: `promptTestingService` (singleton)
- **Endpoints**:
  - `GET /api/prompts/testing`
  - `POST /api/prompts/testing`
  - `GET/PUT/DELETE /api/prompts/testing/[id]`
  - `POST /api/prompts/testing/estimates`

---

## Test Estimate (Tokens, Credits)

`estimate(prompt)` reuses the Analyzer for token estimation:

```typescript
interface TestEstimate {
  estimatedTokens: number;
  estimatedCredits: number;
}
```

Computation:

```
estimatedTokens = analyzer.estimatedTokens  // = ceil(prompt.length / 4)
estimatedCredits = ceil(estimatedTokens * 0.02)
```

- Token estimation assumes approximately 4 characters per token
- Credit estimation uses a flat factor of 0.02 credits per token
- Both are heuristic pre-flight numbers and are superseded by `actualCredits` after a real run

Studio display: estimated tokens, estimated credits, and character count.

---

## Test Run Fields (`prompt_tests`)

| Field | Type | Description |
| --- | --- | --- |
| `id` | text (PK) | Prefix `ptest` |
| `userId` | text | Owner user |
| `promptId` | text | Optional source prompt |
| `versionNumber` | integer | Optional source version |
| `testName` | varchar(200) | Required run label |
| `resolvedPrompt` | text | Required prompt that was executed |
| `provider` | varchar(100) | AI provider used |
| `model` | varchar(200) | Model used |
| `estimatedTokens` | integer | Pre-flight token estimate |
| `estimatedCredits` | integer | Pre-flight credit estimate |
| `actualCredits` | integer | Settled credits after execution |
| `executionTimeMs` | integer | Server-measured run duration |
| `result` | jsonb | Executor result payload |
| `status` | varchar(50) | `pending` (default), `running`, `completed`, `failed` |
| `metadata` | jsonb | Extension data |
| `createdAt` | timestamp | Run creation time |

---

## Test Lifecycle

```
POST /api/prompts/testing/estimates        POST /api/prompts/testing
   |  { prompt }                              |  { testName, resolvedPrompt, ... }
   v                                          v
estimate()                                createTest(userId, data)
   |                                           |
   v                                           v
{ estimatedTokens, estimatedCredits }      prompt_tests row (status: pending)
                                                  |
                                                  v
                                     (executor runs resolvedPrompt against
                                      provider/model)
                                                  |
                                                  v
                              updateTest(id, { status, actualCredits,
                                              executionTimeMs, result })
```

The system currently persists test runs; the actual AI execution hand-off is performed by the consuming AI Runtime pipeline. When a run completes, the executor updates the record through `PUT /api/prompts/testing/[id]`.

---

## Test Comparison

The Prompt Studio's **Prompt Test Lab** supports side-by-side comparison:

1. Users click **Add to compare** on any test run
2. Selected runs are accumulated into a `testResults` array (deduplicated by ID)
3. A **Compare Results** panel renders each run's output, tokens, credits, duration, and created timestamp
4. Status badges color-code the state (`completed`/`success`/`passed` green, `running`/`processing`/`pending` blue, `failed`/`error` amber)

Comparison is client-side; there is no server-side diff endpoint.

---

## Test History

`listTests(userId, filters)` returns paginated history ordered by `createdAt` descending:

| Filter | Behavior |
| --- | --- |
| `promptId` | Restrict to tests of a specific prompt |
| `status` | Restrict by status |
| `page` / `limit` | Pagination (limit capped at 100, default 20) |

The studio renders the most recent 20 test runs with metadata.

---

## Stats

`getStats(userId)` returns:

```typescript
{
  totalTests: number;
  completedTests: number;   // status === "completed"
}
```

Used by the dashboard "Tests" card (`stats.totalTests`).

---

## Example Estimate Request/Response

Request:

```json
{
  "prompt": "Create a cinematic product video featuring our new laptop with golden hour lighting."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "estimatedTokens": 22,
    "estimatedCredits": 1
  }
}
```

Example create run:

```json
{
  "testName": "V1 - cinematic lighting",
  "promptId": "pprm_xxx",
  "versionNumber": 2,
  "resolvedPrompt": "Cinematic, professionally produced Create a product video...",
  "provider": "openai",
  "model": "gpt-4o",
  "estimatedTokens": 22,
  "estimatedCredits": 1
}
```

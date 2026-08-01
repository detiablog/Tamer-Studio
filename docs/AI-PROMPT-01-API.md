# AI Prompt Intelligence - API Endpoints

## Overview

The Prompt Intelligence API is exposed under `/api/prompts/*` as Next.js route handlers (App Router). There are 27 unique REST resource paths. Every endpoint requires authentication and responds with the standardized envelope.

- **Base path**: `/api/prompts`
- **Auth middleware**: `userAuthentication()` from `src/core/middleware/auth.middleware.ts`
- **Response envelope**: `successResponse` / `errorResponse` in `src/app/api/mappers/response.ts`

---

## Authentication

All endpoints use the `userAuthentication()` middleware. It is applied explicitly in each handler:

```typescript
const ctx: RequestContext = { request, params, state: {...}, method, pathname, ip };
const middlewareError = await runMiddleware([userAuthentication()], ctx);
if (middlewareError) return middlewareError;
```

Supported credential sources (per `src/core/middleware/auth.middleware.ts`):

- `Authorization: Bearer <token>`
- `better-auth` session cookie (`better-auth.session_token`)

On failure the middleware returns `401` with:

```json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Invalid or expired user session" } }
```

Handlers additionally guard with:

```typescript
const userId = ctx.state.userSession?.userId;
if (!userId) {
  return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
}
```

The `userId` is always derived from the session and never taken from request bodies or query strings.

---

## Response Formats

### Success

```typescript
{ "success": true, "data": <T>, "message?": string }
```

### Error

```typescript
{ "success": false, "error": { "code": string, "message": string, "details?": Record<string, unknown> } }
```

### Error Codes

| Code | HTTP Status | Meaning |
| --- | --- | --- |
| `UNAUTHORIZED` | 401 | Missing or invalid session |
| `VALIDATION_ERROR` | 400 | Missing/invalid request body fields |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Zod/body schema validation (from error mapper) |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Endpoint Matrix (27 Endpoints)

### Prompt Library

| # | Method | Path | Description |
| --- | --- | --- | --- |
| 1 | GET | `/api/prompts` | List user prompts with filters |
| 1 | POST | `/api/prompts` | Create a prompt |
| 2 | GET | `/api/prompts/[id]` | Get a prompt |
| 2 | PUT | `/api/prompts/[id]` | Update a prompt |
| 2 | DELETE | `/api/prompts/[id]` | Delete a prompt |
| 3 | POST | `/api/prompts/[id]/favorite` | Set favorite flag |
| 4 | POST | `/api/prompts/[id]/pin` | Set pinned flag |
| 5 | POST | `/api/prompts/[id]/archive` | Set archived flag |
| 6 | GET | `/api/prompts/stats` | Library statistics |

### Collections

| # | Method | Path | Description |
| --- | --- | --- | --- |
| 7 | GET | `/api/prompts/collections` | List collections |
| 7 | POST | `/api/prompts/collections` | Create a collection |
| 8 | PUT | `/api/prompts/collections/[id]` | Update a collection |
| 8 | DELETE | `/api/prompts/collections/[id]` | Delete a collection |

### Variables

| # | Method | Path | Description |
| --- | --- | --- | --- |
| 9 | GET | `/api/prompts/variables` | List variables |
| 9 | POST | `/api/prompts/variables` | Create a variable |
| 10 | PUT | `/api/prompts/variables/[id]` | Update a variable |
| 10 | DELETE | `/api/prompts/variables/[id]` | Delete a variable |
| 11 | POST | `/api/prompts/render` | Render placeholders in text |

### Templates

| # | Method | Path | Description |
| --- | --- | --- | --- |
| 12 | GET | `/api/prompts/templates` | List system templates |
| 12 | POST | `/api/prompts/templates` | Create a template |
| 13 | GET | `/api/prompts/templates/[id]` | Get a template |
| 13 | PUT | `/api/prompts/templates/[id]` | Update a template |
| 13 | DELETE | `/api/prompts/templates/[id]` | Delete a template |

### Testing

| # | Method | Path | Description |
| --- | --- | --- | --- |
| 14 | GET | `/api/prompts/testing` | List test runs |
| 14 | POST | `/api/prompts/testing` | Create a test run |
| 15 | POST | `/api/prompts/testing/estimates` | Estimate tokens/credits |
| 16 | GET | `/api/prompts/testing/[id]` | Get a test run |
| 16 | PUT | `/api/prompts/testing/[id]` | Update a test run |
| 16 | DELETE | `/api/prompts/testing/[id]` | Delete a test run |

### History

| # | Method | Path | Description |
| --- | --- | --- | --- |
| 17 | GET | `/api/prompts/history` | List prompt execution history |
| 17 | POST | `/api/prompts/history` | Record a history entry |
| 18 | GET | `/api/prompts/history/stats` | History aggregation |

### Settings

| # | Method | Path | Description |
| --- | --- | --- | --- |
| 19 | GET | `/api/prompts/settings` | Get user settings (auto-create defaults) |
| 19 | POST | `/api/prompts/settings` | Upsert user settings |

### Intelligence Operations

| # | Method | Path | Description |
| --- | --- | --- | --- |
| 20 | POST | `/api/prompts/analyze` | Run the prompt analyzer |
| 21 | POST | `/api/prompts/optimize` | Optimize a prompt |
| 22 | POST | `/api/prompts/validate` | Validate a prompt |
| 23 | POST | `/api/prompts/enrich` | Enrich with variables and creative context |

### Versioning

| # | Method | Path | Description |
| --- | --- | --- | --- |
| 24 | GET | `/api/prompts/[id]/versions` | List prompt versions |
| 25 | GET | `/api/prompts/[id]/versions/[versionId]` | Get a specific version |
| 26 | POST | `/api/prompts/versions` | Create a version explicitly |
| 27 | POST | `/api/prompts/[id]/rollback` | Roll back a prompt to a version |

---

## Detailed Specifications

### 1. GET /api/prompts

Query parameters:

| Param | Type | Description |
| --- | --- | --- |
| `type` | string | Filter by prompt type |
| `category` | string | Filter by category |
| `search` | string | `LIKE` match on name/content |
| `collectionId` | string | Filter by collection |
| `isFavorite` | boolean | Filter favorites |
| `isPinned` | boolean | Filter pinned |
| `isArchived` | boolean | Filter archived |
| `page` | number | Page number (default 1) |
| `limit` | number | Page size (default 20, max 100) |

Response (`successResponse(result)`):

```json
{
  "success": true,
  "data": {
    "data": [ { "id": "pprm_...", "name": "...", "content": "...", "type": "image", "versionNumber": 3, "...": "" } ],
    "total": 12,
    "page": 1,
    "limit": 20
  }
}
```

### 2. POST /api/prompts

Body:

```json
{
  "name": "Product launch hero",
  "description": "Optional",
  "content": "A cinematic hero shot of {{product_name}}...",
  "type": "image",
  "category": "marketing",
  "tags": ["hero", "launch"],
  "variables": ["product_name"],
  "collectionId": "pcol_...",
  "isPublic": false
}
```

Required: `name`, `content`. Returns `201` with the created prompt (`versionNumber` = 1).

### 3. GET /api/prompts/[id]

Returns the prompt or `404 NOT_FOUND`.

### 4. PUT /api/prompts/[id]

Body accepts any prompt field. If `content` is set and differs from the current content, the service creates a version snapshot ("Updated content") and increments `versionNumber`; otherwise it updates metadata only.

### 5. DELETE /api/prompts/[id]

Deletes the prompt and its versions. Returns `{ "deleted": true }`.

### 6. POST /api/prompts/[id]/favorite | pin | archive

Body: `{ "isFavorite": true }` / `{ "isPinned": true }` / `{ "isArchived": true }` (boolean required). Returns the updated prompt or `404`.

### 7. GET/POST /api/prompts/collections

- GET: returns the user's collections (pinned first, then by name)
- POST body: `{ "name": "...", "description?": "...", "color?": "#hex" }` (name required, `201`)

### 8. PUT/DELETE /api/prompts/collections/[id]

- PUT: update collection fields
- DELETE: detaches prompts (`collection_id = NULL`) then deletes the collection

### 9. GET/POST /api/prompts/variables

- GET query: `search`, `category`, `page`, `limit` (default 50, max 200)
- POST body: `{ "name": "...", "key": "...", "value": "...", "description?": "...", "category?": "..." }` (all of name/key/value required, `201`)

### 10. PUT/DELETE /api/prompts/variables/[id]

- PUT: update any variable field
- DELETE: remove the variable

### 11. POST /api/prompts/render

Body:

```json
{ "prompt": "Hello {{name}}!", "variables": { "name": "World" } }
```

Response:

```json
{
  "success": true,
  "data": { "rendered": "Hello World!", "unresolved": [], "used": ["name"] }
}
```

### 12. GET/POST /api/prompts/templates

- GET query: `type`, `category`, `search`, `page`, `limit` (default 50, max 200); only `is_active = true` templates, ordered by `usage_count` desc
- POST body: `{ "name": "...", "content": "...", "type": "...", "description?", "category?", "variables?", "tags?", "isSystem?" }` (name/content/type required, `201`)

### 13. GET/PUT/DELETE /api/prompts/templates/[id]

Standard CRUD. PUT accepts any template field; DELETE returns `{ "deleted": true }`.

### 14. GET/POST /api/prompts/testing

- GET query: `promptId`, `status`, `page`, `limit` (default 20, max 100); ordered by `created_at` desc
- POST body: `{ "testName": "...", "resolvedPrompt": "...", "promptId?", "versionNumber?", "provider?", "model?", "estimatedTokens?", "estimatedCredits?", "metadata?" }` (testName/resolvedPrompt required, `201`)

### 15. POST /api/prompts/testing/estimates

Body: `{ "prompt": "..." }` (required). Response:

```json
{ "success": true, "data": { "estimatedTokens": 22, "estimatedCredits": 1 } }
```

### 16. GET/PUT/DELETE /api/prompts/testing/[id]

Standard CRUD. PUT accepts any test field (used to settle `status`, `actualCredits`, `executionTimeMs`, `result`).

### 17. GET/POST /api/prompts/history

- GET query: `promptId`, `status`, `page`, `limit` (default 50, max 200); ordered by `created_at` desc
- POST body: `{ "resolvedPrompt": "...", "promptId?", "versionNumber?", "provider?", "model?", "creditsUsed?", "executionTimeMs?", "resultReference?", "projectReference?", "status?", "metadata?" }` (resolvedPrompt required, `201`)

### 18. GET /api/prompts/history/stats

Response:

```json
{
  "success": true,
  "data": {
    "totalHistory": 120,
    "totalCreditsUsed": 340,
    "byProvider": [ { "provider": "openai", "count": 80 }, { "provider": "anthropic", "count": 40 } ]
  }
}
```

### 19. GET/POST /api/prompts/settings

- GET: returns existing settings or auto-creates defaults:
  ```json
  { "autoOptimize": true, "autoInjectContext": true, "autoValidate": true,
    "defaultType": "custom", "maxPromptLength": 4000,
    "showQualityScore": true, "notificationEnabled": true }
  ```
- POST: upserts the same fields (partial updates allowed)

### 20. POST /api/prompts/analyze

Body: `{ "prompt": "...", "type?": "image" }` (prompt required).

Response (full `PromptAnalysis`):

```json
{
  "success": true,
  "data": {
    "qualityScore": 72,
    "length": 128,
    "wordCount": 24,
    "clarity": 78,
    "structure": 80,
    "contextScore": 60,
    "ambiguityScore": 76,
    "estimatedTokens": 32,
    "issues": [],
    "suggestions": ["Add a stylistic guide..."],
    "strengths": ["Lighting conditions are described."],
    "hasVariables": true,
    "hasInjectionsNeeded": true,
    "riskLevel": "low"
  }
}
```

### 21. POST /api/prompts/optimize

Body: `{ "prompt": "...", "type?": "custom" }`.

Response:

```json
{
  "success": true,
  "data": {
    "original": "...",
    "optimized": "...",
    "changes": ["Capitalized the first letter.", "Added sentence termination."],
    "scoreBefore": 58,
    "scoreAfter": 66,
    "improvement": 8
  }
}
```

### 22. POST /api/prompts/validate

Body: `{ "prompt": "...", "type?": "...", "availableVariables?": ["brand_name", "..."] }`.

Response:

```json
{
  "success": true,
  "data": {
    "valid": true,
    "issues": [ { "code": "BROKEN_VARIABLE", "message": "Variable '{{x}}' is not defined.", "severity": "error" } ],
    "warnings": 0,
    "errors": 0
  }
}
```

Validation codes: `EMPTY`, `TOO_LONG`, `BROKEN_VARIABLE`, `UNSAFE`, `LOW_QUALITY`. `valid` is `false` when `errors > 0`.

### 23. POST /api/prompts/enrich

Body:

```json
{
  "prompt": "...",
  "moduleType": "marketing",
  "projectId": "prj_...",
  "storyId": "sto_...",
  "variables": { "cta": "Shop now" }
}
```

Response (`EnrichedPrompt`):

```json
{
  "success": true,
  "data": {
    "prompt": "[Brand Identity]...\n\n<resolved prompt>",
    "injectedContext": ["Creative memory brand/style context injected", "Project: ...", "Story: ..."],
    "resolvedVariables": { "cta": "Shop now" },
    "metadata": { "extractedKeys": ["cta"], "hadCreativeContext": true }
  }
}
```

### 24. GET /api/prompts/[id]/versions

Returns all versions of a prompt ordered by `versionNumber` descending.

### 25. GET /api/prompts/[id]/versions/[versionId]

Returns one version or `404`.

### 26. POST /api/prompts/versions

Body: `{ "promptId": "...", "content": "...", "versionNumber?": 4, "changes?": "Optimized variant" }`. Requires an existing prompt; `versionNumber` defaults to `prompt.versionNumber + 1`. Returns `201` with the version.

### 27. POST /api/prompts/[id]/rollback

Body: `{ "versionId": "pver_..." }`. Verifies the version belongs to the prompt, sets the prompt content, and increments `versionNumber`. Returns `404` when the prompt or a mismatched version is supplied.

---

## Notes

- All lists are paginated and return `{ data, total, page, limit }` directly in the envelope `data` (not via `paginatedResponse`).
- POST creation endpoints return HTTP `201`; all other success returns are `200`.
- There is no client-supplied `userId` anywhere; ownership comes from the authenticated session.
- Related but separate API families (not part of the 27): `/api/image-studio/prompts` (Image Studio prompt library) and `/api/ai/prompts` (AI Runtime prompt templates).

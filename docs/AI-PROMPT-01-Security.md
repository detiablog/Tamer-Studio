# AI Prompt Intelligence - Security Review

## Overview

The Prompt Intelligence system applies a defense-in-depth security model: authenticated sessions gate every endpoint, all data is user-scoped in the database, and service methods consistently thread `userId` through their queries. This document reviews user isolation, ownership validation, and access control.

---

## User Isolation

### Data Scoping

Every user-owned table carries a `user_id` column and all list/aggregate queries filter by it:

| Table | Isolation Column |
| --- | --- |
| `prompt_library` | `user_id` |
| `prompt_variables` | `user_id` |
| `prompt_versions` | `user_id` |
| `prompt_history` | `user_id` |
| `prompt_collections` | `user_id` |
| `prompt_tests` | `user_id` |
| `prompt_analytics` | `user_id` |
| `prompt_settings` | `user_id` (UNIQUE) |

`prompt_templates` is intentionally NOT user-scoped: it is a global system catalog of active templates.

Representative list query:

```typescript
const conditions = [eq(promptLibrary.userId, userId)];
if (filters?.type) conditions.push(eq(promptLibrary.type, filters.type));
// ...
const where = and(...conditions);
db.select().from(promptLibrary).where(where);
```

### No Client-Supplied User Identity

- No endpoint accepts `userId` from the body or query string
- The identity always comes from the authenticated session:

```typescript
const userId = ctx.state.userSession?.userId;
if (!userId) {
  return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
}
```

### Session-Based Authentication

- All 27 resource paths run the `userAuthentication()` middleware (`src/core/middleware/auth.middleware.ts`)
- The middleware validates the session via `getServerSession` (Better Auth), populating `ctx.state.userSession`
- Missing/invalid tokens or cookies yield `401 UNAUTHORIZED`
- Requests without a `userId` state are rejected a second time in the handler guard

---

## Ownership Validation

### Service Layer

Collection-oriented service methods scope by `userId`:

```typescript
listPrompts(userId, filters)
createPrompt(userId, data)
listCollections(userId)
createCollection(userId, data)
listVariables(userId, filters)
createVariable(userId, data)
recordHistory(userId, data)
listHistory(userId, filters)
listTests(userId, filters)
createTest(userId, data)
enrichPrompt(userId, prompt, options)
getStats(userId)
```

### API Layer

All handlers extract `userId` from the session and reject when absent:

```typescript
const userId = ctx.state.userSession?.userId;
if (!userId) {
  return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
}
```

### ID-Based Operations (Gap)

ID-keyed operations do NOT re-validate `userId`:

```typescript
getPrompt(id)                 // select by id only
updatePrompt(id, data)        // update by id only
deletePrompt(id)              // delete by id only
toggleFavorite(id, flag)      // by id only
togglePin(id, flag)           // by id only
toggleArchive(id, flag)       // by id only
rollbackVersion(id, versionId)
getVersion(id)
updateTemplate(id, data)      // templates are global by design
updateVariable(id, data)
deleteVariable(id)
updateTest(id, data)
getTest(id)
deleteTest(id)
updateCollection(id, data)
deleteCollection(id)
```

**Risk**: A user who knows another user's generated ID could read or mutate that resource. The IDs are prefixed random strings (`pprm_`, `pver_`, `pcol_`, `pvar_`, `ptest_`, `panl`, `phist`, `pset`, `ptmpl`) generated as `{prefix}_{timestamp36}_{16 random hex}`, making them hard to guess, which mitigates (but does not eliminate) the risk.

**Mitigation / Recommendation**:

- Add `and(eq(promptLibrary.userId, userId))` to the WHERE clause of every ID-based read/write, with `userId` threaded from the caller
- Alternative: introduce a shared ownership guard (e.g., an `assertOwned(model, id, userId)` helper) reused by all prompt-intelligence services
- The `updatePrompt` content-change path should validate ownership BEFORE creating a version snapshot, so that a forged update cannot write extraneous `prompt_versions` rows

### Version Ownership

`POST /api/prompts/versions` uses the caller's `userId` from the session for the new version row and verifies the prompt exists, but it does not verify the prompt belongs to `userId`. The same `and(promptId, userId)` guard should be applied here.

### Template Scope

Templates are global; the create/update/delete template routes require authentication but not user-level ownership. This is by design for the system catalog and is only reachable by authenticated users. If per-tenant template gating is ever needed, an `isPublic`/visibility model must be introduced alongside `isSystem`.

---

## Access Control

### Endpoint Authorization

- All endpoints: session-based user authentication required
- No role escalation is exposed in the prompt API surface: every handler uses `userAuthentication()`, not admin authentication
- CSRF protection and rate-limit middleware are available in the middleware pipeline and can be composed onto these routes as part of the platform's frontend protection

### Content Safety Filtering

The system itself enforces content-level guards:

- `PromptValidatorService.validate()` rejects prompts containing unsafe patterns:

  ```
  (nsfw|illegal|harm|exploit|bypass|vulgar)/i
  ```

  Emitting `UNSAFE` (severity `error`), which drives `valid = false`

- `PromptAnalyzerService` flags the same class of content (`nsfw|nude|gore|explicit|illegal|harm|intimate|unsafe`) and raises `riskLevel` to `high`

### Variable Isolation

- Variables are resolved with a hard `eq(promptVariables.userId, userId)` filter in `resolveVariableValues`, so one user's prompts can never resolve another user's stored values
- `DEFAULT_VARIABLES` are process constants, not stored user data

### History and Analytics

- `recordHistory` always stamps the session `userId`
- `getStats(userId)` aggregates only that user's rows
- `prompt_analytics` metric rows are likewise user-scoped on insert and on aggregation

### Context Injection

- `enrichPrompt` resolves Creative Memory only for the authenticated `userId` via `buildPromptContext(userId, moduleType)`; cross-user memory leakage is not possible through this path

---

## Summary of Residual Risks

| Risk | Severity | Status |
| --- | --- | --- |
| ID-based operations lack userId ownership checks | Medium | Known limitation; mitigated by unguessable IDs |
| Explicit version creation does not verify prompt ownership | Medium | Known limitation |
| Template endpoints are authenticated but global | Low | By design (system catalog) |

These items are enumerated in the Final Report's Known Limitations and are the top priority for the next hardening sprint.

# AI Prompt Intelligence - Versioning

## Overview

Prompt versioning snapshots the content of every prompt in the library. Each content-changing update creates an immutable `prompt_versions` row while incrementing the `versionNumber` on the prompt. Users can browse the full history of a prompt, view any snapshot, and roll the current prompt back to a previous version.

- **Implemented In**: `src/core/prompt-intelligence/prompt-library.service.ts` (version methods live here)
- **Endpoints**:
  - `GET /api/prompts/[id]/versions`
  - `GET /api/prompts/[id]/versions/[versionId]`
  - `POST /api/prompts/versions` (explicit version creation)
  - `POST /api/prompts/[id]/rollback`

---

## Version Structure

A version row in `prompt_versions`:

| Field | Type | Description |
| --- | --- | --- |
| `id` | text (PK) | Prefix `pver` |
| `promptId` | text | Owning prompt ID (required) |
| `userId` | text | Owner user (required) |
| `versionNumber` | integer | Monotonic per-prompt sequence |
| `content` | text | Full snapshot of the prompt text |
| `changes` | text | Optional human-readable change note |
| `qualityScore` | integer | Quality score recorded at snapshot time |
| `metadata` | jsonb | Extension data |
| `createdAt` | timestamp | Snapshot timestamp |

Versions are immutable: none of the CRUD surfaces exposes an update or delete path for individual versions (only the parent prompt's delete cleans them up).

---

## Version Creation

### Automatic (on update)

When the library prompt is updated with a different `content`, the service:

```typescript
await this.createVersion(id, prompt.userId, content, prompt.versionNumber + 1, "Updated content");
await db.update(promptLibrary)
  .set({ content, versionNumber: sql`${promptLibrary.versionNumber} + 1`, ...restData, updatedAt: new Date() })
  .where(eq(promptLibrary.id, id));
```

Auto-created versions use the change note `"Updated content"`. The new prompt version number is the old version number + 1.

### Manual (explicit)

`POST /api/prompts/versions` requires `promptId` and `content`. The route resolves the prompt's current `versionNumber` and records:

```typescript
createVersion(body.promptId, userId, body.content, body.versionNumber ?? prompt.versionNumber + 1, body.changes)
```

This is available to callers that want to persist a snapshot without altering the prompt content (for example, an optimized or enriched variant).

---

## Version Sequence Diagram

```
createPrompt        versionNumber = 1
   |
   v
updatePrompt (content changes)
   |-- createVersion(..., versionNumber + 1, "Updated content")
   |-- prompt.versionNumber += 1
   v
updatePrompt (content changes)
   |-- createVersion(..., versionNumber + 1, "Updated content")
   |-- prompt.versionNumber += 1
   v
POST /api/prompts/versions (explicit)
   |-- createVersion(..., prompt.versionNumber + 1, changes)
   v
POST /api/prompts/[id]/rollback { versionId }
   |-- prompt.content = version.content
   |-- prompt.versionNumber += 1
   v
(listVersions is always ordered by versionNumber DESC)
```

---

## Rollback

`rollbackVersion(id, versionId)`:

1. Loads the prompt by `id`
2. Loads the version by `versionId`
3. Verifies `version.promptId === id` (invalid versions return `null`, mapping to a `404`)
4. Updates the prompt: `content = version.content`, and increments `versionNumber` by one
5. Returns the updated prompt

Rollback does NOT create a new snapshot of the pre-rollback content. The rolled-back prompt becomes a new current version, and the full history remains available from `prompt_versions`.

---

## Version Comparison

The system exposes full content snapshots rather than diffs. Comparing versions is done by:

1. Fetching `GET /api/prompts/[id]/versions` (newest first)
2. Fetching two specific versions via `GET /api/prompts/[id]/versions/[versionId]`
3. Comparing their `content`, `qualityScore`, and `createdAt` client-side

The Prompt Studio renders each version's content in a `<pre>` block along with `versionNumber`, `createdAt`, `changes`/`message`, and a "Current" badge for the prompt's active version. There is no server-side text-diff endpoint in the current implementation; it is a documented future enhancement.

---

## Deletion

Deleting a prompt cascades to its versions in the service layer:

```typescript
async deletePrompt(id: string) {
  await db.delete(promptVersions).where(eq(promptVersions.promptId, id));
  await db.delete(promptLibrary).where(eq(promptLibrary.id, id));
}
```

No foreign-key `ON DELETE` cascade is declared in the schema; the service handles the cleanup.

---

## Prompt Studio Surface

The `versions` tab:

- Lets the user select a prompt (up to the first 10 prompts)
- Loads `/api/prompts/[id]/versions`
- Renders each snapshot with content and metadata
- Allows opening a detail modal
- Provides a **Rollback** action (`POST /api/prompts/[id]/rollback` with `{ versionId }`) on any non-current version

---

## Indexes

- `prompt_ver_prompt_idx` on `promptId`
- `prompt_ver_user_idx` on `userId`

These support the prompt-scoped `listVersions` and user-scoped stats queries.

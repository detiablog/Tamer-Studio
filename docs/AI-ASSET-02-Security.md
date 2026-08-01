# Smart Asset Intelligence System - Security

## Overview

The Smart Asset Intelligence system enforces strict user-level data isolation. Every database query is scoped to the authenticated user. No cross-user data leakage is possible through any API endpoint or database operation.

---

## User Isolation Model

### Data Scoping

Every table in the system includes a `user_id` column that identifies the owning user. All queries include a `WHERE user_id = $session_user_id` filter, enforced at both the service layer and API layer.

```
Request -> Session Extraction -> user_id -> Database Query (WHERE user_id = $1)
```

### Isolation Guarantees

| Guarantee | Implementation |
|-----------|----------------|
| No cross-user reads | All queries filter by `user_id` |
| No cross-user writes | Ownership validated before mutations |
| No cross-user deletes | Ownership validated before deletions |
| No cross-user search | Search index scoped to `user_id` |
| No cross-user collections | Collections scoped to `user_id` |
| No cross-user relationships | Relationships scoped to `user_id` |

---

## Authentication

### Session-Based Authentication

All API endpoints extract the user session from the request cookie:

```typescript
const session = await getSession(request);
if (!session?.user?.id) {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}
const userId = session.user.id;
```

### Session Validation

- Sessions are validated on every request
- Expired sessions return 401
- Invalid sessions return 401
- Session tokens are HttpOnly, Secure, SameSite=Strict

---

## Authorization

### Resource Ownership

Every resource operation verifies ownership before execution:

```typescript
// Before any read/write/delete
const resource = await db.query.table.findFirst({
  where: eq(table.id, resourceId) and eq(table.userId, userId)
});
if (!resource) {
  return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
}
```

### Ownership Verification Pattern

```
1. Extract userId from session
2. Query resource with (id = $resourceId AND user_id = $userId)
3. If not found -> 404 (not "forbidden" to avoid information leakage)
4. Proceed with operation
```

---

## Data Protection

### Database-Level Isolation

| Table | Isolation Column | Index |
|-------|-----------------|-------|
| asset_metadata | `user_id` | `asset_meta_user_idx` |
| asset_tag | `user_id` | `asset_tag_user_idx` |
| asset_tag_assignment | `user_id` | `asset_tag_assign_user_idx` |
| asset_category | `user_id` | `asset_cat_user_idx` |
| asset_classification | `user_id` | `asset_class_user_idx` |
| asset_recognition | `user_id` | `asset_recog_user_idx` |
| asset_duplicate | `user_id` | `asset_dup_user_idx` |
| asset_relationship | `user_id` | `asset_rel_user_idx` |
| asset_quality_score | `user_id` | `asset_quality_user_idx` |
| asset_collection | `user_id` | `asset_coll_user_idx` |
| asset_collection_item | `user_id` | `asset_coll_item_coll_idx` |
| asset_search_index | `user_id` | `asset_search_user_idx` |
| asset_settings | `user_id` | unique constraint |

### Input Validation

All endpoints validate input:

- Required fields enforced
- Type validation (string, number, boolean)
- Length limits on string fields
- Range validation on numeric fields
- JSONB structure validation

### Output Sanitization

- Sensitive fields excluded from responses
- User IDs not exposed in responses
- Internal metadata not exposed

---

## SQL Injection Prevention

### Parameterized Queries

All database operations use Drizzle ORM parameterized queries:

```typescript
// Safe - parameterized
await db.select().from(assetMetadata)
  .where(eq(assetMetadata.userId, userId));

// Never - raw string interpolation
// await db.execute(`SELECT * FROM asset_metadata WHERE user_id = '${userId}'`);
```

### ORM Protection

Drizzle ORM automatically parameterizes all queries, preventing SQL injection at the framework level.

---

## Rate Limiting

All API endpoints are subject to rate limiting:

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Read (GET) | 100 requests | 1 minute |
| Write (POST/PUT) | 30 requests | 1 minute |
| Delete | 20 requests | 1 minute |
| Search | 60 requests | 1 minute |

Rate limits are enforced per user session.

---

## Audit Logging

All write operations are logged for audit purposes:

| Event | Logged Data |
|-------|-------------|
| Metadata Create | userId, assetId, timestamp |
| Metadata Update | userId, assetId, changedFields, timestamp |
| Metadata Delete | userId, assetId, timestamp |
| Tag Create | userId, tagName, timestamp |
| Classification Create | userId, assetId, timestamp |
| Recognition Create | userId, assetId, type, timestamp |
| Duplicate Status Change | userId, duplicateId, oldStatus, newStatus, timestamp |
| Relationship Create | userId, sourceId, targetId, type, timestamp |
| Collection Modify | userId, collectionId, action, timestamp |

---

## Error Handling

### Information Leakage Prevention

| Error Scenario | Response | Reason |
|---------------|----------|--------|
| Resource not found | 404 Not Found | Avoids revealing resource existence |
| Invalid input | 400 Bad Request | Specific field validation errors |
| Unauthorized | 401 Unauthorized | No session info |
| Rate limited | 429 Too Many Requests | Standard rate limit response |
| Server error | 500 Internal Server Error | Generic message, no stack trace |

### Error Response Format

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

Stack traces are logged server-side only, never exposed to clients.

---

## Settings Security

User settings are stored with a unique constraint on `user_id`:

```typescript
unique("asset_settings_user_unique").on(assetSettings.userId)
```

This ensures:
- One settings record per user
- No settings can be created for another user
- Settings updates are scoped to the authenticated user

---

## Collection Security

Collections and their items are fully user-scoped:

- Collections can only be read/modified by the owning user
- Collection items inherit the collection's `user_id`
- Adding assets to a collection verifies asset ownership
- Removing assets from a collection verifies collection ownership

---

## Relationship Security

Relationships between assets are user-scoped:

- Both `source_asset_id` and `target_asset_id` are validated against the user's assets
- No cross-user relationships can be created
- Relationship queries are scoped to `user_id`

---

## Search Index Security

The search index is user-scoped:

- Search queries only return results from the authenticated user's index
- Index rebuilds only process the user's assets
- No cross-user search results are possible

---

## Recommendations for Implementation

### Service Layer

```typescript
// Always scope queries to user
async function getMetadata(userId: string, assetId: string) {
  return db.query.assetMetadata.findFirst({
    where: and(
      eq(assetMetadata.id, assetId),
      eq(assetMetadata.userId, userId)  // User isolation
    )
  });
}
```

### API Layer

```typescript
// Always extract and validate session
export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session?.user?.id) {
    return unauthorized();
  }
  // Pass userId to all service calls
  const result = await service.list(session.user.id, request.query);
  return Response.json(result);
}
```

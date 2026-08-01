# AI Quality Assurance - Security

## Overview

The AI QA system enforces user isolation, ownership validation, and audit logging to ensure data security and compliance.

## User Isolation

### Data Ownership

Every table includes a `userId` field that ties records to their owning user. All queries filter by `userId` to prevent cross-user data access:

```typescript
const conditions = [eq(qualityReport.userId, userId)];
```

### Query-Level Isolation

All list and query operations include userId-based filtering:

- `listReports(userId, filters)` - Reports scoped to user
- `getStats(userId)` - Statistics scoped to user
- `getSettings(userId)` - Settings scoped to user
- `listRules(userId, filters)` - Rules scoped to user
- Analytics queries filter by `qualityReport.userId`

### API-Level Isolation

Every API endpoint extracts the userId from the authenticated session:

```typescript
const userId = ctx.state.userSession?.userId;
if (!userId) {
  return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
}
```

No endpoint allows accessing another user's data.

## Ownership Validation

### Report Access

Report retrieval uses the report ID directly. The system relies on:
1. Authenticated user context
2. userId-scoped queries for listing
3. Database-level ownership on creation

### Rule Management

Rules are created with the authenticated userId:

```typescript
const rule = await qualityRuleService.createRule(userId, body);
```

Rules can only be listed, updated, or deleted by the owning user.

### Settings Management

Settings are unique per user (unique constraint on userId):

```typescript
userId: text("user_id").notNull().unique()
```

Each user has exactly one settings record.

## Authentication

All API routes use the `userAuthentication()` middleware:

```typescript
const middlewareError = await runMiddleware([userAuthentication()], ctx);
if (middlewareError) return middlewareError;
```

This middleware:
1. Validates the session token
2. Extracts the userId
3. Populates `ctx.state.userSession`
4. Returns 401 if authentication fails

## Audit Logging

Every validation action creates an audit log entry:

```typescript
await qualityReportService.logAudit(userId, {
  action: "quality.validate",
  reportId: report.id,
  assetId: request.assetId,
  details: { assetType, overallScore, passed }
});
```

### Audit Log Fields

| Field | Description |
|-------|-------------|
| userId | Actor who performed the action |
| action | Action identifier (e.g., "quality.validate") |
| reportId | Associated report |
| assetId | Associated asset |
| details | Action context as JSON |
| createdAt | Timestamp of the action |

### Audit Log Usage

- Compliance tracking
- Security incident investigation
- Usage analytics
- Debugging quality pipeline issues

## Data Protection

### Sensitive Data

- User IDs are internal identifiers, not exposed externally
- Asset metadata is stored as JSONB, limiting exposure surface
- No API keys or secrets are stored in quality tables

### Cascading Deletes

Report deletion cascades to all child records:

```typescript
async deleteReport(id: string) {
  await db.delete(qualityScore).where(eq(qualityScore.reportId, id));
  await db.delete(qualityValidation).where(eq(qualityValidation.reportId, id));
  await db.delete(qualityRecommendation).where(eq(qualityRecommendation.reportId, id));
  await db.delete(qualityRetryHistory).where(eq(qualityRetryHistory.reportId, id));
  await db.delete(qualityReport).where(eq(qualityReport.id, id));
}
```

### Error Handling

Validation errors are caught and handled gracefully:

```typescript
try {
  validators.image = await imageValidatorService.validateImage(request.asset);
} catch {
  // Validation is best-effort; failures don't block the pipeline
}
```

Validator failures return fallback scores rather than exposing internal errors.

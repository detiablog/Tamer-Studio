# AUTO-01: Security

## Overview

The Automation Center implements a multi-layered security model based on user isolation, authentication middleware, and data access controls. All operations are scoped to the authenticated user.

## User Isolation

Every automation resource is scoped to a user via the `userId` field. The system enforces strict user isolation at the database query level.

### Database-Level Isolation

All queries filter by `userId`:

```typescript
// Rule listing
const conditions = [eq(automationRule.userId, userId)];

// Execution listing
const conditions = [eq(automationExecution.userId, userId)];

// Event listing
const conditions = [eq(automationEvent.userId, userId)];
```

### API-Level Isolation

Every API endpoint extracts the user ID from the authenticated session:

```typescript
const userId = ctx.state.userSession?.userId;
if (!userId) {
  return NextResponse.json(errorResponse("UNAUTHORIZED", "Unauthorized"), { status: 401 });
}
```

The `userId` is never accepted from the request body -- it is always derived from the session token.

### Cross-User Access Prevention

- Users cannot access, modify, or delete resources owned by other users
- Queue items, schedules, and reports are all filtered by `userId`
- Template usage creates rules owned by the requesting user

## Permission Model

### Authentication Middleware

All endpoints use the `userAuthentication` middleware:

```typescript
const middlewareError = await runMiddleware([userAuthentication()], ctx);
if (middlewareError) return middlewareError;
```

The middleware:
1. Validates the session token
2. Extracts the user ID
3. Populates `ctx.state.userSession`
4. Rejects unauthenticated requests with 401

### Operation Permissions

| Operation | Requirement |
|---|---|
| Create rule | Authenticated user |
| Read rule | Rule owner |
| Update rule | Rule owner |
| Delete rule | Rule owner |
| Toggle rule | Rule owner |
| Execute rule | Rule owner |
| Create schedule | Authenticated user |
| Read schedule | Schedule owner |
| Update schedule | Schedule owner |
| Delete schedule | Schedule owner |
| Toggle schedule | Schedule owner |
| Enqueue execution | Authenticated user |
| Dequeue execution | Authenticated user (own queue) |
| Generate report | Authenticated user |
| Read report | Report owner |
| Delete report | Report owner |
| Read settings | Settings owner |
| Update settings | Settings owner |

### System Templates

System templates (`isSystem: true`) are read-only for users. Only system administrators can create or modify system templates.

## Audit Logging

### Execution History

Every automation execution is recorded with:
- User ID
- Rule ID (if applicable)
- Trigger type and data
- Condition evaluation results
- Action execution results
- Credit usage
- Timestamps (started, completed)
- Error details

### Event Logging

All system events are recorded in the `automation_event` table with:
- User ID
- Event type
- Source module
- Entity references
- Event data
- Processing state
- Timestamps

### Settings Changes

Settings updates are recorded via the `updatedAt` timestamp, providing an audit trail for configuration changes.

## Data Protection

### Sensitive Data

- **Webhook secrets**: Stored in `triggerConfig.config` as JSONB; not exposed in list operations
- **User IDs**: Never logged in plaintext; used only for query filtering
- **Credit information**: Aggregated in statistics; individual credit usage tied to execution records

### Input Validation

- Rule names are limited to 200 characters
- Search queries are parameterized to prevent SQL injection
- JSONB fields are type-checked via Drizzle schema
- Pagination limits are capped at 100 items per page

### Rate Limiting

All endpoints are subject to global rate limiting to prevent abuse. Rate limit headers are included in responses.

## Session Management

- Sessions are managed by the `userAuthentication` middleware
- Session tokens are validated on every request
- Invalid or expired sessions result in 401 responses
- No long-lived tokens are stored in the automation system

## Security Considerations

### Queue Manipulation

- Users can only dequeue items from their own queue
- Priority changes are scoped to the user's queue
- Queue clearing only affects the user's items

### Template Abuse

- System templates cannot be modified by regular users
- Template usage is rate-limited per user
- Template-to-rule conversion creates rules owned by the requesting user

### Event Spoofing

- Events are recorded with the authenticated user's ID
- Event type and data are validated at the API level
- Processed events cannot be reprocessed without explicit re-triggering

# BETA-01: API

## Scope

Complete API reference for all 23 beta program endpoints, including request/response formats, authentication requirements, and error handling.

## Architecture

### Authentication

All beta API endpoints require authentication via the `userAuthentication` middleware. Requests must include valid session credentials.

### Request Context

Every handler initializes a `RequestContext` with:

```typescript
const ctx: RequestContext = {
  request,
  params: await params,
  state: {
    rateLimit: undefined,
    origin: undefined,
    adminSession: undefined,
    userSession: undefined,
    authError: undefined,
    permissionError: undefined,
    csrfError: undefined,
    rateLimitError: undefined,
    auditContext: undefined,
  },
  method: "METHOD",
  pathname: request.nextUrl.pathname,
  ip: request.headers.get("x-real-ip") || undefined,
};
```

### Response Format

All responses use the `successResponse` or `errorResponse` mapper:

```json
{
  "success": true,
  "data": { ... }
}
```

### Endpoints

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 1 | GET | `/api/beta/overview` | Aggregate overview |
| 2 | GET | `/api/beta/invitations` | List invitations |
| 3 | POST | `/api/beta/invitations` | Create invitation |
| 4 | GET | `/api/beta/invitations/[id]` | Get invitation |
| 5 | DELETE | `/api/beta/invitations/[id]` | Delete invitation |
| 6 | POST | `/api/beta/invitations/[id]/revoke` | Revoke invitation |
| 7 | GET | `/api/beta/users` | List users |
| 8 | POST | `/api/beta/users` | Register user |
| 9 | GET | `/api/beta/users/[id]` | Get user |
| 10 | PUT | `/api/beta/users/[id]` | Update user status |
| 11 | DELETE | `/api/beta/users/[id]` | Delete user |
| 12 | GET | `/api/beta/feedback` | List feedback |
| 13 | POST | `/api/beta/feedback` | Submit feedback |
| 14 | GET | `/api/beta/feedback/[id]` | Get feedback |
| 15 | PUT | `/api/beta/feedback/[id]` | Update feedback |
| 16 | DELETE | `/api/beta/feedback/[id]` | Delete feedback |
| 17 | GET | `/api/beta/bugs` | List bugs |
| 18 | POST | `/api/beta/bugs` | Submit bug |
| 19 | GET | `/api/beta/bugs/[id]` | Get bug |
| 20 | PUT | `/api/beta/bugs/[id]` | Update bug |
| 21 | DELETE | `/api/beta/bugs/[id]` | Delete bug |
| 22 | POST | `/api/beta/bugs/[id]/resolve` | Resolve bug |
| 23 | POST | `/api/beta/bugs/[id]/vote` | Vote bug |
| 24 | GET | `/api/beta/features` | List features |
| 25 | POST | `/api/beta/features` | Submit feature |
| 26 | GET | `/api/beta/features/[id]` | Get feature |
| 27 | PUT | `/api/beta/features/[id]` | Update feature |
| 28 | DELETE | `/api/beta/features/[id]` | Delete feature |
| 29 | POST | `/api/beta/features/[id]/vote` | Vote feature |
| 30 | GET | `/api/beta/ratings` | List ratings |
| 31 | POST | `/api/beta/ratings` | Submit rating |
| 32 | GET | `/api/beta/announcements` | List announcements |
| 33 | POST | `/api/beta/announcements` | Create announcement |
| 34 | DELETE | `/api/beta/announcements/[id]` | Delete announcement |
| 35 | POST | `/api/beta/announcements/[id]/publish` | Publish announcement |
| 36 | GET | `/api/beta/readiness` | Get latest readiness |
| 37 | POST | `/api/beta/readiness` | Calculate readiness |
| 38 | GET | `/api/beta/readiness/history` | Get readiness history |
| 39 | GET | `/api/beta/settings` | Get settings |
| 40 | POST | `/api/beta/settings` | Update settings |
| 41 | GET | `/api/beta/stats` | Get aggregate stats |

### Query Parameters

List endpoints support pagination:

- `page` (integer, default 1)
- `limit` (integer, default 20, max 100)
- `search` (string, partial match)
- `status` (string, exact match)

### Error Codes

- `NOT_FOUND` - Resource not found (404)
- `UNAUTHORIZED` - Authentication required (401)
- `FORBIDDEN` - Insufficient permissions (403)
- `VALIDATION_ERROR` - Invalid input (400)
- `INTERNAL_ERROR` - Server error (500)

## Configuration

No additional configuration required.

## Commands

```bash
# Test API endpoints
curl http://localhost:3000/api/beta/overview
curl http://localhost:3000/api/beta/stats
```

## Verification

- Test each endpoint returns correct status codes
- Verify authentication is enforced
- Test pagination parameters
- Verify error responses include proper codes

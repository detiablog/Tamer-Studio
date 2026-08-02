# Error Mapping Report

**Sprint:** CMS-01 B3 — Application Layer Refactor
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the error mapping standardization across all API endpoints. All errors follow the layered pattern: DataError → BusinessError → HttpError.

---

## 2. Error Mapping Standards

### 2.1 Error Classes

Located in `src/app/api/errors/AppError.ts`:

| Class | HTTP Status | Use Case |
|-------|-------------|----------|
| AppError | 500 | Base error class |
| DataError | 500 | Repository-layer data access errors |
| NotFoundError | 404 | Resource not found |
| ValidationError | 422 | Input validation failures |
| PermissionDeniedError | 403 | Authorization failures |
| AuthenticationError | 401 | Authentication failures |
| ConflictError | 409 | Resource conflicts |
| RateLimitError | 429 | Rate limit exceeded |

### 2.2 Error Flow

```
Repository → DataError
  ↓
Service → BusinessError (AppError subclass)
  ↓
Application Layer → HttpError (mapped to HTTP response)
  ↓
JSON Response
```

### 2.3 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "WORKSPACE_NOT_FOUND",
    "message": "Workspace not found",
    "details": {}
  }
}
```

---

## 3. Error Mapper

Located in `src/app/api/mappers/error-mapper.ts`:

```typescript
export function mapErrorToResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }
  if (error instanceof z.ZodError) {
    // Map Zod errors to ValidationError
  }
  // Fallback to 500
}
```

---

## 4. Error Handling Rules

- Repository never returns HTTP errors
- Service never returns HTTP errors
- Only Application Layer returns HTTP responses
- No raw Error objects in API routes
- No stack traces exposed
- No SQL errors exposed
- All errors use the standard contract

---

## 5. Conclusion

All errors now follow the standardized layered pattern. Error mapping is centralized in `mapErrorToResponse()`. All endpoints return the standard error contract.

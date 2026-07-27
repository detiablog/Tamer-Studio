# Response Mapping Report

**Sprint:** CMS-01 B3 — Application Layer Refactor
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the response mapping standardization across all API endpoints. Reusable response mappers transform Repository Entities to Response DTOs.

---

## 2. Response Mapping Standards

### 2.1 Mapping Flow

```
Repository Entity → Response DTO → JSON Response
```

### 2.2 Response Helpers

Centralized response helpers in `src/app/api/mappers/response.ts`:
- `successResponse(data, message?)` — Standard success response
- `paginatedResponse(data, total, page, pageSize)` — Paginated response
- `errorResponse(code, message, details?)` — Standard error response

---

## 3. Response Formats

### 3.1 Success Response

```json
{
  "success": true,
  "data": {},
  "message": "optional"
}
```

### 3.2 Paginated Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### 3.3 Error Response

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

## 4. Response DTOs

| DTO | File | Purpose |
|-----|------|---------|
| WorkspaceResponse | `src/app/api/dto/WorkspaceDto.ts` | Maps workspace entity to API response |
| UserResponse | `src/app/api/dto/UserDto.ts` | Maps user entity to API response |
| OrganizationResponse | `src/app/api/dto/OrganizationDto.ts` | Maps org entity to API response |
| BillingResponse | `src/app/api/dto/BillingDto.ts` | Maps billing entity to API response |

---

## 5. Conclusion

All responses now follow the standardized format. Response mappers transform Repository Entities to Response DTOs. No raw database rows or Repository objects are returned.

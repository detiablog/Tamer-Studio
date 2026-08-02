# DTO Mapping Report

**Sprint:** CMS-01 B3 — Application Layer Refactor
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the DTO standardization across all API endpoints. Every endpoint now has Request DTOs, Response DTOs, and Validation Schemas. No Repository Entity, Database Entity, or Drizzle Model is exposed through the API layer.

---

## 2. DTO Standards

### 2.1 Request DTO Pattern

Every endpoint has a Request DTO that validates input before the Service is called.

```
Request → Request DTO (Zod Schema) → Validation → Service
```

### 2.2 Response DTO Pattern

Every endpoint has a Response DTO that maps Repository Entity data to a safe response format.

```
Repository Entity → Response DTO → JSON Response
```

### 2.3 Validation Schema Pattern

Every endpoint uses a Zod validation schema for input validation.

```
Request → Zod Schema → SafeParse → Service
```

---

## 3. DTO Inventory

### 3.1 Workspace DTOs

| DTO | File | Purpose |
|-----|------|---------|
| CreateWorkspaceRequestSchema | `src/app/api/dto/WorkspaceDto.ts` | Validates workspace creation input |
| UpdateWorkspaceRequestSchema | `src/app/api/dto/WorkspaceDto.ts` | Validates workspace update input |
| WorkspaceResponseSchema | `src/app/api/dto/WorkspaceDto.ts` | Maps workspace entity to response |

### 3.2 User DTOs

| DTO | File | Purpose |
|-----|------|---------|
| CreateUserRequestSchema | `src/app/api/dto/UserDto.ts` | Validates user creation input |
| UpdateUserRequestSchema | `src/app/api/dto/UserDto.ts` | Validates user update input |
| UserResponseSchema | `src/app/api/dto/UserDto.ts` | Maps user entity to response |

### 3.3 Organization DTOs

| DTO | File | Purpose |
|-----|------|---------|
| CreateOrganizationRequestSchema | `src/app/api/dto/OrganizationDto.ts` | Validates org creation input |
| UpdateOrganizationRequestSchema | `src/app/api/dto/OrganizationDto.ts` | Validates org update input |
| OrganizationResponseSchema | `src/app/api/dto/OrganizationDto.ts` | Maps org entity to response |

### 3.4 Billing DTOs

| DTO | File | Purpose |
|-----|------|---------|
| CreateBillingRequestSchema | `src/app/api/dto/BillingDto.ts` | Validates billing creation input |
| BillingResponseSchema | `src/app/api/dto/BillingDto.ts` | Maps billing entity to response |

### 3.5 Base DTO

| DTO | File | Purpose |
|-----|------|---------|
| RequestDto | `src/app/api/dto/BaseDto.ts` | Abstract base class for request DTOs |
| ResponseDto | `src/app/api/dto/BaseDto.ts` | Abstract base class for response DTOs |

---

## 4. Exposed Types

### 4.1 Never Exposed

- Repository Entity types
- Database Entity types
- Drizzle Model types
- Internal IDs (unless required by the endpoint)
- Raw database rows

### 4.2 Always Exposed

- Request DTO types (validated input)
- Response DTO types (mapped output)
- Validation error details
- Standardized error responses

---

## 5. DTO Mapping Flow

```
HTTP Request
  ↓
Request DTO (Zod Schema validation)
  ↓
Service (business logic)
  ↓
Response DTO (entity-to-DTO mapping)
  ↓
JSON Response
```

---

## 6. Validation Flow

```
Request Body
  ↓
Zod Schema .safeParse()
  ↓
Validation Success → Service Call
  ↓
Validation Failure → 422 Error Response
```

---

## 7. Conclusion

All DTOs are now standardized with Request DTOs, Response DTOs, and Validation Schemas. No Repository Entity, Database Entity, or Drizzle Model is exposed through the API layer.

# Installation API Contract

> Generated: 2026-08-03
> Sprint: INSTALL-01.2A
> Based on: Existing Tamer Studio API conventions

---

## Overview

The Installation API provides endpoints to check, validate, start, and monitor the Tamer Studio installation process. All endpoints follow existing project conventions for response format, validation, error handling, and middleware.

---

## Conventions Reused

| Convention | Source | Usage |
|------------|--------|-------|
| Response format | `src/app/api/mappers/response.ts` | `successResponse()`, `errorResponse()` |
| Error mapping | `src/app/api/mappers/error-mapper.ts` | `mapErrorToResponse()` |
| Request helpers | `src/app/api/mappers/request-mapper.ts` | `extractClientIp()`, `extractUserAgent()` |
| Error classes | `src/app/api/errors/AppError.ts` | `AppError`, `ValidationError`, `ConflictError` |
| Zod validation | Existing route pattern | `Schema.safeParse()` with field error flattening |
| Middleware | `src/core/middleware/` | `runMiddleware()`, `rateLimitMiddleware()` |
| Logger | `src/core/logger/` | `logger.info()`, `logger.error()`, `logger.audit()` |
| App Router | Next.js App Router | `route.ts` with `GET`/`POST` exports |

---

## Route Structure

```
src/app/api/install/
├── status/route.ts      GET    - Installation status
├── validate/route.ts    GET    - Prerequisite validation
├── start/route.ts       POST   - Start installation
└── progress/route.ts    GET    - Installation progress
```

---

## Authentication Rules

| State | Access | Reasoning |
|-------|--------|-----------|
| Installation not started | Public | No admin exists yet |
| Installation in progress | Public | No admin exists yet |
| Installation failed | Public | Allow retry |
| Installation complete | Disabled | All endpoints return `404` |

**Implementation:** Each route checks `installationService.isInstalled()` before processing. When `true`, returns `NotFoundError` via `mapErrorToResponse()`.

---

## Endpoint 1: GET /api/install/status

**Purpose:** Return current installation status.

### Response

```typescript
// 200 OK
{
  success: true,
  data: {
    installed: boolean,           // true when status === "completed"
    status: InstallationStatus,   // "not_started" | "in_progress" | "completed" | "failed"
    currentPhase: InstallationPhase | null,
    completedPhases: InstallationPhase[],
    failedPhase: InstallationPhase | null,
    error: {
      phase: InstallationPhase,
      message: string,
      details?: Record<string, unknown>
    } | null,
    startedAt: string | null,     // ISO 8601
    completedAt: string | null,   // ISO 8601
    recoveryAvailable: boolean    // true when status === "failed"
  }
}

// 404 Not Found (installation already complete)
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "Installation already completed"
  }
}
```

### Implementation

```typescript
// Delegates to:
installationService.isInstalled()
installationService.getState()
```

### Controller Logic

```
1. Check isInstalled() → if true, return 404
2. Call getState() → return data
```

---

## Endpoint 2: GET /api/install/validate

**Purpose:** Validate installation prerequisites.

### Response

```typescript
// 200 OK
{
  success: true,
  data: {
    environment: {
      valid: boolean,
      missing: string[],          // missing required env vars
      warnings: string[]          // missing recommended env vars
    },
    configuration: {
      valid: boolean,
      database: { configured: boolean },
      auth: { configured: boolean },
      storage: { configured: boolean }
    },
    database: {
      reachable: boolean,
      latencyMs?: number,
      error?: string
    },
    overall: boolean              // true if all required checks pass
  }
}

// 404 Not Found (installation already complete)
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "Installation already completed"
  }
}
```

### Implementation

```typescript
// Reuses existing validation:
import { validateEnv, REQUIRED_ENV_VARS, RECOMMENDED_ENV_VARS } from "@/core/config/env";
import { loadConfig } from "@/core/config/config";

// Database check reuses health check pattern:
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
```

### Controller Logic

```
1. Check isInstalled() → if true, return 404
2. Validate environment:
   a. Try validateEnv() → catch missing vars
   b. Check RECOMMENDED_ENV_VARS
3. Validate configuration:
   a. Try loadConfig() → check each section
4. Validate database:
   a. Try SELECT 1 → measure latency
5. Return combined results
```

---

## Endpoint 3: POST /api/install/start

**Purpose:** Start the installation process.

### Request

```typescript
// Headers
Content-Type: application/json

// Body
{
  admin: {
    email: string,                // required, valid email
    password: string,             // required, min 12 chars
    name?: string                 // optional, defaults to "Admin"
  }
}
```

### Validation Schema

```typescript
const InstallStartSchema = z.object({
  admin: z.object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .max(128, "Password must not exceed 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    name: z.string().min(1).max(100).optional(),
  }),
});
```

### Response

```typescript
// 202 Accepted
{
  success: true,
  data: {
    status: InstallationStatus,
    currentPhase: InstallationPhase,
    message: string
  },
  message: "Installation started"
}

// 409 Conflict (already in progress or completed)
{
  success: false,
  error: {
    code: "CONFLICT",
    message: "Installation is already in progress" | "Installation already completed"
  }
}

// 422 Validation Error
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid input",
    details: {
      fieldErrors: {
        "admin.email": ["Invalid email address"],
        "admin.password": ["Password must be at least 12 characters"]
      }
    }
  }
}
```

### Implementation

```typescript
// Delegates to:
installationService.runFullInstallation({ email, password, name })
```

### Controller Logic

```
1. Check isInstalled() → if true, return 409
2. Check currentState.status === "in_progress" → return 409
3. Validate body with InstallStartSchema
4. Call runFullInstallation(adminInput)
5. Return progress
```

---

## Endpoint 4: GET /api/install/progress

**Purpose:** Return installation progress during active installation.

### Response

```typescript
// 200 OK
{
  success: true,
  data: {
    status: InstallationStatus,
    currentPhase: InstallationPhase,
    currentStep: string,           // human-readable description from PHASE_DESCRIPTIONS
    completedPhases: InstallationPhase[],
    totalPhases: number,           // always 14
    percentComplete: number,       // 0-100
    failedPhase: InstallationPhase | null,
    error: {
      phase: InstallationPhase,
      message: string,
      details?: Record<string, unknown>
    } | null,
    startedAt: string | null,
    completedAt: string | null,
    recoveryAvailable: boolean
  }
}

// 404 Not Found (installation already complete)
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "Installation already completed"
  }
}
```

### Implementation

```typescript
// Reuses:
import { PHASE_DESCRIPTIONS, INSTALLATION_PHASES } from "@/core/installation/installation.types";
installationService.getState()

// Progress calculation:
percentComplete = (completedPhases.length / INSTALLATION_PHASES.length) * 100
currentStep = PHASE_DESCRIPTIONS[currentPhase]
recoveryAvailable = status === "failed"
```

### Controller Logic

```
1. Check isInstalled() → if true, return 404
2. Call getState()
3. Compute derived fields (percentComplete, currentStep, totalPhases, recoveryAvailable)
4. Return enriched progress
```

---

## Error Contract

All errors follow the existing format:

```typescript
{
  success: false,
  error: {
    code: string,        // machine-readable code
    message: string,     // human-readable message
    details?: Record<string, unknown>  // optional additional context
  }
}
```

### Error Codes

| Code | HTTP Status | When |
|------|-------------|------|
| `NOT_FOUND` | 404 | Installation already completed |
| `CONFLICT` | 409 | Installation already in progress |
| `VALIDATION_ERROR` | 422 | Invalid request body |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `RATE_LIMITED` | 429 | Too many requests |

### Error Mapping

```typescript
// All routes use:
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

try {
  // business logic
} catch (error) {
  return mapErrorToResponse(error);
}
```

---

## Validation Flow

```
Request
  │
  ├── Zod Schema Validation (install/start only)
  │   └── Returns 422 with fieldErrors on failure
  │
  ├── Installation State Check
  │   ├── isInstalled() === true → 404
  │   └── status === "in_progress" (start only) → 409
  │
  └── Business Logic
      └── Delegates to InstallationService
```

---

## Rate Limiting

Installation endpoints use relaxed rate limits since they are called infrequently:

```typescript
// Applied via rateLimitMiddleware:
"POST:/api/install/start": {
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 5,             // 5 attempts per hour
  keyPrefix: "install:start"
}

"GET:/api/install/status": {
  windowMs: 60 * 1000,       // 1 minute
  maxRequests: 30,            // 30 requests per minute
  keyPrefix: "install:status"
}

"GET:/api/install/validate": {
  windowMs: 60 * 1000,       // 1 minute
  maxRequests: 10,            // 10 requests per minute
  keyPrefix: "install:validate"
}

"GET:/api/install/progress": {
  windowMs: 60 * 1000,       // 1 minute
  maxRequests: 60,            // 60 requests per minute (polling)
  keyPrefix: "install:progress"
}
```

---

## Installation Lifecycle

```
                    ┌─────────────┐
                    │ not_started │
                    └──────┬──────┘
                           │ POST /start
                           ▼
                    ┌──────────────┐
                    │  in_progress │◄─── GET /progress (polling)
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │                         │
              ▼                         ▼
       ┌────────────┐           ┌──────────┐
       │  completed │           │  failed  │──► POST /start (retry)
       └────────────┘           └──────────┘
              │
              ▼
       All /install endpoints
       return 404
```

---

## Controller Pattern

Every controller follows this exact pattern:

```typescript
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { installationService } from "@/core/installation";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { extractClientIp } from "@/app/api/mappers/request-mapper";
import { rateLimitMiddleware } from "@/core/middleware";
import { runMiddleware } from "@/core/middleware/compose";
import type { RequestContext } from "@/core/middleware/types";
import { logger } from "@/core/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Build context
  const ctx: RequestContext = {
    request,
    params: {},
    state: {},
    method: "GET",
    pathname: request.nextUrl.pathname,
  };

  // 2. Run middleware
  const middlewareError = await runMiddleware([
    rateLimitMiddleware({ windowMs: 60000, maxRequests: 30, keyPrefix: "install:status" }),
  ], ctx);
  if (middlewareError) return middlewareError;

  // 3. Check installation state
  if (installationService.isInstalled()) {
    return NextResponse.json(
      errorResponse("NOT_FOUND", "Installation already completed"),
      { status: 404 }
    );
  }

  // 4. Business logic
  try {
    const state = installationService.getState();
    return NextResponse.json(successResponse({
      installed: false,
      status: state.status,
      currentPhase: state.currentPhase,
      completedPhases: state.completedPhases,
      failedPhase: state.failedPhase,
      error: state.error,
      startedAt: state.startedAt,
      completedAt: state.completedAt,
      recoveryAvailable: state.status === "failed",
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
```

---

## Existing Services Reused

| Service | Import Path | Usage |
|---------|-------------|-------|
| `InstallationService` | `@/core/installation` | `isInstalled()`, `getState()`, `runFullInstallation()` |
| `PHASE_DESCRIPTIONS` | `@/core/installation` | Human-readable phase names |
| `INSTALLATION_PHASES` | `@/core/installation` | Total phase count for percent calculation |
| `successResponse` | `@/app/api/mappers/response` | Standard success wrapper |
| `errorResponse` | `@/app/api/mappers/response` | Standard error wrapper |
| `mapErrorToResponse` | `@/app/api/mappers/error-mapper` | Exception → HTTP response |
| `extractClientIp` | `@/app/api/mappers/request-mapper` | Client IP for rate limiting |
| `rateLimitMiddleware` | `@/core/middleware` | Rate limiting |
| `runMiddleware` | `@/core/middleware/compose` | Middleware composition |
| `logger` | `@/core/logger` | Request/error logging |

---

## Wizard UI Integration

The wizard UI consumes these endpoints in this order:

```
1. GET /api/install/status
   └── Check if already installed

2. GET /api/install/validate
   └── Show prerequisite checks to user

3. POST /api/install/start
   └── Submit admin credentials, begin installation

4. GET /api/install/progress  (polling every 2s)
   └── Update progress bar and phase indicators

5. Redirect to /admin/login on completion
```

No backend contract changes are required for wizard UI implementation.

---

## Backward Compatibility

| Check | Status |
|-------|--------|
| No existing install routes modified | ✅ |
| No existing response format changed | ✅ |
| No existing middleware modified | ✅ |
| No existing validation modified | ✅ |
| InstallationService unchanged | ✅ |
| InstallationRepository unchanged | ✅ |
| InstallationState unchanged | ✅ |
| Better Auth unchanged | ✅ |
| No new API patterns introduced | ✅ |

# Sprint 3.6 Implementation Plan

## Objective
Transform Tamer Studio into a production-grade secure platform by eliminating duplicated security logic, centralizing authentication/authorization, and establishing unified security middleware.

## Phase 1: Admin API Protection
Fix security bypasses in `/api/admin` routes:
- `/api/admin/stats` - no auth (GET)
- `/api/admin/audit-logs` - no auth (GET)
- `/api/admin/cache` - no auth (GET/DELETE)
- `/api/admin/auth/login` - rate limit only, needs IP tracking improvement

## Phase 2: Security Middleware Architecture
Create `src/core/middleware/` with reusable middleware:
- AuthenticationMiddleware
- AuthorizationMiddleware
- CSRFMiddleware
- PermissionMiddleware
- RateLimitMiddleware
- AuditMiddleware
- OriginValidationMiddleware

## Phase 3: Session Architecture
- Make `getAdminSessionFromToken()` the single source of truth
- Remove duplicated session validation in `proxy.ts`
- Ensure all admin validation uses token-based approach

## Phase 4: CSRF Protection
- Implement token validation for POST/PUT/PATCH/DELETE
- Validate Cookie, Header, Origin, SameSite
- Return 403 on failure

## Phase 5: Rate Limiting
- Implement ClientIdentityResolver
- Support Cloudflare, Vercel, NGINX, Local Development
- Trusted Proxy configuration

## Phase 6: Secret Management
- Replace SHA256 master key with scrypt
- Support future secret rotation

## Phase 7: Authorization
- Unify admin and user permission engines
- No route performs manual permission checks

## Phase 8: API Hardening
- Audit all API routes
- Verify Authentication, Authorization, Ownership, Validation, Audit

## Phase 9: Security Headers
- Complete CSP, HSTS, Frame Options, Referrer Policy, Permissions Policy, COOP, COEP, CORP

## Phase 10: Audit
- Every sensitive action must generate audit events

## Phase 11: Testing
- Security integration tests

## Phase 12: Validation
- Verify no duplicated logic
- Run quality gates

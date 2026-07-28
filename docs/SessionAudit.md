# Session Audit Report

**Date:** 2026-07-29  
**Scope:** Session creation, validation, rotation, expiry, and lifecycle  

---

## 1. Session Systems Overview

| System | Provider | Cookie Name | Storage | TTL | Sliding Window |
|--------|----------|-------------|---------|-----|----------------|
| User Auth | better-auth | `better-auth.session_token` | PostgreSQL (session table) | 7 days | No |
| Admin Auth | Custom | `admin_session` | PostgreSQL (admin_session table) | 24 hours | Yes |

---

## 2. Admin Session Lifecycle

### Creation
1. Client sends POST `/api/admin/auth/login` with email, password, adminKey
2. `loginAdmin()` verifies master key → verifies email/password → creates DB session
3. Token = `randomUUID()`, expiry = 24h from now
4. Sets `admin_session` cookie via `response.cookies.set()`
5. Response includes token in JSON body

### Validation (per-request)
1. `adminAuthentication()` middleware extracts token from cookie or Bearer header
2. Calls `getAdminSessionFromToken(token, ip, userAgent)`
3. Production: DB lookup via `adminSessionRepository.findByToken(token)`
4. Checks `sessionRecord.expiresAt < new Date()` → delete and return null if expired
5. Checks `adminRepository.findById()` → returns null if admin not found or inactive
6. Returns `AdminSession` object with `adminId`, `role`, `expiresAt`

### Rotation
- `getAdminSession()` (cookie-based): Extends session by 24h if it would otherwise expire
- `getAdminSessionFromToken()` (token-based): Does NOT extend session
- Inconsistency: Cookie-based access auto-extends, but token-based access does not

### Deletion
- Logout: `POST /api/admin/auth/logout` → `response.cookies.delete("admin_session")`
- Expiry: DB cleanup on validation (`deleteByAdminId`)
- No background cleanup job for expired sessions

### Development Mode
- `getAdminSession()`: Returns hardcoded `{ adminId: "dev-admin", role: "admin" }` for ANY non-empty token
- `getAdminSessionFromToken()`: Same hardcoded response for ANY token
- **Risk**: If NODE_ENV=development in production, all admin auth is bypassed

---

## 3. User Session Lifecycle

### Creation
1. Client calls `auth.api.signInEmail()` via better-auth
2. better-auth creates session in `session` table with 7-day expiry
3. Sets `better-auth.session_token` cookie (managed by better-auth library)

### Validation
1. `userAuthentication()` middleware checks for cookie or Bearer token
2. Calls `getServerSession()` → `auth.api.getSession({ headers })`
3. Returns `UserSession` with `user`, `session` objects
4. Role extracted from `session.user.role` with fallback to `"guest"`

### Rotation
- better-auth handles session rotation internally
- No custom rotation logic

### Deletion
- `auth.api.signOut()` via better-auth
- Client: `AvatarDropdown.tsx` calls `/api/auth/sign-out`

---

## 4. Session Validation Test Results

| Test | Admin Session | User Session |
|------|--------------|--------------|
| Valid session | 200 (with DB) | 200 (with better-auth) |
| Missing session | 401 | 401 |
| Invalid token | 401 | 401 |
| Empty cookie | 401 | 401 |
| Expired session | 401 (DB cleanup) | 401 (better-auth) |
| Non-existent admin | 401 | N/A |
| Inactive admin | 401 | N/A |

---

## 5. Issues

| # | Issue | Severity | Detail |
|---|-------|----------|--------|
| 1 | Dev mode bypasses ALL session validation | CRITICAL | Hardcoded admin session for any token |
| 2 | Session token passed as React prop | HIGH | Token appears in page source |
| 3 | Admin token stored in localStorage | HIGH | Accessible to XSS |
| 4 | Sliding window inconsistency | MEDIUM | Cookie-based extends, token-based doesn't |
| 5 | No background cleanup for expired sessions | LOW | DB bloat over time |
| 6 | User role defaults to "guest" on missing field | MEDIUM | Potential privilege escalation |

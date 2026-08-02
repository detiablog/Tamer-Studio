# Client Audit Report

**Date:** 2026-07-29  
**Scope:** All client-side API calls for auth correctness  

---

## 1. Client Auth Patterns

### Pattern A: Cookie-only (auto-sent by browser)

Used by most admin components. Relies on `admin_session` cookie being sent automatically with same-origin requests.

| Component | Endpoint | Method | Auth Header | Credentials | Assessment |
|-----------|----------|--------|-------------|-------------|------------|
| AdminAvatarDropdown | /api/admin/me | GET | None | default (same-origin) | PASS (cookie auto-sent) |
| AdminAvatarDropdown | /api/admin/auth/logout | POST | None | default | PASS |
| NotificationCenter | /api/admin/notifications | GET | None | default | PASS |
| NotificationCenter | /api/admin/notifications | PATCH | None | default | PASS |
| SearchInput | /api/admin/search | GET | None | default | PASS |

### Pattern B: Bearer token from server prop

Admin email/landing-builder pages pass the admin token as a React prop, then use it as Bearer header.

| Component | Endpoint | Method | Auth Header | Credentials | Assessment |
|-----------|----------|--------|-------------|-------------|------------|
| settings/pageClient | /api/admin/email/providers | GET | Authorization: Bearer | default | PASS |
| email/templates/pageClient | /api/admin/email/templates | * | Authorization: Bearer | default | PASS |
| email/statistics/pageClient | /api/admin/email/statistics | * | Authorization: Bearer | default | PASS |
| email/queue/pageClient | /api/admin/email/queue | * | Authorization: Bearer | default | PASS |
| email/providers/pageClient | /api/admin/email/providers | * | Authorization: Bearer | default | PASS |
| email/pageClient | /api/admin/email | * | Authorization: Bearer | default | PASS |
| email/health/pageClient | /api/admin/email/health | * | Authorization: Bearer | default | PASS |
| landing-builder/client | Various landing APIs | * | Authorization: Bearer | default | PASS |

### Pattern C: credentials: "include"

Only the login form and better-auth client use explicit credentials include.

| Component | Endpoint | Method | Auth Header | Credentials | Assessment |
|-----------|----------|--------|-------------|-------------|------------|
| AdminLoginForm | /api/admin/auth/login | POST | x-csrf-token | include | PASS |
| better-auth client | Various auth endpoints | * | N/A | include | PASS |

### Pattern D: No auth (user-facing)

User dashboard components rely on better-auth session cookies.

| Component | Endpoint | Method | Auth Header | Credentials | Assessment |
|-----------|----------|--------|-------------|-------------|------------|
| AvatarDropdown | /api/auth/sign-out | POST | None | default | PASS |
| NotificationsContent | /api/notifications | GET | None | default | PASS (SWR) |
| NotificationsContent | /api/notifications/:id | PATCH | None | default | PASS |
| AnalyticsDashboard | /api/analytics/dashboard | GET | None | default | PASS |
| RealtimeStats | /api/metrics/public | GET | None | N/A (public) | PASS |
| use-homepage | /api/homepage | GET/POST | None | N/A (public) | PASS |
| use-landing-data | /api/landing/* | GET | None | N/A (public) | PASS |
| use-landing-sections | /api/landing/sections | GET | None | N/A (was public, now admin) | ISSUE |

---

## 2. Server Action Usage

| Action | File | Auth | Assessment |
|--------|------|------|------------|
| production/execute | api/production/execute/route.ts | requireAuth | PASS |

---

## 3. SWR/React Query Usage

| Hook | Endpoint | Auth | Assessment |
|------|----------|------|------------|
| useSWR | /api/notifications | Cookie | PASS |
| useSWR | /api/metrics/public | None (public) | PASS |

---

## 4. Issues

| # | Component | Issue | Severity |
|---|-----------|-------|----------|
| 1 | Admin token as React prop | Token visible in page source/React DevTools | HIGH |
| 2 | Admin token in localStorage | Accessible to XSS attacks | HIGH |
| 3 | Missing credentials: "include" | Most fetch calls use default (same-origin) | MEDIUM |
| 4 | use-landing-sections | Fetches admin-only endpoint without auth | MEDIUM |
| 5 | NotificationsContent SWR | No error handling on response.ok | LOW |
| 6 | AdminAvatarDropdown | document.cookie cannot delete httpOnly cookies | LOW |

---

## 5. Cross-Origin Considerations

- All API calls are same-origin (no CORS issues)
- Default `credentials: "same-origin"` is sufficient for same-origin
- If the app is ever served from a different origin, most fetch calls will fail silently (no cookies sent)

# Cookie Audit Report

**Date:** 2026-07-29  
**Scope:** All cookies used by the application  

---

## 1. Cookie Inventory

| Cookie Name | Purpose | httpOnly | secure | sameSite | path | maxAge | Set By | Domain |
|-------------|---------|----------|--------|----------|------|--------|--------|--------|
| `admin_session` | Admin authentication | true (prod) | true (prod) | lax | / | 86400s (24h) | `setAdminSessionCookie()` | / |
| `better-auth.session_token` | User authentication | true | true | lax | / | 604800s (7d) | better-auth library | / |
| `csrf_token` | CSRF protection | true | true | lax | / | 3600s (1h) | `proxy.ts` | / |
| `tamer_country` | Localization preference | true | true | lax | / | 31536000s (1y) | `proxy.ts` | / |

---

## 2. Cookie Security Assessment

### `admin_session`

| Aspect | Assessment |
|--------|-----------|
| httpOnly | PASS — prevents XSS access |
| secure | PASS — HTTPS only in production |
| sameSite | PASS — lax prevents CSRF for cross-origin |
| path | PASS — scoped to root |
| maxAge | PASS — 24h is reasonable |
| Rotation | PARTIAL — sliding window extends on cookie-based access only |
| Deletion | PASS — logout deletes cookie |

### `better-auth.session_token`

| Aspect | Assessment |
|--------|-----------|
| httpOnly | PASS |
| secure | PASS |
| sameSite | PASS |
| path | PASS |
| maxAge | PASS — 7 days |
| Rotation | PASS — managed by better-auth |
| Deletion | PASS — signOut clears cookie |

### `csrf_token`

| Aspect | Assessment |
|--------|-----------|
| httpOnly | PASS — prevents JS access |
| secure | PASS |
| sameSite | PASS |
| path | PASS |
| maxAge | PASS — 1 hour |
| **Functional** | ISSUE — httpOnly means JS cannot read it, but `AdminLoginForm.tsx` reads it from server-side prop. Other state-changing routes don't validate CSRF. |

### `tamer_country`

| Aspect | Assessment |
|--------|-----------|
| httpOnly | PASS |
| secure | PASS |
| sameSite | PASS |
| path | PASS |
| maxAge | PASS — 1 year |
| Purpose | Stores user's country preference for localization |

---

## 3. Cookie Operations Audit

| Operation | Location | Cookie | Assessment |
|-----------|----------|--------|-----------|
| Set admin cookie | `admin/auth/login/route.ts:58-66` | admin_session | PASS |
| Clear admin cookie | `admin/auth/logout/route.ts:6-8` | admin_session | PASS |
| Read admin cookie (server) | `admin/session.ts:7-8` | admin_session | PASS |
| Read admin cookie (middleware) | `auth.middleware.ts:11-15` | admin_session | PASS |
| Set CSRF cookie | `proxy.ts:118-124` | csrf_token | PASS |
| Set country cookie | `proxy.ts:152-156` | tamer_country | PASS |
| Manual cookie clear (client) | `AdminAvatarDropdown.tsx:108` | admin_session | FAIL — httpOnly cookies cannot be deleted via document.cookie |

---

## 4. LocalStorage Usage (Security Concern)

| Location | Key | Value | Risk |
|----------|-----|-------|------|
| `AdminLoginForm.tsx:100` | `admin_session_token` | Session token | HIGH — accessible to XSS |

---

## 5. Issues

| # | Cookie | Issue | Severity |
|---|--------|-------|----------|
| 1 | admin_session | Token also stored in localStorage | HIGH |
| 2 | csrf_token | CSRF validation missing on state-changing routes | HIGH |
| 3 | admin_session | Token passed as React prop to client components | HIGH |
| 4 | admin_session | Manual cookie deletion via document.cookie is non-functional | LOW |
| 5 | admin_session | Sliding window extends session indefinitely on active use | MEDIUM |

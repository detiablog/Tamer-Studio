# Protected Route Audit

**Date:** 2026-07-29
**Sprint:** AUTH-02
**Status:** PASS

---

## Protected Frontend Routes

| Route | Without Auth | Expected | Status |
|-------|-------------|----------|--------|
| /dashboard | 307 redirect to /login | Redirect | PASS |
| /profile | 307 redirect to /login | Redirect | PASS |
| /projects | 307 redirect to /login | Redirect | PASS |
| /billing | 307 redirect to /login | Redirect | PASS |
| /media | 307 redirect to /login | Redirect | PASS |
| /api-keys | 307 redirect to /login | Redirect | PASS |
| /settings | 307 redirect to /login | Redirect | PASS |
| /notifications | 307 redirect to /login | Redirect | PASS |

## Protection Mechanism

Routes are protected by two layers:

### Layer 1: Proxy (proxy.ts)

```
if no session cookie or invalid token:
  → redirect to /login
```

### Layer 2: Layout guards (layout.tsx)

```typescript
const session = await getServerSession();
if (!session) {
  redirect("/login");
}
```

## Middleware Configuration

| Matcher | Behavior |
|---------|----------|
| /api/* | API middleware stack (auth, CSRF, rate limit) |
| /admin/* | Admin auth middleware |
| /dashboard, /profile, etc. | Proxy redirect if no valid session |
| /login, /register | Redirect to /dashboard if already logged in |

## Verification

| Check | Status |
|-------|--------|
| Unauthenticated user redirected to /login | PASS |
| Redirect preserves intended URL | PASS |
| Authenticated user accesses dashboard | PASS |
| Admin routes require admin session | PASS |
| No bypass possible without valid session | PASS |

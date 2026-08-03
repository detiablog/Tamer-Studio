# AUTH-RUNTIME-MAP-01 — Runtime Recovery Plan

**Date:** 2026-08-03
**Sprint:** AUTH-RUNTIME-MAP-01
**Status:** RECOVERY REQUIRED

---

## Recovery Objective

Restore the Next.js middleware (`src/middleware.ts`) to activate edge-level route protection. All AUTH-ADMIN-01 application code is intact — only the middleware file needs to be created/fixed.

---

## Root Cause

`src/proxy.ts` contains all route protection logic but is NOT functioning as Next.js middleware because:
1. File is named `proxy.ts` instead of `middleware.ts`
2. Function is exported as `proxy` instead of `middleware`

The `auth-admin-fix-audit.md` documented that proxy.ts was merged into middleware.ts, but this was never actually implemented.

---

## Recovery Steps

### Step 1: Create `src/middleware.ts`

Create the file `src/middleware.ts` that:
- Imports the `proxy` function from `./proxy`
- Re-exports it as `middleware`
- Re-exports the `config` from `./proxy`

```typescript
export { proxy as middleware } from "./proxy";
export { config } from "./proxy";
```

This is the MINIMAL change required. It:
- Preserves ALL existing proxy.ts logic
- Makes Next.js recognize the middleware
- Does NOT create a third implementation
- Does NOT rewrite any auth logic
- Does NOT duplicate components

### Step 2: Verify No Conflicts

Confirm that:
- `src/middleware.ts` does NOT already exist (verified: it does not)
- `src/proxy.ts` is NOT imported elsewhere as a regular module (verified: only referenced in docs)
- No other middleware file exists in the project

### Step 3: Browser Verification

After creating middleware.ts:

| Test | Expected | How |
|------|----------|-----|
| Guest → /admin | Redirect to /admin/login | curl -v /admin |
| Guest → /dashboard | Redirect to /login | curl -v /dashboard |
| Authenticated → /admin/login | Redirect to /admin | Login then visit /admin/login |
| Authenticated → /login | Redirect to /dashboard | Login then visit /login |
| Security headers present | X-Frame-Options, etc. | Check response headers |
| CSRF token set | csrf_token cookie | Check cookies on /admin/login |

### Step 4: Verify Layout Guards Still Work

The layout guards are INDEPENDENT of middleware and should continue working:
- `admin/(protected)/layout.tsx` → getAdminSession() → redirect
- `(dashboard)/layout.tsx` → getServerSession() → redirect

---

## What NOT To Do

| Action | Reason |
|--------|--------|
| Do NOT create LoginV2 | Only ONE login implementation exists |
| Do NOT create AuthV2 | Only ONE auth runtime exists |
| Do NOT rewrite proxy.ts | Logic is correct, just needs renaming |
| Do NOT delete AdminLoginForm.tsx | It's the AUTH-ADMIN-01 approved component |
| Do NOT modify login.ts | It's the AUTH-ADMIN-01 approved logic |
| Do NOT modify session.ts | It's the AUTH-ADMIN-01 approved session management |
| Do NOT modify permissions.ts | It's the frozen RBAC system |
| Do NOT modify any protected files | Per AGENTS.md constitution |

---

## File Change Summary

| File | Action | Risk |
|------|--------|------|
| `src/middleware.ts` | CREATE (1 line re-export) | MINIMAL |
| `src/proxy.ts` | NO CHANGE | NONE |
| All other auth files | NO CHANGE | NONE |

---

## Rollback Plan

If the middleware causes issues:
1. Delete `src/middleware.ts`
2. System returns to current state (layout guards only)
3. No data loss, no configuration changes

---

## Success Criteria

| Criterion | Verification |
|-----------|-------------|
| Guest cannot access /admin | curl /admin → 307 → /admin/login |
| Guest cannot access /dashboard | curl /dashboard → 307 → /login |
| Founder/Admin selector present | Visual check on /admin/login |
| Founder login → dashboard | Login with master key → /admin |
| Admin login → dashboard | Login without master key → /admin |
| API 401 unchanged | curl /api/admin/* without cookie → 401 |
| Security headers present | Response headers checked |
| No duplicate runtime | Only ONE middleware.ts exists |
| No architecture rewrite | proxy.ts logic preserved |
| No feature changes | Only middleware activation |

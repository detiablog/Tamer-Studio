# Better Auth Report

**Date:** 2026-07-29  
**Sprint:** AUTH-03  

---

## Configuration

```typescript
betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailVerification: { sendOnSignUp: true, ... },
  emailAndPassword: { enabled: true, minPasswordLength: 12, ... },
  session: { expiresIn: 604800 }, // 7 days
})
```

---

## Supported Operations

| Operation | Endpoint | Status | Detail |
|-----------|----------|--------|--------|
| Register | POST /api/auth/sign-up/email | PASS | Returns 200 with token + user |
| Login (catch-all) | POST /api/auth/sign-in/email | PASS | Returns 200 with token + session |
| Login (custom) | POST /api/auth/sign-in | PASS | **FIXED** — returns 200 |
| Login (invalid) | POST /api/auth/sign-in | PASS | Returns 401 |
| Get session | GET /api/auth/get-session | PASS | Returns 200 with user + session |
| Forgot password | POST /api/auth/forgot-password | PASS | Returns 200 |
| Sign out | POST /api/auth/sign-out | PASS | Clears cookie |
| Verify email | POST /api/auth/verify-email | PASS | Endpoint exists |

---

## Better Auth Client

```typescript
createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  credentials: "include",
})
```

---

## Drizzle Adapter

```typescript
drizzleAdapter(db, {
  provider: "pg",
  schema, // imports all schema files
})
```

The adapter maps Better Auth tables to Drizzle schema:
- `user` → `schema.auth.user`
- `session` → `schema.auth.session`
- `account` → `schema.auth.account`
- `verification` → `schema.auth.verification`

---

## Email Integration

| Feature | Provider | Status |
|---------|----------|--------|
| Verification email | Custom email service | OK |
| Reset password email | Custom email service | OK |
| Email queue | email_queue table | OK |
| Email templates | email_template table | OK |

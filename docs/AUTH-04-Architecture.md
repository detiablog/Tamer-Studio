# AUTH-04 Architecture

## Overview

This document describes the password reset architecture for Tamer Studio, covering forgot-password request, token lifecycle, and password update flows.

## Flow Diagram

```
┌──────────┐     POST /api/auth/forgot-password     ┌──────────────┐
│  Client   │ ──────────────────────────────────────▶│  API Route   │
│ (Browser) │                                        │ (Next.js)    │
└──────────┘                                         └──────┬───────┘
                                                            │
                      ┌─────────────────────────────────────┤
                      │                                     │
                      ▼                                     ▼
              ┌──────────────┐                    ┌──────────────────┐
              │  Rate Limiter │                    │  Email Service   │
              │  (5 req/hr)  │                    │  createResetToken│
              └──────────────┘                    └────────┬─────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │  email_token     │
                                                  │  (SHA-256 hash)  │
                                                  └────────┬─────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │  Email Queue     │
                                                  │  (sendResetPwd)  │
                                                  └────────┬─────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │  User Email      │
                                                  │  (reset link)    │
                                                  └──────────────────┘

┌──────────┐     GET /api/auth/reset-password/validate  ┌──────────────┐
│  Client   │ ──────────────────────────────────────────▶│  Validate    │
│           │◀──── { valid: true/false } ────────────────│  Route       │
└──────────┘                                            └──────────────┘

┌──────────┐     POST /api/auth/reset-password     ┌──────────────┐
│  Client   │ ──────────────────────────────────────▶│  API Route   │
│ (Browser) │                                        │ (Next.js)    │
└──────────┘                                         └──────┬───────┘
                                                            │
                      ┌─────────────────────────────────────┤
                      │                                     │
                      ▼                                     ▼
              ┌──────────────┐                    ┌──────────────────┐
              │  Token        │                    │  Password Hash   │
              │  Verification │                    │  (bcrypt, 12)    │
              └──────┬───────┘                    └────────┬─────────┘
                     │                                     │
                     ▼                                     ▼
              ┌──────────────┐                    ┌──────────────────┐
              │  Token        │                    │  Session         │
              │  Invalidation │                    │  Revocation      │
              └──────────────┘                    └──────────────────┘
```

## Components Involved

### 1. Forgot Password API Route

- **Path**: `/api/auth/forgot-password`
- **Method**: `POST`
- **File**: `src/app/api/auth/forgot-password/route.ts`
- **Responsibilities**: Validate email input, look up user, create reset token, enqueue email, return uniform response

### 2. Reset Password Validate Route

- **Path**: `/api/auth/reset-password/validate`
- **Method**: `GET`
- **File**: `src/app/api/auth/reset-password/validate/route.ts`
- **Responsibilities**: Accept token query parameter, verify token validity via `emailService.verifyToken()`, return `{ valid: true }` or 400 error

### 3. Reset Password API Route

- **Path**: `/api/auth/reset-password`
- **Method**: `POST`
- **File**: `src/app/api/auth/reset-password/route.ts`
- **Responsibilities**: Accept token + new password, validate password policy (12+ chars, uppercase, lowercase, number, special char), verify token, update password hash, invalidate token, revoke all sessions

### 4. Reset Password Page

- **Path**: `/reset-password`
- **File**: `src/app/(auth)/reset-password/page.tsx`
- **Responsibilities**: Extract token from URL, validate token via validate endpoint, show form or invalid-link state

### 5. Reset Password Form Component

- **File**: `src/features/auth/components/reset-password-form.tsx`
- **Responsibilities**: Password input with confirmation, client-side validation, submit to reset-password API, redirect to login on success

### 6. Email Service (Token Management)

- **File**: `src/modules/email/email.service.ts`
- **Methods**: `createResetPasswordToken()`, `verifyToken()`, `invalidateToken()`

### 7. Email Token Repository

- **File**: `src/modules/email/email-token.repository.ts`
- **Database**: `email_token` table
- **Operations**: `createToken()`, `findValidToken()`, `invalidateToken()`

### 8. Email Encryption Utilities

- **File**: `src/modules/email/email.encryption.ts`
- **Functions**: `hashToken()` (SHA-256), `generateSecureToken()` (crypto.randomBytes)

## Token Generation, Hashing, and Verification

### Generation

1. A cryptographically secure random token is generated using `crypto.randomBytes(32)` producing a 64-character hex string
2. A unique token ID is generated with the format `token_{timestamp_base36}_{random_hex}`

### Hashing

1. The plain token is hashed using SHA-256 via `hashToken()`
2. Only the hash is stored in the `email_token` table
3. The plain token is returned to the caller (email service) for inclusion in the reset URL

### Verification

1. User submits token from URL query parameter
2. The submitted token is hashed using SHA-256
3. The hash is looked up in `email_token` with type `reset_password` and `expiresAt > NOW()`
4. If found and not expired, token record is returned
5. The `usedAt` field is checked to prevent reuse

## Email Delivery via Queue

1. `createResetPasswordToken()` generates and stores the hashed token, returns plain token
2. `sendResetPassword()` renders the reset password email template with the reset URL
3. The rendered email is enqueued via `databaseEmailQueue.enqueue()` with priority 10
4. The email worker processes queued items and delivers via the configured provider (SendGrid, Resend, SMTP, etc.)
5. Email delivery status is tracked in the email logs

## Session Revocation Strategy

When a password is successfully reset:

1. The token is marked as used (`usedAt = new Date()`)
2. All active sessions for the user are deleted from the `session` table
3. The user must re-authenticate with their new password

This ensures that any potentially compromised sessions are immediately terminated.

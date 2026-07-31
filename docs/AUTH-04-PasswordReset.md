# AUTH-04 Password Reset Flow

## Overview

This document describes the complete password reset flow in Tamer Studio, from request to completion.

## Forgot Password Flow

### Steps

1. User navigates to `/forgot-password`
2. User enters their email address and submits the form
3. Client sends `POST /api/auth/forgot-password` with `{ email }`
4. API validates the email format
5. API looks up the user by email (case-insensitive)
6. Whether or not the user exists, the API returns the same success message (no account enumeration)
7. If the user exists:
   - A reset password token is created via `emailService.createResetPasswordToken()`
   - The token is hashed (SHA-256) and stored in the `email_token` table
   - A reset email is enqueued with the plain token in the URL
8. User sees a "Check your email" confirmation screen

### Rate Limiting

- **Window**: 1 hour (60 minutes)
- **Maximum**: 5 requests per window per key
- **Key prefix**: `auth:forgot-password`

### Client-Side Behavior

- After submission, the form transitions to a "check your email" state
- User can click "Try Another Email" to go back to the form
- User can click "Back to Login" to return to the login page

## Reset Password Flow

### Steps

1. User clicks the reset link in their email (`/reset-password?token=...`)
2. The page loads and extracts the token from the URL
3. The `TokenValidator` component calls `GET /api/auth/reset-password/validate?token=...`
4. The validate endpoint hashes the token and looks it up in `email_token`:
   - If valid and not expired: returns `{ valid: true }`
   - If invalid or expired: returns 400 error
5. If valid, the `ResetPasswordForm` component renders
6. User enters new password and confirmation
7. Client sends `POST /api/auth/reset-password` with `{ token, password }`
8. API validates password policy (12+ chars, uppercase, lowercase, number, special char)
9. API verifies the token again server-side
10. API checks the token hasn't been used (`usedAt` is null)
11. API looks up the user by `userId` or `email` from the token record
12. API invalidates the token (sets `usedAt`)
13. API updates the password hash (bcrypt, 12 rounds) in the `account` table
14. API deletes all sessions for the user (session revocation)
15. User is redirected to `/login` with a success toast

### Error States

| State | Behavior |
|-------|----------|
| Missing token | Shows "Invalid reset link" card with link to request a new one |
| Invalid/expired token (validate) | Shows "Invalid reset link" card |
| Password validation fails | Inline error messages below form fields |
| Passwords don't match | Inline error on confirm password field |
| API returns error | Toast with error message |
| Network error | Toast with generic error message |

## Token Lifecycle

### Creation

- **Token type**: `reset_password`
- **Token length**: 64 hex characters (32 bytes random)
- **Storage**: Only SHA-256 hash stored in database
- **Expiration**: 30 minutes from creation

### Validation

- Token is hashed and looked up by hash + type + expiration
- Must not be expired (`expiresAt > NOW()`)
- Must not be used (`usedAt IS NULL`)

### Invalidation

- On successful password reset, `usedAt` is set to current timestamp
- Token becomes permanently unusable

### Cleanup

- Expired tokens are naturally excluded by the `expiresAt > NOW()` query condition
- Consider periodic cleanup of old token records for database maintenance

## Rate Limiting

### Forgot Password Endpoint

- **Key**: `auth:forgot-password`
- **Window**: 1 hour
- **Limit**: 5 requests per window
- Returns HTTP 429 when exceeded

### Reset Password Endpoint

- No explicit rate limiting (protected by token validity and single-use enforcement)
- Brute force is mitigated by:
  - Token expiration (30 minutes)
  - Single-use tokens (marked as used after first successful use)
  - Password policy enforcement (complex password requirements)

## Security Measures

See [AUTH-04-Security.md](./AUTH-04-Security.md) for detailed security analysis.

### Summary

- Tokens hashed before storage (SHA-256)
- Single-use tokens (marked used after reset)
- 30-minute token expiration
- Rate limiting on forgot-password endpoint
- Session revocation after password change
- No account enumeration (uniform responses)
- Password policy enforcement (12+ chars, mixed case, numbers, special chars)
- Bcrypt hashing for passwords (12 rounds)

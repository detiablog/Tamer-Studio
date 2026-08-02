# SEC-01: Authentication Security

## Scope

Secure authentication mechanisms for user login, admin access, and service-to-service communication.

## Architecture

### Authentication Flow

1. User submits credentials via HTTPS-only endpoint
2. Credentials validated against Argon2id hash
3. JWT access token issued (15-minute expiry)
4. Refresh token issued (7-day expiry, rotated on use)
5. Optional TOTP 2FA challenge if enabled

### Password Policy

- Minimum 12 characters
- Requires uppercase, lowercase, number, special character
- Checked against breached password database (HaveIBeenPwned k-anonymity)
- Argon2id with memory cost 64MB, time cost 3, parallelism 4

### Session Management

- Access tokens: short-lived, bound to device fingerprint
- Refresh tokens: single-use, rotation on each use
- Concurrent session limit enforced per user role
- Automatic invalidation on password change

### Admin Authentication

- Master key required in addition to email/password
- Separate session with shorter timeout (10 minutes)
- All admin actions logged with full context

## Configuration

```
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=4
ACCESS_TOKEN_EXPIRY=900
REFRESH_TOKEN_EXPIRY=604800
MAX_CONCURRENT_SESSIONS=5
ADMIN_SESSION_TIMEOUT=600
```

## Commands

```bash
# Validate password hashing configuration
pnpm security:auth-audit

# Test brute force protection
pnpm security:brute-force-test

# Verify token expiry enforcement
pnpm security:token-expiry-check
```

## Verification

1. Verify Argon2id parameters in hash output
2. Confirm brute force lockout after 5 failed attempts
3. Test refresh token rotation rejects reused tokens
4. Validate session timeout expires correctly
5. Confirm admin master key requirement on protected routes
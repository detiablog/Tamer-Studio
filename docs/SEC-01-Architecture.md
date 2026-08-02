# SEC-01: Security Architecture

## Scope

This document defines the overall security architecture for Tamer Studio, covering defense-in-depth layers from network to application to data.

## Architecture

- **Network Layer**: WAF, DDoS protection, IP filtering, TLS 1.3 enforcement
- **Application Layer**: Input validation, output encoding, CSRF tokens, Content Security Policy
- **Data Layer**: AES-256 encryption at rest, field-level encryption for secrets, encrypted backups
- **Identity Layer**: JWT with short-lived access tokens, refresh token rotation, optional TOTP 2FA
- **Monitoring Layer**: Real-time threat detection, anomaly scoring, automated incident creation

### Trust Boundaries

- Public zone (CDN, WAF) to application zone (Next.js, API routes)
- Application zone to data zone (PostgreSQL, Redis, S3)
- Admin zone isolated with master key + 2FA requirement

### Threat Model

| STRIDE Category | Mitigation |
|---|---|
| Spoofing | JWT validation, session binding, 2FA |
| Tampering | Input sanitization, HMAC signatures |
| Repudiation | Immutable audit logs |
| Info Disclosure | Encryption, CSP headers, error sanitization |
| DoS | Rate limiting, request size limits, queue throttling |
| Elevation | RBAC, least privilege, privilege escalation guards |

## Configuration

```
# .env security settings
JWT_SECRET=<64-char-random>
ENCRYPTION_KEY=<32-char-random>
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_TIMEOUT_MINUTES=30
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
CSP_ENABLED=true
HSTS_ENABLED=true
```

## Commands

```bash
# Run security audit
pnpm security:audit

# Check for vulnerable dependencies
pnpm audit

# Validate CSP headers
pnpm security:csp-check

# Generate encryption keys
openssl rand -hex 32
```

## Verification

1. Confirm all security headers present in HTTP response
2. Verify TLS 1.3 enforcement via `openssl s_client`
3. Run OWASP ZAP baseline scan against staging
4. Validate audit log immutability by attempting direct DB modification
5. Confirm rate limiting triggers at configured thresholds

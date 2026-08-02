# SEC-01: OWASP Top 10 Mitigations

## Scope

Mitigations for OWASP Top 10 (2021) vulnerabilities across the Tamer Studio application stack.

## Architecture

### A01: Broken Access Control
- RBAC enforcement at middleware level
- Server-side session validation on every request
- Deny-by-default CORS configuration

### A02: Cryptographic Failures
- AES-256-GCM for data at rest
- TLS 1.3 for data in transit
- No sensitive data in URLs or logs

### A03: Injection
- Parameterized queries (Drizzle ORM)
- Input validation via Zod schemas
- Output encoding on all rendered content
- SQL injection prevention at ORM layer

### A04: Insecure Design
- Threat modeling during design phase
- Security requirements in user stories
- Rate limiting on all public endpoints

### A05: Security Misconfiguration
- Hardened HTTP security headers
- Default credentials removed
- Error messages sanitized
- Server version information stripped

### A06: Vulnerable Components
- Automated dependency scanning (pnpm audit)
- Lock file pinning
- Regular dependency updates

### A07: Authentication Failures
- Argon2id password hashing
- Brute force protection with lockout
- Session fixation prevention

### A08: Data Integrity Failures
- Signed cookies
- JWT signature verification
- Subresource integrity for external resources

### A09: Logging and Monitoring Failures
- Structured security event logging
- Alert on suspicious patterns
- Audit trail for all state changes

### A10: Server-Side Request Forgery
- Allowlist for outbound requests
- Internal network access restricted
- URL validation on user-supplied inputs

## Configuration

```
# Security headers
CSP_SCRIPT_SRC='self'
CSP_STYLE_SRC='self'
X_FRAME_OPTIONS=DENY
X_CONTENT_TYPE_OPTIONS=nosniff
REFERRER_POLICY=strict-origin-when-cross-origin
```

## Commands

```bash
# OWASP dependency check
pnpm security:owasp-check

# Security headers validation
pnpm security:headers-audit

# Full OWASP scan
pnpm security:owasp-scan
```

## Verification

1. Run OWASP ZAP scan against staging environment
2. Verify all security headers present in responses
3. Confirm parameterized queries prevent SQL injection
4. Test XSS prevention with crafted inputs
5. Validate CSRF token enforcement on state-changing endpoints

# SEC-01: Secret Management

## Scope

Secure handling of API keys, database credentials, encryption keys, and other sensitive configuration.

## Architecture

### Secret Storage Hierarchy

1. **Environment Variables**: Application secrets loaded from `.env` (not committed)
2. **Server-Side Only**: Secrets never exposed to client-side code
3. **Encrypted Storage**: API keys encrypted with workspace-specific key before DB storage
4. **Key Rotation**: Automated rotation schedules for critical secrets

### Encryption Architecture

- Master encryption key (MEK) from environment variable
- Per-workspace data encryption key (DEK) derived from MEK
- DEK encrypted with MEK, stored alongside encrypted data
- Key derivation: PBKDF2 with 100,000 iterations

### Secret Categories

- **Infrastructure**: Database URL, Redis URL, S3 credentials
- **Application**: JWT secret, session secret, CSRF secret
- **Third-Party**: AI provider API keys, payment gateway keys
- **Administrative**: Admin master key, admin session secret

### Rotation Policy

- JWT signing key: Rotated monthly
- API keys: Rotated every 90 days (user-triggered)
- Database credentials: Rotated quarterly
- Encryption keys: Rotated annually with re-encryption

## Configuration

```
ENCRYPTION_ALGORITHM=aes-256-gcm
KEY_DERIVATION_ITERATIONS=100000
SECRET_ROTATION_ENABLED=true
JWT_KEY_ROTATION_DAYS=30
API_KEY_ROTATION_DAYS=90
DB_CREDENTIAL_ROTATION_DAYS=90
```

## Commands

```bash
# Audit secret management
pnpm security:secret-audit

# Verify encryption at rest
pnpm security:encryption-check

# Test key rotation
pnpm security:rotation-test

# Check for exposed secrets
pnpm security:secret-scan
```

## Verification

1. Confirm API keys are encrypted in database (not plaintext)
2. Verify `.env` is in `.gitignore` and not committed
3. Test key rotation does not break active sessions
4. Validate secret scan finds no hardcoded credentials
5. Confirm encrypted data is unreadable without decryption key
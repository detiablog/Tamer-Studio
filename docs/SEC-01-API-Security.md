# SEC-01: API Security

## Scope

Security controls for all API endpoints including REST, webhooks, and AI provider integrations.

## Architecture

### Authentication Mechanisms

- **JWT Bearer Tokens**: Short-lived access tokens for user sessions
- **API Keys**: Long-lived keys for external integrations with HMAC signing
- **Service Tokens**: Internal service-to-service authentication
- **Webhook Signatures**: HMAC-SHA256 verification for incoming webhooks

### Rate Limiting

- Global: 100 requests/minute per IP
- Authenticated: 500 requests/minute per user
- Admin: 200 requests/minute per admin session
- AI generation: Per-provider rate limits

### Input Validation

- All inputs validated via Zod schemas at route boundary
- Request body size limits enforced
- Content-Type validation on all endpoints
- File upload metadata validated separately

### Response Security

- No sensitive data in error messages
- Stack traces stripped in production
- API versioning to prevent breaking changes
- Consistent error response format

## Configuration

```
API_RATE_LIMIT_GLOBAL=100
API_RATE_LIMIT_AUTHENTICATED=500
API_RATE_LIMIT_ADMIN=200
MAX_REQUEST_BODY_SIZE=10485760
API_KEY_ROTATION_DAYS=90
WEBHOOK_SIGNATURE_ALGO=sha256
```

## Commands

```bash
# Audit API security configuration
pnpm security:api-audit

# Test rate limiting
pnpm security:rate-limit-test

# Validate webhook signatures
pnpm security:webhook-verify

# Rotate API keys
pnpm security:rotate-api-keys
```

## Verification

1. Confirm rate limiting blocks excess requests with 429 status
2. Test API key validation rejects revoked keys
3. Verify webhook signature validation rejects tampered payloads
4. Validate request body size limits reject oversized requests
5. Confirm error responses do not leak internal details
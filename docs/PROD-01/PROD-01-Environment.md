# PROD-01: Environment Variables

**Document ID:** PROD-01-Environment  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines all environment variables required by Tamer Studio, their validation rules, secrets management practices, and environment isolation between dev, staging, and production.

---

## Environment Validation

The application validates environment variables at startup via `src/lib/env-validator.ts`:

```typescript
const REQUIRED_VARS = ["DATABASE_URL", "BETTER_AUTH_SECRET", "SESSION_SECRET"];
const RECOMMENDED_VARS = ["REDIS_URL", "STORAGE_PROVIDER", "SMTP_HOST", "OPENAI_API_KEY", "APP_URL", "JWT_SECRET", "ADMIN_SECRET"];
```

- **Required**: Application will not start without these
- **Recommended**: Application starts with warnings; features may be degraded

---

## Required Variables

| Variable | Description | Example | Validation |
|----------|-------------|---------|------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://tamer:pass@db:5432/tamer_studio` | Must be valid PostgreSQL URL |
| `BETTER_AUTH_SECRET` | Authentication secret | `<64-char random>` | Non-empty string |
| `SESSION_SECRET` | Session encryption key | `<64-char random>` | Non-empty string |

---

## Recommended Variables

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` | Required for caching/rate limiting |
| `STORAGE_PROVIDER` | Object storage backend | `local` | `local`, `r2`, `s3`, `minio` |
| `SMTP_HOST` | SMTP server hostname | - | Required for email delivery |
| `OPENAI_API_KEY` | OpenAI API key | - | Required for AI features |
| `APP_URL` | Application base URL | `http://localhost:3000` | Used in emails, callbacks |
| `JWT_SECRET` | JWT signing key | - | Required for API auth |
| `ADMIN_SECRET` | Admin panel secret key | - | Required for admin access |
| `SESSION_SECRET` | Session encryption | - | Required for session security |

---

## Application Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `APP_PORT` | Application port | `3000` |
| `APP_URL` | Application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Public app name | `Tamer Studio` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` |

---

## Database Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `POSTGRES_DB` | Database name | `tamer_studio` |
| `POSTGRES_USER` | Database user | `tamer` |
| `POSTGRES_PASSWORD` | Database password | - |
| `DB_PORT` | Database port | `5432` |

---

## Redis Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `REDIS_PORT` | Redis port | `6379` |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL | - |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token | - |

---

## Authentication Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BETTER_AUTH_SECRET` | Better Auth secret | - |
| `SESSION_SECRET` | Session encryption key | - |
| `JWT_SECRET` | JWT signing key | - |
| `ADMIN_SECRET` | Admin panel secret | - |
| `ADMIN_MASTER_KEY_HASH` | SHA-256 hash of admin master key | - |
| `AUTH_SECRET` | Legacy auth secret | - |
| `AUTH_URL` | Auth callback URL | `http://localhost:3000` |

---

## AI Provider Variables

| Variable | Description |
|----------|-------------|
| `AI_GATEWAY_PROVIDER` | Default AI provider (`kilo`) |
| `KILO_API_KEY` | Kilo API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `GOOGLE_API_KEY` | Google AI API key |
| `GOOGLE_AI_API_KEY` | Google AI API key (alias) |

---

## Storage Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STORAGE_PROVIDER` | Storage backend | `local` |
| `STORAGE_BUCKET` | Storage bucket name | `tamer-studio` |
| `STORAGE_ACCESS_KEY` | Storage access key | - |
| `STORAGE_SECRET_KEY` | Storage secret key | - |
| `STORAGE_ENDPOINT` | Storage endpoint URL | - |
| `STORAGE_PUBLIC_URL` | Public storage URL | - |
| `ASSET_STORAGE_DIR` | Local storage directory | `/tmp/tamer-assets` |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID | - |
| `R2_ACCESS_KEY_ID` | R2 access key | - |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | - |
| `R2_BUCKET` | R2 bucket name | - |
| `R2_PUBLIC_URL` | R2 public URL | - |

---

## Email Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP hostname | - |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | - |
| `SMTP_USERNAME` | SMTP username (alias) | - |
| `SMTP_PASSWORD` | SMTP password | - |
| `SMTP_FROM` | Sender email address | `noreply@tamerstudio.com` |

---

## Payment Variables

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `PAYMENT_PROVIDER` | Payment backend (`stripe`) |
| `IPAYMU_API_KEY` | iPaymu API key |
| `IPAYMU_VA` | iPaymu virtual account |
| `IPAYMU_ENVIRONMENT` | iPaymu environment (`sandbox`/`production`) |

---

## Security Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | `true` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

---

## Monitoring Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SENTRY_DSN` | Sentry DSN | - |
| `MONITORING_ENABLED` | Enable monitoring | `true` |
| `ENABLE_MONITORING` | Enable monitoring (alias) | `true` |
| `LOG_LEVEL` | Log level | `info` |
| `AUDIT_LOG_ENABLED` | Enable audit logging | `true` |

---

## Feature Flags

| Variable | Description | Default |
|----------|-------------|---------|
| `FEATURE_AFFILIATE` | Affiliate features | `true` |
| `FEATURE_DRAMA` | Drama studio features | `true` |
| `FEATURE_STORY` | Story features | `false` |
| `FEATURE_TALENT` | Talent features | `false` |
| `FEATURE_ADMIN` | Admin panel | `true` |

---

## Queue/Worker Variables

| Variable | Description |
|----------|-------------|
| `WORKER_MODE` | Enable worker mode (`true`/`false`) |
| `TRIGGER_SECRET_KEY` | Trigger.dev secret key |

---

## Secrets Management

### Generation Commands

```bash
# Generate BETTER_AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate ADMIN_MASTER_KEY_HASH
node -e "console.log(require('crypto').createHash('sha256').update('your-master-key').digest('hex'))"
```

### Best Practices

1. Never commit `.env` files to version control
2. Use different secrets for each environment
3. Rotate secrets periodically (quarterly recommended)
4. Use a secrets manager (e.g., Docker secrets, AWS Secrets Manager) for production
5. Limit access to production secrets to authorized personnel only

---

## Environment Isolation

### Development

```bash
NODE_ENV=development
DATABASE_URL=postgresql://tamer:password@localhost:5432/tamer_studio
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3000
```

### Staging

```bash
NODE_ENV=production
DATABASE_URL=postgresql://tamer:<secure>@staging-db:5432/tamer_studio
REDIS_URL=redis://staging-redis:6379
APP_URL=https://staging.tamerstudio.com
```

### Production

```bash
NODE_ENV=production
DATABASE_URL=postgresql://tamer:<secure>@db:5432/tamer_studio
REDIS_URL=redis://redis:6379
APP_URL=https://tamerstudio.com
```

---

## Commands

### Validate Environment

```bash
# Check required variables are set
node -e "require('./src/lib/env-validator').validateEnvironment()"
```

### Copy Environment Template

```bash
# Development
cp .env.example .env

# Production
cp production.env.example .env
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| Required vars set | `node -e "require('./src/lib/env-validator').validateEnvironment()"` | `valid: true` |
| No warnings | Same command | `warnings: []` |
| Secrets not in code | `grep -r "password\|secret\|key" src/ --include="*.ts" -l` | No hardcoded values |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| App won't start | Check required env vars | Set DATABASE_URL, BETTER_AUTH_SECRET, SESSION_SECRET |
| Features not working | Check recommended vars | Set REDIS_URL, SMTP_HOST, OPENAI_API_KEY |
| Auth failures | Check auth secrets | Verify BETTER_AUTH_SECRET, SESSION_SECRET |
| Email not sending | Check SMTP vars | Verify SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD |
| Storage errors | Check storage vars | Verify STORAGE_PROVIDER, credentials |

# PROD-01: Security

**Document ID:** PROD-01-Security  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the security configuration for Tamer Studio, including HTTPS, security headers, secret rotation, container security, rate limiting, and cookie security.

---

## Security Architecture

```
Client --> Nginx (SSL/TLS) --> Application --> PostgreSQL
                    |                           |
                    v                           v
              Security Headers            Encrypted Data
              Rate Limiting               Parameterized Queries
              CORS Protection             Authentication
```

---

## HTTPS Configuration

### SSL/TLS Setup

```nginx
# config/nginx/nginx.conf
server {
    listen 443 ssl http2;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
}
```

### HTTP to HTTPS Redirect

```nginx
server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}
```

### Certificate Management

```bash
# Self-signed (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout config/nginx/ssl/key.pem \
  -out config/nginx/ssl/cert.pem

# Let's Encrypt (production)
certbot certonly --webroot -w /var/www/html -d yourdomain.com
```

---

## Security Headers

### Configuration

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:;" always;
```

### Header Descriptions

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |
| `Content-Security-Policy` | `default-src 'self'; ...` | Content security policy |

### Additional Headers (Recommended)

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

---

## Secret Rotation

### Rotation Schedule

| Secret | Frequency | Method |
|--------|-----------|--------|
| Database password | Quarterly | Manual |
| Auth secrets | Quarterly | Manual |
| API keys | As needed | Manual |
| SSL certificates | Auto (Let's Encrypt) | Certbot |

### Rotation Procedure

```bash
# 1. Generate new secret
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 2. Update in secrets manager / .env

# 3. Restart application
docker compose restart app worker

# 4. Verify
curl http://localhost/health
```

### Secrets Management

| Secret | Location | Access |
|--------|----------|--------|
| DATABASE_URL | .env | App, Worker |
| BETTER_AUTH_SECRET | .env | App |
| SESSION_SECRET | .env | App |
| JWT_SECRET | .env | App |
| API keys | .env | App |
| SMTP credentials | .env | App, Worker |

---

## Container Security

### Non-Root User

```dockerfile
# Dockerfile
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs
```

### Read-Only Filesystem

```yaml
# docker-compose.yml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /app/data
```

### Resource Limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### Security Scanning

```bash
# Scan Docker image
docker scout cves tamer-studio:latest

# Scan dependencies
pnpm audit
```

---

## Rate Limiting

### Nginx Rate Limiting

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Apply to endpoints
location /api/ {
    limit_req zone=api burst=20 nodelay;
}

location /api/auth {
    limit_req zone=login burst=3 nodelay;
}
```

### Application Rate Limiting

```typescript
// Using @upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  analytics: true,
});
```

### Rate Limit Configuration

| Endpoint | Window | Max Requests | Burst |
|----------|--------|--------------|-------|
| General API | 15 min | 100 | 20 |
| Authentication | 15 min | 10 | 3 |
| AI Generation | 1 hour | 50 | 10 |

---

## Cookie Security

### Session Cookies

```typescript
// Better Auth configuration
{
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    defaultCookieAttributes: {
      secure: true,      // HTTPS only
      httpOnly: true,    // No JavaScript access
      sameSite: "lax",   // CSRF protection
      path: "/",
    },
  },
}
```

### Cookie Attributes

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `secure` | `true` | HTTPS only |
| `httpOnly` | `true` | No JS access |
| `sameSite` | `lax` | CSRF protection |
| `path` | `/` | Site-wide |

---

## CORS Configuration

```typescript
// next.config.ts or middleware
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "http://localhost:3000",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};
```

---

## Input Validation

### Zod Schema Validation

```typescript
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Validate input
const result = LoginSchema.safeParse(input);
if (!result.success) {
  throw new ValidationError(result.error.issues);
}
```

---

## Authentication Security

### Password Hashing

```typescript
// bcryptjs for password hashing
import bcrypt from "bcryptjs";

const salt = await bcrypt.genSalt(12);
const hash = await bcrypt.hash(password, salt);
```

### Session Management

| Setting | Value |
|---------|-------|
| Session expiry | 24 hours |
| Cookie cache | 5 minutes |
| Secure cookies | Yes |
| HTTP-only | Yes |

---

## Commands

### Security Checks

```bash
# Check SSL certificate
openssl s_client -connect yourdomain.com:443

# Check security headers
curl -I https://yourdomain.com

# Check rate limiting
for i in {1..100}; do curl -s -o /dev/null -w "%{http_code}\n" https://yourdomain.com/api/test; done

# Check CORS
curl -I -H "Origin: https://evil.com" https://yourdomain.com/api/test
```

### Dependency Audit

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit fix
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| HTTPS active | `curl -I http://localhost` | 301 to HTTPS |
| Security headers | `curl -I https://localhost` | All headers present |
| Rate limiting | Send 100+ requests | 429 after limit |
| Cookie security | Check Set-Cookie header | Secure, HttpOnly, SameSite |
| CORS working | Check Access-Control headers | Correct origin |
| No vulnerabilities | `pnpm audit` | No critical/high |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| SSL errors | Check certificate validity | Renew certificate, verify chain |
| CORS blocked | Check Access-Control headers | Verify CORS_ORIGIN, allowed methods |
| Rate limit too strict | Check rate limit config | Adjust thresholds |
| Cookie not set | Check Secure/HttpOnly flags | Verify HTTPS, cookie attributes |
| Session expired | Check session timeout | Adjust session expiry, refresh tokens |

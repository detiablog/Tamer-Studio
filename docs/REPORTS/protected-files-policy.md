# Protected Files Policy

**Sprint**: HOTFIX-ENV-01  
**Date**: 2026-08-03  
**Classification**: Permanent Engineering Law  

---

## Purpose

This policy establishes permanent rules for protecting critical configuration and system files from unauthorized modification during sprints that do not explicitly target them.

---

## Environment Protection Law

### Protected Files

The following files are **IMMUTABLE** outside dedicated sprints:

| File | Category | Reason |
|------|----------|--------|
| `.env` | Environment | Contains all runtime secrets and credentials |
| `.env.local` | Environment | Local development overrides with real secrets |
| `.env.production` | Environment | Production configuration |
| `.env.example` | Environment | Template for environment setup |
| `production.env.example` | Environment | Production deployment template |

### Protected Variables

The following environment variable categories are **IMMUTABLE** outside dedicated sprints:

| Category | Variables | Reason |
|----------|-----------|--------|
| **Founder Credentials** | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Founder account bootstrap |
| **Founder Master Key** | `ADMIN_MASTER_KEY`, `ADMIN_MASTER_KEY_HASH` | Founder authentication |
| **Auth Secrets** | `BETTER_AUTH_SECRET`, `AUTH_SECRET`, `BETTER_AUTH_URL`, `AUTH_URL` | Authentication system |
| **Database** | `DATABASE_URL` | Database connectivity |
| **SMTP** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Email delivery |
| **Storage** | `STORAGE_PROVIDER`, `ASSET_STORAGE_DIR`, `R2_*` | File storage |
| **Payment Gateway** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `IPAYMU_*`, `TRANSFER_*` | Payment processing |
| **AI Provider** | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY` | AI service access |
| **Encryption** | `EMAIL_ENCRYPTION_KEY` | Credential encryption |
| **Redis** | `REDIS_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Caching and rate limiting |

### Modification Rules

These variables may ONLY be modified during dedicated:

- **Authentication** sprints
- **Installation** sprints
- **Security** sprints
- **Infrastructure** sprints
- **Environment** sprints

**Any other sprint attempting to modify them MUST STOP immediately.**

---

## Protected File Law

### System Files

The following source files are protected:

| File | Category | Reason |
|------|----------|--------|
| `next.config.*` | Build | Next.js configuration — affects entire build pipeline |
| `proxy.ts` | Network | Proxy configuration — affects routing |
| `middleware.ts` | Auth | Auth middleware — affects security |
| `bootstrap.ts` | System | System bootstrap — affects initialization |
| `installation.service.ts` | System | Installation flow — affects setup |
| `auth.ts` | Auth | Authentication setup — affects login |
| `permissions.ts` | Auth | Permission definitions — affects access control |
| `db/client.ts` | Data | Database client — affects all data access |
| `config.ts` | System | Central configuration — affects all modules |

### Modification Rules

These files may ONLY be modified if they are inside the **approved sprint scope**.

If a file becomes necessary during a sprint:

1. **STOP** work on the file
2. **Explain** why the file is needed
3. **Request approval** before continuing
4. **Document** the change in the sprint report

---

## Approved Modification List Law

### Requirement

Every sprint MUST begin by generating an **Approved Modification List**.

### Format

```
## Approved Modification List

### Files Approved for Modification
- path/to/file1.ts
- path/to/file2.ts

### Files Explicitly Excluded
- path/to/protected/file1.ts
- path/to/protected/file2.ts

### Justification
[Why each file modification is necessary]
```

### Rules

1. Only files inside this list may be modified
2. If another file becomes necessary:
   - **STOP**
   - Explain why
   - Request approval before continuing
3. The Approved Modification List must be reviewed at sprint retrospective

---

## Enforcement

### Pre-Sprint Checklist

Before any sprint begins:

- [ ] Generate Approved Modification List
- [ ] Review protected files list
- [ ] Verify no protected files are in scope
- [ ] Get sprint scope approval

### During Sprint

If a protected file modification is detected:

1. **Halt** the modification immediately
2. **Log** the attempted violation
3. **Generate** a dependency report
4. **Do not modify** the file
5. **Escalate** to sprint lead

### Post-Sprint

At sprint retrospective:

- Review all files modified
- Verify compliance with Approved Modification List
- Document any scope violations
- Update protection policies if needed

---

## Exceptions

The only valid exceptions for modifying protected files are:

1. **Emergency hotfix** — Critical security or data loss issue
2. **Sprint explicitly targeting the file** — Listed in sprint scope
3. **Infrastructure migration** — Coordinated with DevOps

All exceptions must be:
- Documented in the sprint report
- Approved by the sprint lead
- Logged in the audit trail

---

## References

- `docs/audit/environment-restoration-audit.md` — The incident that prompted this policy
- `docs/reports/environment-restoration-report.md` — Restoration details
- `docs/reports/scope-violation-analysis.md` — Scope violation analysis

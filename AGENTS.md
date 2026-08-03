# Engineering Constitution — Tamer Studio

**Last Updated**: 2026-08-03  
**Origin**: HOTFIX-ENV-01 — Environment Protection Laws  

---

## Core Principles

### Scope > Assumption

Never assume a file is in scope. If it's not in the Approved Modification List, don't touch it.

### Protected Files > Automation

Protected files take precedence over automation. No CI/CD, build script, or tool should modify protected files without explicit approval.

### Configuration > Cleanup

Configuration preservation takes priority over code cleanup. Never remove configuration to "clean up" code.

### Never Delete Configuration Without Explicit Approval

Configuration variables, environment entries, and system settings must never be deleted without explicit sprint scope approval.

---

## Environment Protection Law

### Protected Files

The following environment files are **IMMUTABLE** outside dedicated sprints:

- `.env`
- `.env.local`
- `.env.production`
- `.env.example`
- `production.env.example`

### Protected Variable Categories

| Category | Variables | Modification Allowed Only During |
|----------|-----------|--------------------------------|
| Founder Credentials | `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Installation, Authentication sprints |
| Founder Master Key | `ADMIN_MASTER_KEY`, `ADMIN_MASTER_KEY_HASH` | Installation, Authentication, Security sprints |
| Auth Secrets | `BETTER_AUTH_SECRET`, `AUTH_SECRET`, `BETTER_AUTH_URL`, `AUTH_URL` | Authentication, Security sprints |
| Database | `DATABASE_URL` | Infrastructure, Environment sprints |
| SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM` | Infrastructure, Email sprints |
| Storage | `STORAGE_PROVIDER`, `ASSET_STORAGE_DIR`, `R2_*` | Infrastructure, Storage sprints |
| Payment Gateway | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `IPAYMU_*`, `TRANSFER_*` | Payment, Commerce sprints |
| AI Provider | `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_AI_API_KEY` | AI, Infrastructure sprints |
| Encryption | `EMAIL_ENCRYPTION_KEY` | Security, Authentication sprints |
| Redis | `REDIS_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Infrastructure, Caching sprints |

### Rules

1. Protected variables are **IMMUTABLE** outside their designated sprints
2. Any sprint attempting to modify them **MUST STOP**
3. Generate a dependency report before modifying any protected variable
4. Do not modify protected variables without explicit approval

---

## Protected File Law

### Source Files

The following source files are protected:

| File | Category |
|------|----------|
| `next.config.*` | Build Configuration |
| `proxy.ts` | Network/Routing |
| `middleware.ts` | Authentication/Security |
| `bootstrap.ts` | System Initialization |
| `installation.service.ts` | Installation Flow |
| `auth.ts` | Authentication Setup |
| `permissions.ts` | Access Control |
| `db/client.ts` | Database Access |
| `config.ts` | Central Configuration |

### Rules

1. These files may ONLY be modified if inside the **approved sprint scope**
2. If a file becomes necessary during a sprint:
   - **STOP**
   - Explain why the file is needed
   - Request approval before continuing
3. Generate a dependency report before modifying any protected file

---

## Approved Modification List Law

### Requirement

Every sprint MUST begin by generating an **Approved Modification List**.

### Format

```markdown
## Approved Modification List

### Files Approved for Modification
- src/feature/new-feature.ts
- src/components/FeatureComponent.tsx

### Files Explicitly Excluded
- src/core/config/config.ts (Protected)
- .env (Protected)

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

## Sprint Scope Enforcement

### Pre-Sprint Checklist

- [ ] Generate Approved Modification List
- [ ] Review Protected Files list
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

The only valid exceptions for modifying protected files:

1. **Emergency hotfix** — Critical security or data loss issue
2. **Sprint explicitly targeting the file** — Listed in sprint scope
3. **Infrastructure migration** — Coordinated with DevOps

All exceptions must be:
- Documented in the sprint report
- Approved by the sprint lead
- Logged in the audit trail

---

## References

- `docs/audit/environment-restoration-audit.md` — The incident that prompted these laws
- `docs/reports/protected-files-policy.md` — Detailed protection policy
- `docs/reports/scope-violation-analysis.md` — Scope violation analysis

# ADR-012 — Production Engineering Rules

Status: Accepted

These rules are mandatory across the entire codebase.

## Architecture

- No business logic inside UI.
- No direct database access from UI.
- No direct provider access from Feature modules.
- No feature-to-feature dependency.
- Every database access must go through Repository.
- Every AI request must go through AIRuntime.

## Security

- No plaintext secrets.
- All credentials loaded from Config Service.
- Every security-sensitive action must be audited.
- CSRF protection is mandatory.
- Secure cookies only.

## Quality

- Build must pass.
- Typecheck must pass.
- Lint must pass.
- Runtime tests must pass.
- No dead code.
- No duplicate business logic.

## Governance

Every architectural decision must answer:

1. What problem does it solve?
2. Why is it needed?
3. What alternatives were considered?
4. What are the long-term consequences?
5. Which ADR does it follow?

If none applies, create a new ADR before implementation.
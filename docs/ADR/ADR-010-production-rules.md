# ADR-010 — Production Rules

## Status

Accepted

## Decision

The following rules are mandatory.

## Rules

- No business logic inside UI.
- No direct database access from UI.
- No plaintext secrets.
- No duplicated authentication logic.
- No direct feature-to-feature communication.
- Every security-sensitive action must be audited.
- Every major architectural change must update this ADR.

---

# Architecture Governance

Every future architectural decision must answer the following questions.

1. What problem does it solve?

2. Why is it necessary?

3. What alternatives were considered?

4. What are the long-term consequences?

5. Does it follow ADR-000?

If not, the decision must be reviewed before implementation.
# ADR-005 — Better Auth Integration

## Status

Accepted

## Decision

Better Auth is responsible only for user authentication.

Administrator authentication remains independent.

## Design Rules

- Better Auth never authenticates administrators.
- Admin sessions never depend on Better Auth.
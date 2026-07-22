# ADR-001 — Authentication Architecture

## Status

Accepted

## Background

User authentication and administrator authentication have different security requirements and operational responsibilities.

Using a single authentication mechanism increases security risks and maintenance complexity.

## Decision

Authentication is separated into two independent systems.

User Authentication

- Better Auth

Administrator Authentication

- Dedicated Admin Authentication

## Design Rules

- User sessions and admin sessions must never be shared.
- Admin authentication must remain operational independently of Better Auth.
- Authentication logic must never exist inside UI components.

## Future Evolution

Possible future integrations:

- Enterprise SSO
- OAuth Providers
- Passkeys
- MFA
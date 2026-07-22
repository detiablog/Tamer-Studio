# ADR-007 — Platform Core

## Status

Accepted

## Background

Direct communication between feature modules creates strong coupling.

## Decision

Business modules communicate only through Platform Core.

Platform services include:

- Authentication
- Billing
- Wallet
- Credits
- AI
- Assets
- Workflow
- Notifications
- Audit
- Analytics
- Configuration

## Design Rules

Feature modules never communicate directly.

Correct

Feature

↓

Platform Core

↓

Feature

Incorrect

Feature

↓

Feature
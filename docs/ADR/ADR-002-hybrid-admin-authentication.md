# ADR-002 — Hybrid Admin Authentication

## Status

Accepted

## Background

Administrators require an emergency recovery mechanism without compromising operational security.

## Decision

Administrator authentication uses two authentication layers.

Layer 1

Operational Admin Credentials

Stored inside the database.

Layer 2

Master Emergency Credentials

Stored only inside environment variables.

## Design Rules

Authentication flow

Database

↓

Master Key

↓

Reject

Master credentials

- Cannot be modified from UI
- Cannot be stored in database
- Used only for emergency recovery

## Future Evolution

Hardware Security Keys

Enterprise Identity Providers
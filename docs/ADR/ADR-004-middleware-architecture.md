# ADR-004 — Middleware Architecture

## Status

Accepted

## Background

Authentication logic should never be duplicated across layouts and pages.

## Decision

The platform uses centralized middleware.

Dedicated guards

requireUser()

requireAdmin()

## Design Rules

No page performs authentication manually.

Middleware is responsible for route protection.
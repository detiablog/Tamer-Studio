# ADR-003 — Routing Architecture

## Status

Accepted

## Background

Public pages, authenticated pages and administrative pages require different routing behavior.

## Decision

Routing is divided into three areas.

/

Marketing Website

/dashboard

Authenticated User Area

/admin

Administrator Area

/admin/login

Administrator Login

## Design Rules

- Marketing routes never require authentication.
- Dashboard routes always require authenticated users.
- Admin routes always require administrator authentication.
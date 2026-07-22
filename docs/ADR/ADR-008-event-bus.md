# ADR-008 — Event Bus

## Status

Accepted

## Background

Cross-module dependencies should be minimized.

## Decision

Business events are published through an internal event bus.

Examples

USER_CREATED

USER_LOGIN

PAYMENT_SUCCESS

PROJECT_CREATED

WORKFLOW_COMPLETED

AI_GENERATION_FINISHED

PROMOTION_USED

## Design Rules

Modules publish events.

Modules subscribe to events.

Modules never directly invoke unrelated business modules.
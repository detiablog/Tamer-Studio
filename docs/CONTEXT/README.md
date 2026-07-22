# AI Context Engine

Version: 2.0

Status: Active

---

## Purpose

The Context Engine provides AI assistants with a concise understanding of Tamer Studio.

Instead of reading every document, AI should first load the relevant context files.

This reduces token usage while improving consistency.

---

## Design Principles

Summarize, never duplicate.

Reference, never replace.

Always point to the authoritative document.

---

## Context Categories

Business

Product

Architecture

Engineering

Coding

Security

Database

Workflow

AI Gateway

Testing

Deployment

---

## Context Loading

Load only the contexts relevant to the requested task.

Do not load every context by default.
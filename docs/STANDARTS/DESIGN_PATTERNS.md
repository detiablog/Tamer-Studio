# Engineering Design Patterns

Version: 2.0

---

# Purpose

This document defines approved software design patterns used in Tamer Studio.

AI and developers should prefer these patterns instead of inventing new ones.

---

# Repository Pattern

Purpose

Separate persistence from business logic.

Used For

Database access

Examples

WalletRepository

UserRepository

OrderRepository

---

# Service Pattern

Purpose

Business logic.

Examples

WalletService

PaymentService

AIProviderService

---

# Factory Pattern

Purpose

Create provider-specific objects.

Examples

AI Provider Factory

Payment Factory

Storage Factory

---

# Strategy Pattern

Purpose

Runtime behavior switching.

Examples

AI Providers

Payment Providers

Export Formats

---

# Adapter Pattern

Purpose

Normalize external APIs.

Examples

Gemini Adapter

OpenAI Adapter

OpenRouter Adapter

---

# Provider Pattern

Purpose

Application-wide shared services.

Examples

Theme

Authentication

Localization

---

# Circuit Breaker

Purpose

Prevent cascading failures.

Examples

AI Gateway

Payment Gateway

External APIs

---

# Retry Pattern

Purpose

Recover from temporary failures.

Used For

Webhook

AI Requests

Payment Verification

---

# Cache Aside

Purpose

Improve performance.

Examples

Configuration

Pricing

Static Data

---

# Pattern Selection Rules

Prefer existing approved patterns.

Avoid creating custom patterns unless justified by an ADR.
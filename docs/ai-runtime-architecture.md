# AI Runtime Architecture

**Date:** 2026-07-29  
**Sprint:** AI-01  

---

## Architecture Overview

### AI Request Pipeline
```
User Request
  → executeAIRequest()
  → Provider Selection (provider-registry.ts)
  → Credit Check (WalletService + CreditEngine)
  → Credit Reserve (debit "reserve")
  → Provider Adapter.execute()
  → Cost Calculation
  → Credit Adjustment (release excess / charge deficit)
  → Audit Log (audit.repository.ts)
  → Response to User
```

### Provider Adapter Pattern
```
AIProviderAdapter (interface)
  ├─ OpenAIAdapter   → openai-adapter.ts
  ├─ AnthropicAdapter → anthropic-adapter.ts
  └─ GoogleAdapter    → google-adapter.ts
```

Each adapter implements:
- `execute(input)` → ProviderOutput
- `estimateCost(input)` → number (USD)
- `getModels()` → string[]

### Core Files

| File | Purpose | Lines |
|------|---------|-------|
| `ai-runtime.ts` | Main execution engine — orchestrates credits, providers, audit | 205 |
| `provider-registry.ts` | Provider registry — maps names to adapters, lists models | 99 |
| `providers/openai-adapter.ts` | OpenAI API adapter | 75 |
| `providers/anthropic-adapter.ts` | Anthropic API adapter | ~70 |
| `providers/google-adapter.ts` | Google Gemini API adapter | ~70 |

### Database Tables

| Table | Purpose |
|-------|---------|
| ai_provider | Provider configuration |
| ai_provider_model | Model registry |
| production_metrics | Usage metrics |
| user_activity_metrics | User AI usage tracking |
| workspace_metrics | Workspace AI usage tracking |
| wallet | Credit balance |
| credit_transaction | Credit ledger |
| credit_reservation | Credit holds |
| audit_log | All AI execution audit entries |

### API Endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| GET /api/ai-providers | Public | List available providers and models |
| POST /api/production/execute | User | Execute AI generation request |
| GET /api/admin/ai-providers | Admin | Admin AI provider management |

---

## Providers Supported

| Provider | Models | Status |
|----------|--------|--------|
| OpenAI | gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-4, gpt-3.5-turbo, o1, o1-mini, o3-mini | Available (requires API key) |
| Anthropic | claude-3-5-sonnet, claude-3-opus, claude-3-haiku | Available (requires API key) |
| Google | gemini-1.5-pro, gemini-1.5-flash, gemini-pro | Available (requires API key) |

---

## Credit Integration Flow

```
1. Estimate cost from provider adapter
2. Convert USD to credits (CreditEngine.convertCostToCredits)
3. Check wallet balance >= estimated credits
4. Reserve estimated credits (debit type: "reserve")
5. Execute AI request
6. Calculate actual cost from token usage
7. Adjust credits:
   - If overcharged → release difference (type: "release")
   - If undercharged → charge difference (type: "usage_debit")
8. On failure → release full reservation (type: "release")
```

---

## Fixes Applied

| # | Fix | Severity |
|---|-----|----------|
| 1 | Replaced direct `db.insert(auditLog)` with `DefaultAuditRepository.createAuditEntry()` | HIGH |
| 2 | Removed inline `logAudit()` function (was duplicating repository logic) | MEDIUM |

---

## Production Readiness

| # | Criterion | Status |
|---|-----------|--------|
| 1 | All AI requests pass through gateway | PASS |
| 2 | Provider adapter pattern | PASS (3 adapters) |
| 3 | Credit integration | PASS (reserve/execute/adjust) |
| 4 | Audit logging | PASS (via repository) |
| 5 | Cost estimation | PASS |
| 6 | No direct DB access from runtime | PASS (fixed) |
| 7 | No mock implementations | PASS |
| 8 | No hardcoded credentials | PASS (env vars) |
| 9 | Build compiles | PASS |

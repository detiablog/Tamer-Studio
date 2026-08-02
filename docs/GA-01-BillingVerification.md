# GA-01 Billing Verification

## Scope

This document covers the billing system verification for Tamer Studio v1.0 GA release, ensuring accurate billing, invoicing, and payment processing.

## Architecture

### Billing Components

```
┌─────────────────┐
│   User Actions   │
│  (AI Credits,    │
│   Storage, API)  │
└────────┬────────┘
         │
┌────────┴────────┐
│  Usage Tracking  │
│  (Real-time)     │
└────────┬────────┘
         │
┌────────┴────────┐
│  Billing Engine  │
│  (Monthly calc)  │
└────────┬────────┘
         │
┌────────┴────────┐
│  Stripe Billing  │
│  (Invoicing)     │
└─────────────────┘
```

### Billing Cycle

1. **Usage Tracking** - Real-time tracking of AI credits, storage, API calls
2. **Monthly Aggregation** - Usage aggregated at billing cycle end
3. **Invoice Generation** - Stripe invoice created with usage details
4. **Payment Processing** - Automatic charge via Stripe
5. **Payment Confirmation** - Webhook updates billing status

### Usage Categories

| Category | Unit | Free Limit | Starter | Pro |
|----------|------|------------|---------|-----|
| AI Credits | credits | 100/mo | 1,000/mo | 10,000/mo |
| Storage | GB | 1 | 10 | 100 |
| API Calls | calls | 1,000/mo | 10,000/mo | 100,000/mo |
| Team Members | users | 1 | 5 | 20 |

### Overage Handling

- Overage charges at plan-specific rates
- Soft limit: Warning at 80% usage
- Hard limit: Service degradation at 100%
- Overage billing: Next invoice cycle

## Configuration

### Billing Environment Variables

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
BILLING_CYCLE_DAY=1
OVERAGE_RATE_AI=0.01
OVERAGE_RATE_STORAGE=0.10
OVERAGE_RATE_API=0.001
```

### Usage Tracking Schema

```typescript
interface UsageRecord {
  id: string;
  userId: string;
  category: "ai_credits" | "storage" | "api_calls";
  amount: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
```

## Commands

### Verify Usage Tracking

```bash
# Check current usage
curl -X GET http://localhost:3000/api/commerce/wallet

# Validate coupon
curl -X POST http://localhost:3000/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "LAUNCH20"}'
```

### Test Invoice Generation

```bash
# Trigger manual invoice (admin)
curl -X POST http://localhost:3000/api/commerce/checkout \
  -H "Content-Type: application/json" \
  -d '{"planId": "starter", "userId": "test-user"}'
```

### Verify Webhook Handling

```bash
# Test payment success webhook
curl -X POST http://localhost:3000/api/commerce/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "invoice.payment_succeeded"}'

# Test payment failure webhook
curl -X POST http://localhost:3000/api/commerce/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "invoice.payment_failed"}'
```

## Verification

- [ ] Usage tracking records all categories
- [ ] Monthly aggregation calculates correctly
- [ ] Invoice generation produces accurate amounts
- [ ] Stripe payment processing works
- [ ] Webhook handling updates billing status
- [ ] Overage charges applied correctly
- [ ] Coupon codes apply discounts
- [ ] Tax calculation configured
- [ ] Failed payment retry logic works
- [ ] Subscription downgrade handled correctly

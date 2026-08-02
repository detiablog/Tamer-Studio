# GA-01 Commercial Readiness

## Scope

This document defines the commercial readiness criteria for Tamer Studio v1.0 GA release, ensuring the platform is ready for paying customers.

## Architecture

### Commercial Components

1. **Subscription Management** - Plan selection, upgrades, downgrades
2. **Payment Processing** - Stripe integration, invoicing
3. **Billing** - Usage tracking, overage charges
4. **License Management** - Feature gating, limits
5. **Revenue Analytics** - MRR, churn, LTV tracking

### Subscription Plans

| Plan | Price | Features | Limits |
|------|-------|----------|--------|
| Free | $0/mo | Basic features | 100 AI credits/mo |
| Starter | $29/mo | All features | 1,000 AI credits/mo |
| Pro | $99/mo | All features | 10,000 AI credits/mo |
| Enterprise | Custom | All features + SLA | Unlimited |

### Payment Flow

```
User selects plan -> Stripe Checkout -> Payment success -> Webhook -> Update subscription -> Enable features
```

### Revenue Metrics

- **MRR** (Monthly Recurring Revenue)
- **ARR** (Annual Recurring Revenue)
- **Churn Rate** - Monthly customer churn
- **LTV** (Lifetime Value)
- **CAC** (Customer Acquisition Cost)

## Configuration

### Stripe Configuration

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
```

### Feature Gating

Feature access is controlled by subscription tier:
- Free: Basic AI, limited storage
- Starter: All AI providers, 10GB storage
- Pro: Priority support, 100GB storage
- Enterprise: Custom limits, SLA

## Commands

### Verify Stripe Integration

```bash
# Test webhook
curl -X POST http://localhost:3000/api/commerce/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test" \
  -d '{"type": "checkout.session.completed"}'

# List plans
curl -X GET http://localhost:3000/api/commerce/plans
```

### Test Payment Flow

```bash
# Create checkout session
curl -X POST http://localhost:3000/api/commerce/checkout \
  -H "Content-Type: application/json" \
  -d '{"planId": "starter", "userId": "test-user"}'
```

### Verify Billing

```bash
# Check wallet balance
curl -X GET http://localhost:3000/api/commerce/wallet

# Validate coupon
curl -X POST http://localhost:3000/api/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code": "LAUNCH20"}'
```

## Verification

- [ ] Stripe integration tested with real cards
- [ ] Webhook handling verified
- [ ] Subscription lifecycle tested (create, upgrade, cancel)
- [ ] Invoice generation working
- [ ] Feature gating enforced
- [ ] Usage tracking accurate
- [ ] Revenue metrics calculating correctly
- [ ] Tax handling configured

# OPS-01: Billing Dashboard

## Scope

This document describes the billing monitoring subsystem within the Operations Center, covering revenue metrics, payment status tracking, and subscription health monitoring.

## Architecture

### Revenue Metrics

The billing dashboard provides real-time visibility into:

- **Revenue Today**: Total revenue collected today.
- **Revenue This Week**: Total revenue collected this week.
- **Revenue This Month**: Total revenue collected this month.
- **Monthly Recurring Revenue (MRR)**: Recurring subscription revenue.
- **Average Order Value**: Average transaction value across all payment methods.
- **Refund Rate**: Percentage of transactions that resulted in refunds.

### Payment Status Tracking

| Status | Description |
|---|---|
| pending | Payment initiated but not yet confirmed |
| waiting_payment | Awaiting customer payment |
| paid | Payment successfully processed |
| failed | Payment processing failed |
| cancelled | Payment cancelled by user or system |
| expired | Payment link expired |
| refunded | Payment fully refunded |

### Subscription Health

- **Active Subscriptions**: Count of currently active subscriptions.
- **Churn Rate**: Percentage of subscriptions cancelled this period.
- **Upgrade Rate**: Percentage of subscriptions upgraded this period.
- **Pending Payments**: Count of payments in pending or waiting state.

## Configuration

| Setting | Default | Description |
|---|---|---|
| `BILLING_REFRESH_INTERVAL` | `60000` | Billing data refresh interval (ms) |
| `REVENUE_CURRENCY` | `IDR` | Default revenue currency |
| `REFUND_RATE_WARNING` | `5` | Refund rate warning threshold (%) |
| `PAYMENT_TIMEOUT_HOURS` | `24` | Hours before pending payment is flagged |

## Commands

```bash
# View billing summary
pnpm ops:billing-summary

# View payment history
pnpm ops:billing-payments --period 30d

# Export billing report
pnpm ops:billing-export --format csv --period 30d

# View subscription status
pnpm ops:billing-subscriptions

# Check pending payments
pnpm ops:billing-pending
```

## Verification

- Revenue metrics are accurate and updated in real-time.
- Payment status transitions are correctly tracked.
- Subscription health metrics reflect current platform state.
- Billing reports can be exported in CSV and JSON formats.
- Refund rate warnings trigger when thresholds are exceeded.

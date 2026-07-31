# BUS-PAYMENT-01 — Database Design

## Tables

| Table | Purpose |
|-------|---------|
| payment | Central transaction table |
| paymentItem | Checkout line items |
| paymentInvoice | Generated invoices |
| paymentRefund | Refund tracking |
| paymentWebhook | Webhook event log |
| paymentLog | Audit trail |

## Key Design Decisions
- Transaction numbers auto-generated (TXN prefix)
- Invoice numbers auto-generated (INV prefix)
- All amounts stored as text for precision
- Webhook processing is idempotent
- Every status change logged in paymentLog

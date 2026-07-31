# BUS-PAYMENT-01 — Security

## Webhook Security
- Signature validation per provider
- Replay protection via paymentWebhook table
- Idempotent processing

## Payment Security
- Server-side price verification via Pricing Engine
- Duplicate payment prevention
- Admin-only refund processing
- CSRF protection on checkout
- All admin actions logged

## Data Security
- Provider credentials stored encrypted
- Webhook payloads logged but not exposed
- Refund reasons tracked for compliance

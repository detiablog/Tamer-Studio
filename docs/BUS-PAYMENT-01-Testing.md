# BUS-PAYMENT-01 — Testing Checklist

## Checkout
- [ ] Create checkout with single product
- [ ] Price calculated by Pricing Engine
- [ ] Campaign discounts applied
- [ ] Tax and fees calculated

## Payment Lifecycle
- [ ] Payment created as pending
- [ ] Status transitions logged
- [ ] Duplicate payment prevented
- [ ] Payment expiry handled

## Webhook
- [ ] Signature validated
- [ ] Duplicate webhook ignored
- [ ] Payment status updated
- [ ] Invoice generated on success

## Refund
- [ ] Refund request created
- [ ] Admin approval workflow
- [ ] Payment status updated
- [ ] Audit log created

## Invoices
- [ ] Auto-generated on payment
- [ ] Downloadable
- [ ] Correct data

## Admin
- [ ] Dashboard stats load
- [ ] Transaction list with filters
- [ ] Manual verification works
- [ ] Refund dialog works

## User Dashboard
- [ ] Billing overview loads
- [ ] Payment history shows
- [ ] Invoice list shows

## Build
- [ ] TypeScript passes
- [ ] Build succeeds
- [ ] No runtime errors

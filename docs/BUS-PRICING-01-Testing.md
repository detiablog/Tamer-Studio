# BUS-PRICING-01 — Testing Checklist

## Pricing CRUD
- [ ] Create pricing item
- [ ] Edit pricing item (auto-creates version)
- [ ] Clone pricing item
- [ ] Delete pricing item
- [ ] List with filters (category, status, type)
- [ ] Search by name/code
- [ ] Pagination

## Price Calculation
- [ ] Base price calculation
- [ ] Regional override
- [ ] Campaign discount
- [ ] Coupon discount
- [ ] Tax calculation
- [ ] Fee calculation
- [ ] Full pipeline breakdown

## Regional Pricing
- [ ] Add regional override
- [ ] Price displays in user's currency
- [ ] Fallback to base price

## Versioning
- [ ] Version auto-created on update
- [ ] Version history viewable
- [ ] Version data snapshot correct

## Admin Panel
- [ ] Dashboard stats load
- [ ] All tabs functional
- [ ] Pricing simulator works
- [ ] Tax/fee configuration works

## User Dashboard
- [ ] Plans displayed correctly
- [ ] Regional pricing applied
- [ ] Features listed

## Build
- [ ] TypeScript passes
- [ ] Build succeeds
- [ ] No runtime errors

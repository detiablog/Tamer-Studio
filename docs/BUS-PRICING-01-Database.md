# BUS-PRICING-01 — Database Design

## Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| pricing_item | Central pricing registry | code, slug, category, status, basePrice, salePrice, currency, features |
| pricing_version | Change history | pricingItemId (FK), version, data (jsonb snapshot) |
| pricing_region | Country-specific overrides | pricingItemId (FK), country, currency, overridePrice |
| pricing_tax | Tax rules | name, type (percentage/fixed), rate, country |
| pricing_fee | Service fees | name, type, rate, minAmount, maxAmount |

## Relations
- pricingItem → pricingVersion (one-to-many, cascade delete)
- pricingItem → pricingRegion (one-to-many, cascade delete)

## Indexes
- All FK columns indexed
- code, slug, category, status on pricingItem
- country on pricingRegion
- (pricingItemId, version) unique on pricingVersion
- (pricingItemId, country) unique on pricingRegion

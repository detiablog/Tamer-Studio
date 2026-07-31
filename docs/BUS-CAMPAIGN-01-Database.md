# BUS-CAMPAIGN-01 — Database Design

## Tables

### campaign
Core campaign table with scheduling, targeting, rules.

| Column | Type | Description |
|--------|------|-------------|
| id | text PK | Campaign ID |
| name | text | Campaign name |
| code | varchar unique | Unique campaign code |
| type | varchar | Campaign type |
| status | varchar | draft/scheduled/running/paused/expired/completed/cancelled |
| priority | integer | Higher = shown first |
| starts_at | timestamp | Start date |
| ends_at | timestamp | End date |
| target_audience | jsonb | Audience targeting rules |
| config | jsonb | Campaign configuration |
| rules | jsonb | Discount/promotion rules |

### coupon
Discount codes linked to campaigns.

### couponRedemption
Tracks coupon usage per user.

### voucher
Gift/bonus vouchers with balance.

### voucherClaim
Tracks voucher claims.

### campaignStat
Daily analytics per campaign.
# ANALYTICS-02 — Product Intelligence, Business Analytics & Decision Intelligence Platform

## Overview

The Product Intelligence platform serves as the **Single Source of Truth (SSOT)** for business analytics in Tamer Studio, providing executive dashboards, revenue intelligence, user analytics, AI cost analysis, feature adoption tracking, funnel analytics, retention analysis, churn intelligence, customer segmentation, forecasting, and decision intelligence.

---

## Architecture

### Files Created

#### Database Schema
- `src/lib/db/schema/product-intelligence.ts` — 11 database tables
- `drizzle/0037_create_product_intelligence.sql` — Migration SQL

#### Service Layer
- `src/core/product-intelligence/pi.types.ts` — TypeScript types, interfaces, KPI targets
- `src/core/product-intelligence/pi.service.ts` — Business logic with 18 methods

#### API Routes (19 endpoints)
- `src/app/api/admin/pi/overview/route.ts` — Executive dashboard
- `src/app/api/admin/pi/users/route.ts` — User intelligence
- `src/app/api/admin/pi/revenue/route.ts` — Revenue intelligence
- `src/app/api/admin/pi/subscriptions/route.ts` — Subscription intelligence
- `src/app/api/admin/pi/credits/route.ts` — Credit intelligence
- `src/app/api/admin/pi/ai/route.ts` — AI intelligence
- `src/app/api/admin/pi/features/route.ts` — Feature adoption
- `src/app/api/admin/pi/funnels/route.ts` — Funnel analytics
- `src/app/api/admin/pi/retention/route.ts` — Retention analytics
- `src/app/api/admin/pi/churn/route.ts` — Churn intelligence
- `src/app/api/admin/pi/segments/route.ts` — Customer segmentation
- `src/app/api/admin/pi/publishing/route.ts` — Publishing intelligence
- `src/app/api/admin/pi/projects/route.ts` — Project intelligence
- `src/app/api/admin/pi/forecasts/route.ts` — Forecast engine
- `src/app/api/admin/pi/decisions/route.ts` — Decision intelligence
- `src/app/api/admin/pi/reports/route.ts` — Reports
- `src/app/api/admin/pi/kpis/route.ts` — KPIs
- `src/app/api/admin/pi/settings/route.ts` — Settings

#### Admin Dashboard
- `src/app/admin/(protected)/product-intelligence/page.tsx` — Server component
- `src/app/admin/(protected)/product-intelligence/pageClient.tsx` — 15-tab dashboard (1,300+ lines)

#### Navigation
- `src/components/admin/AdminSidebar.tsx` — Added Product Intelligence entry

#### Localization
- `locales/en.json` — 100+ English translation keys
- `locales/id.json` — 100+ Indonesian translation keys

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `product_kpi` | Operational KPI tracking with targets and trends |
| `product_metric` | Named metric storage with dimensions |
| `product_segment` | Customer segment definitions and counts |
| `product_cohort` | Cohort retention data |
| `product_funnel` | Conversion funnel stages and rates |
| `product_forecast` | Forecast predictions with confidence intervals |
| `product_report` | Generated business reports |
| `product_dashboard` | Custom dashboard configurations |
| `product_decision` | Decision intelligence recommendations |
| `product_export` | Export job tracking |
| `product_settings` | Platform settings |

---

## Dashboard Modules

### Executive Dashboard
- 12 KPI cards: Daily Revenue, Monthly Revenue, MRR, ARR, DAU, MAU, Retention D30, Churn Rate, ARPU, LTV, AI Cost/Gen, Growth Rate
- Platform Health Score
- Trend indicators with change percentages

### User Intelligence
- Registrations, Active/Inactive/Returning users
- Device, Country, Language breakdowns
- Session metrics

### Revenue Intelligence
- Revenue by Country, Plan, Payment Method
- Refunds and Failed Payments
- Revenue trends

### Subscription Intelligence
- Trial Conversion, Upgrade/Downgrade/Cancellation/Renewal rates
- Plan Distribution

### Credit Intelligence
- Credits Purchased/Used/Expired/Refunded
- Credits by Plan and AI Model

### AI Intelligence
- AI Requests, Success/Failure Rates
- Average Cost, Latency
- Provider and Model usage breakdowns
- Quality Scores

### Feature Adoption
- Usage tracking for all platform features
- Adoption rates and trends

### Funnel Analytics
- 10-stage conversion funnel
- Dropoff rates at each stage

### Retention Analytics
- D1, D7, D30, D90 retention
- Cohort retention tables

### Churn Intelligence
- Churn rate, churned users/revenue
- Churn reasons and recovery rate

### Customer Segmentation
- 12 predefined segments with user counts

### Publishing Intelligence
- Publishing success/failure rates by platform

### Forecast Engine
- 12-month forecasts with confidence intervals
- Revenue, user growth, AI cost predictions

### Decision Intelligence
- Automated recommendations with confidence scores
- Pricing, feature, AI optimization, marketing insights

### Reports
- Daily/Weekly/Monthly/Quarterly report generation

---

## API Endpoints

All endpoints require admin authentication with RBAC.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/pi/overview` | Executive dashboard data |
| GET | `/api/admin/pi/users` | User intelligence |
| GET | `/api/admin/pi/revenue` | Revenue intelligence |
| GET | `/api/admin/pi/subscriptions` | Subscription intelligence |
| GET | `/api/admin/pi/credits` | Credit intelligence |
| GET | `/api/admin/pi/ai` | AI intelligence |
| GET | `/api/admin/pi/features` | Feature adoption |
| GET | `/api/admin/pi/funnels` | Funnel analytics |
| GET | `/api/admin/pi/retention` | Retention analytics |
| GET | `/api/admin/pi/churn` | Churn intelligence |
| GET | `/api/admin/pi/segments` | Customer segmentation |
| GET | `/api/admin/pi/publishing` | Publishing intelligence |
| GET | `/api/admin/pi/projects` | Project intelligence |
| GET | `/api/admin/pi/forecasts` | Forecast engine |
| GET | `/api/admin/pi/decisions` | Decision intelligence |
| GET | `/api/admin/pi/reports` | Reports |
| GET | `/api/admin/pi/kpis` | KPIs |
| GET | `/api/admin/pi/settings` | Settings |

---

## KPI Targets

| Metric | Target | Category |
|--------|--------|----------|
| MRR | $50,000 | revenue |
| ARR | $600,000 | revenue |
| DAU | 1,000 | users |
| MAU | 10,000 | users |
| Retention D30 | 40% | retention |
| Churn Rate | < 5% | retention |
| ARPU | $29.99 | revenue |
| AI Success Rate | > 99% | ai |
| AI Cost/Gen | < $0.05 | ai |
| Credit Utilization | > 70% | credits |
| Trial Conversion | > 15% | subscriptions |
| Feature Adoption | > 60% | features |

---

## Dependencies

Reuses existing infrastructure:
- Analytics Engine (event tracking, metrics)
- AI Gateway (request logs, routing decisions, model registry)
- Billing System (wallets, credit transactions, subscriptions)
- Payments (payment records, refunds)
- Commerce (orders, plans)
- Repository Pattern
- Service Layer
- Middleware System

---

## Data Sources

The PI service aggregates data from these existing tables:
- `analytics_event` — User events, feature usage, sessions
- `payment` / `payment_refund` — Revenue, refunds
- `wallet` / `credit_transaction` — Credit balances, transactions
- `subscription` / `invoice` — Subscription lifecycle
- `ai_request_log` / `ai_routing_decision` — AI usage, costs
- `commerce_order` / `plan` — Orders, plan distribution
- `workspace_metrics` — Workspace activity
- `usage_record` — Detailed AI usage per execution

---

## Localization

All UI strings support English (en) and Bahasa Indonesia (id) with fallback pattern:
```typescript
t("pi.key", "Fallback text")
```

---

## Notes

- TypeScript compilation passes cleanly for all PI files
- ESLint shows only `any` type warnings (consistent with existing codebase)
- Build includes all 19 API routes and the admin dashboard
- Database migrations should be applied via `npx drizzle-kit push` or SQL execution
- The PI service gracefully handles empty tables with default/zero values
- Forecasts use simple linear regression on historical data
- Decision intelligence generates recommendations based on metric thresholds
